import type { Meta, StoryObj } from '@storybook/react';

import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'ui/Chip',
  component: Chip,
  args: {
    label: 'Végétarien',
    onPress: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true, label: 'Omnivore' } };
