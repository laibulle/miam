import { createGoogleSession } from '../../adapters/googleSession';
import { useAuthStore } from './useAuthStore';

jest.mock('../../adapters/googleSession', () => ({ createGoogleSession: jest.fn() }));
const createSession = createGoogleSession as jest.Mock;

beforeEach(() => {
  useAuthStore.setState({ authenticated: false });
  createSession.mockReset();
});

it('keeps access closed until the server confirms the session', async () => {
  let confirm!: () => void;
  createSession.mockReturnValue(new Promise<void>((resolve) => { confirm = resolve; }));
  const pending = useAuthStore.getState().signIn('test-token', new AbortController().signal);
  expect(useAuthStore.getState().authenticated).toBe(false);
  confirm();
  await pending;
  expect(useAuthStore.getState().authenticated).toBe(true);
});

it('keeps access closed when configuration, network, or authentication fails', async () => {
  createSession.mockRejectedValue(new Error('Session rejected'));
  await expect(useAuthStore.getState().signIn('test-token', new AbortController().signal)).rejects.toThrow();
  expect(useAuthStore.getState().authenticated).toBe(false);
});

it('does not authenticate from a late response after leaving the sign-in screen', async () => {
  let confirm!: () => void;
  createSession.mockReturnValue(new Promise<void>((resolve) => { confirm = resolve; }));
  const controller = new AbortController();
  const pending = useAuthStore.getState().signIn('test-token', controller.signal);
  controller.abort();
  confirm();
  await expect(pending).rejects.toThrow('Connexion annulée');
  expect(useAuthStore.getState().authenticated).toBe(false);
});

it('does not send an already cancelled sign-in attempt', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(useAuthStore.getState().signIn('test-token', controller.signal)).rejects.toThrow();
  expect(createSession).not.toHaveBeenCalled();
  expect(useAuthStore.getState().authenticated).toBe(false);
});
