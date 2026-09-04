import { Text } from 'react-native';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import RootLayout from '../../../app/_layout';
import { verifyGoogleCredential } from '../../adapters/googleAuth';
import { useAuthStore } from './useAuthStore';

jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../adapters/googleAuth', () => ({ verifyGoogleCredential: jest.fn() }));

const routes = {
  _layout: RootLayout,
  index: () => <Text>Connexion requise</Text>,
  profile: () => <Text>Profil privé</Text>,
  home: () => <Text>Accueil privé</Text>,
  recipe: () => <Text>Recette privée</Text>,
};

beforeEach(() => {
  useAuthStore.setState({ authenticated: false });
  (verifyGoogleCredential as jest.Mock).mockReset();
});

it.each(['/home', '/profile', '/recipe'])('blocks a direct anonymous visit to %s', async (initialUrl) => {
  const navigation = renderRouter(routes, { initialUrl });
  await navigation;
  expect(screen.getByText('Connexion requise')).toBeTruthy();
  expect(screen.queryByText(/privé/)).toBeNull();
  expect(navigation.getPathname()).toBe('/');
});

it('opens onboarding only after the server confirms authentication', async () => {
  const navigation = renderRouter(routes);
  await navigation;
  (verifyGoogleCredential as jest.Mock).mockResolvedValue({ user_id: 'google-user' });
  await act(() => useAuthStore.getState().signIn('test-token', new AbortController().signal));
  expect(screen.getByText('Profil privé')).toBeTruthy();
  expect(screen.queryByText('Connexion requise')).toBeNull();
  expect(navigation.getPathname()).toBe('/profile');
});

it('returns to sign-in when an API call invalidates authentication', async () => {
  const navigation = renderRouter(routes);
  await navigation;
  (verifyGoogleCredential as jest.Mock).mockResolvedValue({ user_id: 'google-user' });
  await act(() => useAuthStore.getState().signIn('token', new AbortController().signal));
  await act(() => useAuthStore.getState().signOut('Please sign in again.'));
  expect(screen.getByText('Connexion requise')).toBeTruthy();
  expect(screen.queryByText('Profil privé')).toBeNull();
  expect(navigation.getPathname()).toBe('/');
});
