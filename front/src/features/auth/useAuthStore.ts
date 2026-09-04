import { create } from 'zustand';

import { verifyGoogleCredential, type GoogleAccount } from '../../adapters/googleAuth';

interface AuthState {
  authenticated: boolean;
  account: GoogleAccount | null;
  notice: string | null;
  signIn: (credential: string, signal: AbortSignal) => Promise<void>;
  signOut: (notice?: string) => void;
}

let version = 0;

// Tokens live only in memory: reload, logout or a rejected token requires sign-in.
export const useAuthStore = create<AuthState>((set) => ({
  authenticated: false,
  account: null,
  notice: null,
  signIn: async (credential, signal) => {
    if (signal.aborted) throw new Error('Sign-in cancelled.');
    const attempt = ++version;
    set({ authenticated: false, account: null, notice: null });
    const identity = await verifyGoogleCredential(credential, signal);
    if (signal.aborted || attempt !== version) throw new Error('Sign-in cancelled.');
    set({ authenticated: true, account: { credential, userId: identity.user_id } });
  },
  signOut: (notice) => {
    ++version;
    set({ authenticated: false, account: null, notice: notice ?? null });
  },
}));
