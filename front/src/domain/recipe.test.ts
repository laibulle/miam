import { recipeResponseSchema } from './recipe';

const validRecipe = {
  success: true,
  recipe: {
    recipe: {
      name: 'Frites de patate douce au four',
      preparation_duration_minutes: 15,
      cooking_duration_minutes: 35,
      description: 'Une version plus légère et croustillante.',
      servings: 2,
      ingredients: [{ name: 'Pommes de terre à chair ferme', quantity: 600, unit: 'g' }],
      steps: [
        {
          abstract: 'Préparer les pommes de terre',
          long_description: 'Laver et couper en bâtonnets réguliers.',
          duration: null,
          timer: false,
          wait_for_end: true,
        },
        {
          abstract: 'Faire tremper',
          long_description: 'Plonger les bâtonnets dans un grand bol d’eau froide.',
          duration: 30,
          timer: true,
          wait_for_end: true,
        },
      ],
      tips: ['Ne pas éplucher les pommes de terre.'],
    },
    nutritionist_quote: 'Un bon équilibre.',
    nutritionist_score: 8,
    glut_health_expert_quote: 'Le yaourt grec apporte des probiotiques bienvenus.',
    glut_health_expert_score: 7,
    food_facts: { energy100: 312, fat100: 12, carb100: 42, prot100: 9, fiber100: 4 },
  },
};

describe('recipeResponseSchema', () => {
  it('parses a successful backend response', () => {
    const result = recipeResponseSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
  });

  it('parses a failure response with only a description', () => {
    const result = recipeResponseSchema.safeParse({
      success: false,
      description: "Aucune recette n'a pu être générée.",
    });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed step missing required fields', () => {
    const malformed = {
      ...validRecipe,
      recipe: {
        ...validRecipe.recipe,
        recipe: { ...validRecipe.recipe.recipe, steps: [{ abstract: 'x' }] },
      },
    };
    expect(recipeResponseSchema.safeParse(malformed).success).toBe(false);
  });
});
