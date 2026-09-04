import { create } from 'zustand';

import { AuthenticationError } from '../../adapters/googleAuth';
import { useAuthStore } from '../auth/useAuthStore';
import { generateRecipe, RecipesApiError } from '../../adapters/recipesApi';
import type { Profile } from '../../domain/profile';
import type { FinalRecipe } from '../../domain/recipe';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface GenerationState {
  promptText: string;
  status: Status;
  result: FinalRecipe | null;
  errorMessage: string | null;
  setPromptText: (text: string) => void;
  reset: () => void;
  generate: (profile: Profile) => Promise<void>;
}

let activeRequest: AbortController | null = null;

export const useRecipeGenerationStore = create<GenerationState>((set, get) => ({
  promptText: '',
  status: 'idle',
  result: null,
  errorMessage: null,
  setPromptText: (promptText) => set({ promptText }),
  reset: () => {
    activeRequest?.abort();
    activeRequest = null;
    set({ promptText: '', status: 'idle', result: null, errorMessage: null });
  },
  generate: async (profile) => {
    activeRequest?.abort();
    const request = new AbortController();
    activeRequest = request;
    const { promptText } = get();
    const month = new Date().getMonth() + 1;
    set({ status: 'loading', result: null, errorMessage: null });
    try {
      const account = useAuthStore.getState().account;
      if (!account) throw new AuthenticationError('Please sign in to continue.');
      const response = await generateRecipe({
        prompt: promptText.trim(),
        activity_level: profile.activityLevel,
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        sports: profile.sports,
        country: profile.country,
        month,
      }, account, request.signal);
      if (activeRequest !== request) return;
      if (response.success && response.recipe) {
        set({ status: 'success', result: response.recipe, errorMessage: null });
      } else {
        set({ status: 'error', errorMessage: response.description ?? "Miam n'a pas pu générer de recette." });
      }
    } catch (error) {
      if (activeRequest !== request) return;
      if (error instanceof AuthenticationError) {
        get().reset();
        useAuthStore.getState().signOut(error.message);
        return;
      }
      const message = error instanceof RecipesApiError ? error.message : "Une erreur inattendue s'est produite.";
      set({ status: 'error', errorMessage: message });
    }
  },
}));
