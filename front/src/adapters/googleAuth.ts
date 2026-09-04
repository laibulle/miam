import { z } from 'zod';

const accountSchema = z.object({ user_id: z.string().regex(/^google-[a-f0-9]{64}$/) });
export type GoogleAccount = { credential: string; userId: string };
export class AuthenticationError extends Error {}

export function getGoogleSignInConfig() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId || !/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId)) return null;
  return { clientId };
}

/** Verify the Google token without creating a server-side login session. */
export async function verifyGoogleCredential(credential: string, signal: AbortSignal) {
  const response = await fetch('/auth/me', {
    headers: { Authorization: `Bearer ${credential}` },
    credentials: 'omit', cache: 'no-store', redirect: 'error', signal,
  });
  if (response.status === 401) throw new AuthenticationError('Invalid or expired Google identity.');
  if (!response.ok) throw new Error('Google sign-in is unavailable.');
  return accountSchema.parse(await response.json());
}
