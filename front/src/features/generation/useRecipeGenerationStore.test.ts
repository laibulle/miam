import { AuthenticationError } from '../../adapters/googleAuth';
import { useAuthStore } from '../auth/useAuthStore';
import { defaultProfile } from '../../domain/profile';
import { generateRecipe } from '../../adapters/recipesApi';
import { useRecipeGenerationStore } from './useRecipeGenerationStore';

jest.mock('../../adapters/googleAuth', () => ({ AuthenticationError: class AuthenticationError extends Error {} }));

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
    useRecipeGenerationStore.getState().reset();
    useAuthStore.setState({ authenticated: true, account: { userId: 'google-user', credential: 'test-token' } });
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
      }), { userId: 'google-user', credential: 'test-token' }, expect.any(AbortSignal)
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

it('returns to sign-in and clears the token after an API authentication error', async () => {
  useAuthStore.setState({ authenticated: true, account: { userId: 'google-user', credential: 'test-token' } });
  mockedGenerateRecipe.mockRejectedValue(new AuthenticationError('Token expired.'));
  await useRecipeGenerationStore.getState().generate(defaultProfile);
  expect(useAuthStore.getState()).toMatchObject({ authenticated: false, account: null, notice: 'Token expired.' });
  expect(useRecipeGenerationStore.getState().result).toBeNull();
});

it('ignores a response from a request cancelled on logout', async () => {
  useAuthStore.setState({ authenticated: true, account: { userId: 'google-user', credential: 'test-token' } });
  let finish!: (value: unknown) => void;
  mockedGenerateRecipe.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const pending = useRecipeGenerationStore.getState().generate(defaultProfile);
  const signal = mockedGenerateRecipe.mock.calls.at(-1)[2];
  useRecipeGenerationStore.getState().reset();
  expect(signal.aborted).toBe(true);
  finish({ success: true, recipe: finalRecipeFixture });
  await pending;
  expect(useRecipeGenerationStore.getState()).toMatchObject({ status: 'idle', result: null });
});
