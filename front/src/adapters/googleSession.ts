const UNAVAILABLE = 'La connexion Google est indisponible pour le moment.';

export function getGoogleSignInConfig() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const sessionPath = process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH?.trim();
  // A deliberately configured, same-origin endpoint only. No guessed auth route.
  if (!clientId || !/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId)
    || !sessionPath || !/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(sessionPath)) return null;
  return { clientId, sessionPath };
}

/** Contract: verify the Google ID token, set an HttpOnly session cookie, return 204. */
export async function createGoogleSession(credential: string, signal: AbortSignal): Promise<void> {
  const config = getGoogleSignInConfig();
  if (!config) throw new Error(UNAVAILABLE);
  let response: Response;
  try {
    response = await fetch(config.sessionPath, {
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
