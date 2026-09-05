import { z } from 'zod';

import { ingredientSchema } from './recipe';

export const mealPlanSchema = z.object({
  meals: z.array(z.object({
    day: z.number().int(),
    meal: z.string(),
    recipe_title: z.string(),
    ingredients: z.array(ingredientSchema),
  })).min(1),
  user_instructions: z.string(),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;
