import { z } from 'zod';

const UNAVAILABLE = 'La connexion Google est indisponible pour le moment.';
const currentSessionSchema = z.object({ user_id: z.string().regex(/^google-[a-f0-9]{64}$/) });

export async function getCurrentGoogleSession(signal?: AbortSignal) {
  const response = await fetch('/auth/session', {
    credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal,
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(UNAVAILABLE);
  return currentSessionSchema.parse(await response.json());
}

export function getGoogleSignInConfig() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId || !/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId)) return null;
  return { clientId };
}

/** Contract: verify the Google ID token, set an HttpOnly session cookie, return 204. */
export async function createGoogleSession(credential: string, signal: AbortSignal): Promise<void> {
  const config = getGoogleSignInConfig();
  if (!config) throw new Error(UNAVAILABLE);
  let response: Response;
  try {
    response = await fetch('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'Miam' },
      credentials: 'same-origin',
      redirect: 'error',
      cache: 'no-store',
      body: JSON.stringify({ credential }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('Impossible de contacter Miam. Vérifie ta connexion et réessaie.');
  }
  // An HTML fallback or an arbitrary 200 response must never count as a session.
  if (response.status !== 204) throw new Error('La connexion a échoué. Réessaie dans un instant.');
}
