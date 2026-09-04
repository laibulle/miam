/** @jest-environment jsdom */
import { mountGoogleSignIn } from './googleIdentity.web';

let callback: (response: unknown) => void;
const sdk = {
  initialize: jest.fn((options) => { callback = options.callback; }),
  renderButton: jest.fn(),
};
const googleWindow = window as Window & { google?: unknown };

beforeEach(() => {
  jest.clearAllMocks();
  document.head.replaceChildren();
  googleWindow.google = { accounts: { id: sdk } };
});

afterEach(() => { delete googleWindow.google; });

it('renders the official button without automatically prompting the user', async () => {
  const host = document.createElement('div');
  await mountGoogleSignIn(host, 'test.apps.googleusercontent.com', jest.fn(), jest.fn(), new AbortController().signal);
  expect(sdk.initialize).toHaveBeenCalledWith(expect.objectContaining({ auto_select: false, ux_mode: 'popup' }));
  expect(sdk.renderButton).toHaveBeenCalledWith(host, expect.objectContaining({ shape: 'pill', text: 'continue_with' }));
});

it('forwards a credential only after validating the Google response shape', async () => {
  const onCredential = jest.fn();
  const onError = jest.fn();
  await mountGoogleSignIn(document.createElement('div'), 'test', onCredential, onError, new AbortController().signal);
  callback({ credential: '' });
  callback({ credential: 123 });
  expect(onCredential).not.toHaveBeenCalled();
  expect(onError).toHaveBeenCalledTimes(2);
  callback({ credential: 'test-token' });
  expect(onCredential).toHaveBeenCalledWith('test-token');
});

it('ignores Google responses and removes the button after leaving the screen', async () => {
  const host = document.createElement('div');
  host.appendChild(document.createElement('iframe'));
  const controller = new AbortController();
  const onCredential = jest.fn();
  await mountGoogleSignIn(host, 'test', onCredential, jest.fn(), controller.signal);
  controller.abort();
  callback({ credential: 'late-token' });
  expect(onCredential).not.toHaveBeenCalled();
  expect(host.childElementCount).toBe(0);
});

it('loads the official script once, reports a failure, and allows a retry', async () => {
  delete googleWindow.google;
  const mount = () => mountGoogleSignIn(document.createElement('div'), 'test', jest.fn(), jest.fn(), new AbortController().signal);
  const first = mount();
  const second = mount();
  const scripts = document.head.querySelectorAll('script');
  expect(scripts).toHaveLength(1);
  expect(scripts[0].src).toBe('https://accounts.google.com/gsi/client');
  const firstError = expect(first).rejects.toThrow('Impossible de charger');
  const secondError = expect(second).rejects.toThrow('Impossible de charger');
  scripts[0].dispatchEvent(new Event('error'));
  await Promise.all([firstError, secondError]);
  expect(document.head.querySelector('script')).toBeNull();

  const retry = mount();
  googleWindow.google = { accounts: { id: sdk } };
  document.head.querySelector('script')!.dispatchEvent(new Event('load'));
  await retry;
  expect(sdk.renderButton).toHaveBeenCalledTimes(1);
});
