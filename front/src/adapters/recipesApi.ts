import { recipeResponseSchema, type PromptInput, type RecipeResponse } from '../domain/recipe';

/**
 * API contract expected from the backend (out of scope here, see CLAUDE.md):
 * POST {API_BASE_URL}/api/recipes
 *   body: PromptInput (see src/domain/recipe.ts, mirrors app/domain/models.py)
 *   response: RecipeResponse
 *
 * Defaults to '' (same origin): in dev this hits this app's own
 * app/api/recipes+api.ts route, which proxies server-side to the backend —
 * avoiding a cross-origin request (and the CORS preflight it triggers)
 * straight from the browser. Set EXPO_PUBLIC_API_URL to call a backend
 * directly instead (e.g. from a native build, where there's no dev-server
 * proxy to rely on).
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export class RecipesApiError extends Error {}

export async function generateRecipe(input: PromptInput, signal?: AbortSignal): Promise<RecipeResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    });
  } catch {
    throw new RecipesApiError('Impossible de contacter Miam. Vérifie ta connexion et réessaie.');
  }

  if (!response.ok) {
    throw new RecipesApiError("Miam n'a pas réussi à générer de recette. Réessaie dans un instant.");
  }

  const json: unknown = await response.json();
  const parsed = recipeResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new RecipesApiError('La réponse de Miam est invalide.');
  }

  return parsed.data;
}
