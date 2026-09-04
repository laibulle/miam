import type { Meta, StoryObj } from '@storybook/react';

import { RecipeMetaRow } from './RecipeMetaRow';

const meta: Meta<typeof RecipeMetaRow> = {
  title: 'domain/RecipeMetaRow',
  component: RecipeMetaRow,
  args: { preparationMinutes: 15, cookingMinutes: 35, servings: 2 },
};
export default meta;

type Story = StoryObj<typeof RecipeMetaRow>;

export const Default: Story = {};
