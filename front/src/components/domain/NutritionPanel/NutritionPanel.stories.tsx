import type { Meta, StoryObj } from '@storybook/react';

import { NutritionPanel } from './NutritionPanel';

const facts = { energy100: 150, fat100: 5, carb100: 20, prot100: 6, fiber100: 3 };
const meta: Meta<typeof NutritionPanel> = {
  title: 'domain/NutritionPanel',
  component: NutritionPanel,
  args: {
    facts: {
      ...facts,
      per_serving: { energy_kcal: 600, fat_g: 20, carb_g: 80, protein_g: 24, fiber_g: 12.5 },
    },
  },
};
export default meta;
type Story = StoryObj<typeof NutritionPanel>;
export const PerServing: Story = {};
export const LegacyRecipe: Story = { args: { facts } };
