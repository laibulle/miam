import { z } from 'zod';

/**
 * Mirrors app/domain/models.py exactly (field names and shape are the wire
 * contract with the backend agent). Keep in sync with that file.
 */

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

export const recipeStepSchema = z.object({
  abstract: z.string(),
  long_description: z.string(),
  duration: z.number().nullable().default(null),
  timer: z.boolean(),
  wait_for_end: z.boolean(),
});
export type RecipeStep = z.infer<typeof recipeStepSchema>;

export const chiefRecipeSchema = z.object({
  name: z.string(),
  preparation_duration_minutes: z.number(),
  cooking_duration_minutes: z.number(),
  description: z.string(),
  servings: z.number(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(recipeStepSchema),
  tips: z.array(z.string()),
});
export type ChiefRecipe = z.infer<typeof chiefRecipeSchema>;

export const foodFactsSchema = z.object({
  energy100: z.number(),
  fat100: z.number(),
  carb100: z.number(),
  prot100: z.number(),
  fiber100: z.number(),
});
export type FoodFacts = z.infer<typeof foodFactsSchema>;

export const finalRecipeSchema = z.object({
  recipe: chiefRecipeSchema,
  nutritionist_quote: z.string(),
  nutritionist_score: z.number(),
  glut_health_expert_quote: z.string(),
  glut_health_expert_score: z.number(),
  food_facts: foodFactsSchema,
});
export type FinalRecipe = z.infer<typeof finalRecipeSchema>;

export const recipeResponseSchema = z.object({
  success: z.boolean(),
  recipe: finalRecipeSchema.nullable().optional(),
  description: z.string().nullable().optional(),
});
export type RecipeResponse = z.infer<typeof recipeResponseSchema>;

export const promptInputSchema = z.object({
  prompt: z.string(),
  activity_level: z.number(),
  age: z.number(),
  gender: z.string(),
  height_cm: z.number(),
  weight_kg: z.number(),
  sports: z.array(z.string()),
  country: z.string(),
  month: z.number(),
});
export type PromptInput = z.infer<typeof promptInputSchema>;
