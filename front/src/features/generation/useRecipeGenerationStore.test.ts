import { defaultProfile } from '../../domain/profile';
import { generateRecipe } from '../../adapters/recipesApi';
import { useRecipeGenerationStore } from './useRecipeGenerationStore';

jest.mock('../../adapters/recipesApi', () => ({
  generateRecipe: jest.fn(),
  RecipesApiError: class RecipesApiError extends Error {},
}));

const mockedGenerateRecipe = generateRecipe as jest.Mock;

const finalRecipeFixture = {
  recipe: {
    name: 'Frites de patate douce au four',
    preparation_duration_minutes: 15,
    cooking_duration_minutes: 35,
    description: 'Une version plus légère.',
    servings: 2,
    ingredients: [],
    steps: [],
    tips: [],
  },
  nutritionist_quote: 'Bon équilibre.',
  nutritionist_score: 8,
  glut_health_expert_quote: 'Probiotiques bienvenus.',
  glut_health_expert_score: 7,
  food_facts: { energy100: 312, fat100: 12, carb100: 42, prot100: 9, fiber100: 4 },
};

describe('useRecipeGenerationStore', () => {
  beforeEach(() => {
    useRecipeGenerationStore.setState({
      promptText: 'Un plat healthy',
      status: 'idle',
      result: null,
      errorMessage: null,
    });
    mockedGenerateRecipe.mockReset();
  });

  it('stores the recipe on a successful generation', async () => {
    mockedGenerateRecipe.mockResolvedValue({ success: true, recipe: finalRecipeFixture });

    await useRecipeGenerationStore.getState().generate(defaultProfile);

    expect(mockedGenerateRecipe).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'Un plat healthy',
        activity_level: defaultProfile.activityLevel,
        age: defaultProfile.age,
        country: defaultProfile.country,
      })
    );
    expect(useRecipeGenerationStore.getState().status).toBe('success');
    expect(useRecipeGenerationStore.getState().result?.recipe.name).toBe('Frites de patate douce au four');
  });

  it('surfaces the backend description on a graceful failure', async () => {
    mockedGenerateRecipe.mockResolvedValue({ success: false, description: 'Aucune recette trouvée.' });

    await useRecipeGenerationStore.getState().generate(defaultProfile);

    expect(useRecipeGenerationStore.getState().status).toBe('error');
    expect(useRecipeGenerationStore.getState().errorMessage).toBe('Aucune recette trouvée.');
  });

  it('surfaces a message when the adapter throws', async () => {
    mockedGenerateRecipe.mockRejectedValue(new Error('boom'));

    await useRecipeGenerationStore.getState().generate(defaultProfile);

    expect(useRecipeGenerationStore.getState().status).toBe('error');
    expect(useRecipeGenerationStore.getState().errorMessage).toBeTruthy();
  });
});
