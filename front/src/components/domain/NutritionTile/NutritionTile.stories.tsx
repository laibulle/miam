import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { NutritionTile } from './NutritionTile';

const meta: Meta<typeof NutritionTile> = {
  title: 'domain/NutritionTile',
  component: NutritionTile,
  args: { label: 'Calories', value: 312, unit: 'kcal' },
};
export default meta;

type Story = StoryObj<typeof NutritionTile>;

export const Default: Story = {};

export const Grid: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: 280 }}>
      <NutritionTile label="Calories" value={312} unit="kcal" />
      <NutritionTile label="Protéines" value={9} unit="g" />
      <NutritionTile label="Glucides" value={42} unit="g" />
      <NutritionTile label="Lipides" value={12} unit="g" />
    </View>
  ),
};
