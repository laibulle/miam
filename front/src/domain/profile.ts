import { z } from 'zod';

export const genderSchema = z.enum(['female', 'male', 'other']);
export type Gender = z.infer<typeof genderSchema>;

export const profileSchema = z.object({
  age: z.number().int().positive(),
  gender: genderSchema,
  heightCm: z.number().int().positive(),
  weightKg: z.number().int().positive(),
  activityLevel: z.number().int().min(1).max(5),
  sports: z.array(z.string()),
  country: z.string().min(1),
});
export type Profile = z.infer<typeof profileSchema>;

export const defaultProfile: Profile = {
  age: 30,
  gender: 'female',
  heightCm: 170,
  weightKg: 70,
  activityLevel: 3,
  sports: ['Course à pied', 'Musculation'],
  country: 'France',
};

export const genderLabels: Record<Gender, string> = {
  female: 'Femme',
  male: 'Homme',
  other: 'Autre',
};

export const activityLevelLabels: Record<number, string> = {
  1: 'Sédentaire',
  2: 'Peu actif',
  3: 'Modérément actif',
  4: 'Actif',
  5: 'Très actif',
};
