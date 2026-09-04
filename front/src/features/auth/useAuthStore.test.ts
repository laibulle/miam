import { verifyGoogleCredential } from '../../adapters/googleAuth';
import { useAuthStore } from './useAuthStore';

jest.mock('../../adapters/googleAuth', () => ({ verifyGoogleCredential: jest.fn() }));
const verifyCredential = verifyGoogleCredential as jest.Mock;

beforeEach(() => {
  useAuthStore.getState().signOut();
  verifyCredential.mockReset();
});

it('keeps access closed until the server verifies the token', async () => {
  let confirm!: (value: { user_id: string }) => void;
  verifyCredential.mockReturnValue(new Promise<{ user_id: string }>((resolve) => { confirm = resolve; }));
  const pending = useAuthStore.getState().signIn('test-token', new AbortController().signal);
  expect(useAuthStore.getState().authenticated).toBe(false);
  confirm({ user_id: 'google-user' });
  await pending;
  expect(useAuthStore.getState().authenticated).toBe(true);
});

it('keeps access closed when configuration, network, or authentication fails', async () => {
  verifyCredential.mockRejectedValue(new Error('Token rejected'));
  await expect(useAuthStore.getState().signIn('test-token', new AbortController().signal)).rejects.toThrow();
  expect(useAuthStore.getState().authenticated).toBe(false);
});

it('does not authenticate from a late response after leaving the sign-in screen', async () => {
  let confirm!: (value: { user_id: string }) => void;
  verifyCredential.mockReturnValue(new Promise<{ user_id: string }>((resolve) => { confirm = resolve; }));
  const controller = new AbortController();
  const pending = useAuthStore.getState().signIn('test-token', controller.signal);
  controller.abort();
  confirm({ user_id: 'google-user' });
  await expect(pending).rejects.toThrow('Sign-in cancelled');
  expect(useAuthStore.getState().authenticated).toBe(false);
});

it('does not send an already cancelled sign-in attempt', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(useAuthStore.getState().signIn('test-token', controller.signal)).rejects.toThrow();
  expect(verifyCredential).not.toHaveBeenCalled();
  expect(useAuthStore.getState().authenticated).toBe(false);
});

it('removes the token on logout', async () => {
  verifyCredential.mockResolvedValue({ user_id: 'google-user' });
  await useAuthStore.getState().signIn('test-token', new AbortController().signal);
  expect(useAuthStore.getState().account).toEqual({ userId: 'google-user', credential: 'test-token' });
  useAuthStore.getState().signOut();
  expect(useAuthStore.getState()).toMatchObject({ account: null, authenticated: false });
});

it('does not restore a token from a pending login after logout', async () => {
  let confirm!: (value: { user_id: string }) => void;
  verifyCredential.mockReturnValue(new Promise(resolve => { confirm = resolve; }));
  const pending = useAuthStore.getState().signIn('test-token', new AbortController().signal);
  useAuthStore.getState().signOut();
  confirm({ user_id: 'google-user' });
  await expect(pending).rejects.toThrow('Sign-in cancelled');
  expect(useAuthStore.getState().account).toBeNull();
});
