import type { Meta, StoryObj } from '@storybook/react';

import { IngredientRow } from './IngredientRow';

const meta: Meta<typeof IngredientRow> = {
  title: 'domain/IngredientRow',
  component: IngredientRow,
  args: { ingredient: { name: 'Pommes de terre à chair ferme', quantity: 600, unit: 'g' } },
};
export default meta;

type Story = StoryObj<typeof IngredientRow>;

export const Default: Story = {};
export const SingleUnit: Story = { args: { ingredient: { name: 'Citron (jus + zeste)', quantity: 1, unit: '' } } };
