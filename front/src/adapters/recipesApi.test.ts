import { generateRecipe, RecipesApiError } from './recipesApi';
import type { PromptInput } from '../domain/recipe';

const input: PromptInput = {
  prompt: 'Un plat healthy avec des frites et une sauce',
  activity_level: 3,
  age: 30,
  gender: 'female',
  height_cm: 170,
  weight_kg: 70,
  sports: ['Course à pied'],
  country: 'France',
  month: 9,
};

const validResponse = {
  success: true,
  recipe: {
    recipe: {
      name: 'Frites de patate douce au four',
      preparation_duration_minutes: 15,
      cooking_duration_minutes: 35,
      description: 'Une version plus légère.',
      servings: 2,
      ingredients: [{ name: 'Patate douce', quantity: 600, unit: 'g' }],
      steps: [
        { abstract: 'Préparer', long_description: 'Laver et couper.', duration: null, timer: false, wait_for_end: true },
      ],
      tips: ['Ne pas éplucher.'],
    },
    nutritionist_quote: 'Bon équilibre.',
    nutritionist_score: 8,
    glut_health_expert_quote: 'Probiotiques bienvenus.',
    glut_health_expert_score: 7,
    food_facts: { energy100: 312, fat100: 12, carb100: 42, prot100: 9, fiber100: 4 },
  },
};

describe('generateRecipe', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('posts the prompt input and returns the parsed recipe on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => validResponse,
    }) as unknown as typeof fetch;

    const result = await generateRecipe(input);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/recipes'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      })
    );
    expect(result.success).toBe(true);
    expect(result.recipe?.recipe.name).toBe('Frites de patate douce au four');
  });

  it('throws a RecipesApiError when the network call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
  });

  it('throws a RecipesApiError on a non-ok HTTP response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }) as unknown as typeof fetch;

    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
  });

  it('throws a RecipesApiError when the response body fails schema validation', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: 'yes' }) }) as unknown as typeof fetch;

    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
  });
});
