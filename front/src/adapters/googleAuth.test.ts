import { AuthenticationError, verifyGoogleCredential, getGoogleSignInConfig } from './googleAuth';

const originalFetch = global.fetch;
const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const account = { user_id: `google-${'a'.repeat(64)}` };
const signal = new AbortController().signal;

beforeEach(() => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = '123-test.apps.googleusercontent.com';
  global.fetch = jest.fn();
});
afterEach(() => {
  global.fetch = originalFetch;
  if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  else process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
});

it('keeps the Google button unavailable without a valid client ID', () => {
  delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  expect(getGoogleSignInConfig()).toBeNull();
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'autoDetect';
  expect(getGoogleSignInConfig()).toBeNull();
});

it('verifies a bearer credential without cookies or URL parameters', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => account });
  await expect(verifyGoogleCredential('test-token', signal)).resolves.toEqual(account);
  expect(fetch).toHaveBeenCalledWith('/auth/me', {
    headers: { Authorization: 'Bearer test-token' }, credentials: 'omit',
    redirect: 'error', cache: 'no-store', signal,
  });
});

it('rejects an expired token', async () => {
  (fetch as jest.Mock).mockResolvedValue({ status: 401 });
  await expect(verifyGoogleCredential('test-token', signal)).rejects.toBeInstanceOf(AuthenticationError);
});

it.each([{}, { user_id: 'anonymous' }])('does not accept a malformed identity %j', async response => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => response });
  await expect(verifyGoogleCredential('test-token', signal)).rejects.toThrow();
});

it('does not accept an HTML fallback', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('HTML'); } });
  await expect(verifyGoogleCredential('test-token', signal)).rejects.toThrow();
});

it.each([302, 403, 405, 503])('rejects HTTP %s', async status => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, status });
  await expect(verifyGoogleCredential('test-token', signal)).rejects.toThrow();
});
