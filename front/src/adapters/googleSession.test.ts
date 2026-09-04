import { createGoogleSession, getGoogleSignInConfig } from './googleSession';

const originalFetch = global.fetch;
const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const originalSessionPath = process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH;

beforeEach(() => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = '123-test.apps.googleusercontent.com';
  process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH = '/test-google-session';
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  else process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
  if (originalSessionPath === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH;
  else process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH = originalSessionPath;
});

it('keeps sign-in unavailable without a configured session endpoint', async () => {
  delete process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH;
  expect(getGoogleSignInConfig()).toBeNull();
  await expect(createGoogleSession('test-token', new AbortController().signal)).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

it.each(['https://other.example/session', '//other.example/session', '/\\other.example/session'])
('does not send credentials to an external destination: %s', async (path) => {
  process.env.EXPO_PUBLIC_GOOGLE_SESSION_PATH = path;
  await expect(createGoogleSession('test-token', new AbortController().signal)).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

it('requires an explicit Google web client ID instead of autoDetect', () => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'autoDetect';
  expect(getGoogleSignInConfig()).toBeNull();
});

it('posts the credential without URL parameters and accepts the server session confirmation', async () => {
  (fetch as jest.Mock).mockResolvedValue({ status: 204 });
  const signal = new AbortController().signal;
  await expect(createGoogleSession('test-token', signal)).resolves.toBeUndefined();
  expect(fetch).toHaveBeenCalledWith('/test-google-session', {
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
