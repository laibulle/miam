import { create } from 'zustand';

import { createGoogleSession } from '../../adapters/googleSession';

interface AuthState {
  authenticated: boolean;
  signIn: (credential: string, signal: AbortSignal) => Promise<void>;
}

// Deliberately not persisted: a reload never trusts a client-side login flag.
// Session restoration requires a server endpoint, which is not available yet.
export const useAuthStore = create<AuthState>((set) => ({
  authenticated: false,
  signIn: async (credential, signal) => {
    if (signal.aborted) throw new Error('Connexion annulée.');
    await createGoogleSession(credential, signal);
    if (signal.aborted) throw new Error('Connexion annulée.');
    set({ authenticated: true });
  },
}));
