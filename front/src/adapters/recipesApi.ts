import { z } from 'zod';

import { recipeResponseSchema, type PromptInput, type RecipeResponse } from '../domain/recipe';
import { AuthenticationError, type GoogleAccount } from './googleAuth';

// Same ADK routes in every environment. Expo only forwards them during web development.
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const APP_NAME = process.env.EXPO_PUBLIC_ADK_APP_NAME ?? 'app';
const sessionSchema = z.object({ id: z.string().min(1) });
const eventsSchema = z.array(z.object({
  author: z.string(),
  partial: z.boolean().nullish(),
  content: z.object({
    parts: z.array(z.object({
      text: z.string().nullish(),
      thought: z.boolean().nullish(),
    })).nullish(),
  }).nullish(),
}));

export class RecipesApiError extends Error {}

function checkAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error('Requête annulée.');
    error.name = 'AbortError';
    throw error;
  }
}

async function postAdk(path: string, body: unknown, credential: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${credential}` },
      credentials: 'omit',
      redirect: 'error',
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new RecipesApiError('Impossible de contacter Miam. Vérifie ta connexion et réessaie.');
  }
  if (response.status === 401) throw new AuthenticationError('Your session has expired. Please sign in again.');
  if (!response.ok) {
    throw new RecipesApiError("Miam n'a pas réussi à générer de recette. Réessaie dans un instant.");
  }
  try {
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new RecipesApiError('La réponse de Miam est invalide.');
  }
}

export async function generateRecipe(input: PromptInput, account: GoogleAccount, signal?: AbortSignal): Promise<RecipeResponse> {
  checkAborted(signal);
  if (!account?.credential || !account.userId) throw new AuthenticationError('Authentication required.');
  const { userId, credential } = account;
  const session = sessionSchema.safeParse(await postAdk(
    `/apps/${encodeURIComponent(APP_NAME)}/users/${encodeURIComponent(userId)}/sessions`, {}, credential, signal
  ));
  if (!session.success) throw new RecipesApiError('La session Miam est invalide.');

  checkAborted(signal);
  const events = eventsSchema.safeParse(await postAdk('/run', {
    app_name: APP_NAME,
    user_id: userId,
    session_id: session.data.id,
    new_message: { role: 'user', parts: [{ text: JSON.stringify(input) }] },
  }, credential, signal));
  if (!events.success) throw new RecipesApiError('La réponse de Miam est invalide.');

  const editor = [...events.data].reverse().find(event => event.author === 'editor_agent' && !event.partial);
  const text = editor?.content?.parts?.filter(part => !part.thought).map(part => part.text ?? '').join('');
  if (!text) throw new RecipesApiError("Miam n'a pas retourné de recette exploitable.");

  let result: unknown;
  try {
    result = JSON.parse(text);
  } catch {
    throw new RecipesApiError('La réponse de Miam est invalide.');
  }
  const parsed = recipeResponseSchema.safeParse(result);
  if (!parsed.success || (parsed.data.success
    ? !parsed.data.recipe || parsed.data.description != null
    : parsed.data.recipe != null || !parsed.data.description?.trim())) {
    throw new RecipesApiError('La réponse de Miam est invalide.');
  }
  return parsed.data;
}
