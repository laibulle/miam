import { createGoogleSession, getCurrentGoogleSession, getGoogleSignInConfig } from './googleSession';

const originalFetch = global.fetch;
const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

beforeEach(() => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = '123-test.apps.googleusercontent.com';
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  else process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
});

it('keeps sign-in unavailable without a Google client ID', async () => {
  delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  expect(getGoogleSignInConfig()).toBeNull();
  await expect(createGoogleSession('test-token', new AbortController().signal)).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

it('gets the account ID from the server session', async () => {
  const account = { user_id: `google-${'a'.repeat(64)}` };
  (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => account });
  await expect(getCurrentGoogleSession()).resolves.toEqual(account);
});

it('returns no account for an expired session', async () => {
  (fetch as jest.Mock).mockResolvedValue({ status: 401 });
  await expect(getCurrentGoogleSession()).resolves.toBeNull();
});

it('does not accept an HTML fallback or malformed identity as an account', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => ({ user_id: 'anonymous' }) });
  await expect(getCurrentGoogleSession()).rejects.toThrow();
});

it('requires an explicit Google web client ID instead of autoDetect', () => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'autoDetect';
  expect(getGoogleSignInConfig()).toBeNull();
});

it('posts the credential without URL parameters and accepts the server session confirmation', async () => {
  (fetch as jest.Mock).mockResolvedValue({ status: 204 });
  const signal = new AbortController().signal;
  await expect(createGoogleSession('test-token', signal)).resolves.toBeUndefined();
  expect(fetch).toHaveBeenCalledWith('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'Miam' },
    credentials: 'same-origin', redirect: 'error', cache: 'no-store',
    body: JSON.stringify({ credential: 'test-token' }), signal,
  });
});

it.each([200, 302, 401, 405, 500])('does not accept HTTP %s as an authenticated session', async (status) => {
  (fetch as jest.Mock).mockResolvedValue({ status });
  await expect(createGoogleSession('test-token', new AbortController().signal)).rejects.toThrow();
});

it('never exposes raw network errors or credentials to the UI', async () => {
  (fetch as jest.Mock).mockRejectedValue(new Error('sensitive internal detail'));
  await expect(createGoogleSession('test-token', new AbortController().signal))
    .rejects.toThrow('Impossible de contacter Miam.');
});
