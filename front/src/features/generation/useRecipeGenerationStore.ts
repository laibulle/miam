import { create } from 'zustand';

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
  generate: (profile: Profile) => Promise<void>;
}

export const useRecipeGenerationStore = create<GenerationState>((set, get) => ({
  promptText: '',
  status: 'idle',
  result: null,
  errorMessage: null,
  setPromptText: (promptText) => set({ promptText }),
  generate: async (profile) => {
    const { promptText } = get();
    const month = new Date().getMonth() + 1;
    set({ status: 'loading', errorMessage: null });
    try {
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
      });
      if (response.success && response.recipe) {
        set({ status: 'success', result: response.recipe, errorMessage: null });
      } else {
        set({ status: 'error', errorMessage: response.description ?? "Miam n'a pas pu générer de recette." });
      }
    } catch (error) {
      const message = error instanceof RecipesApiError ? error.message : "Une erreur inattendue s'est produite.";
      set({ status: 'error', errorMessage: message });
    }
  },
}));
