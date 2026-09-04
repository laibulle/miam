import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'ui/Badge',
  component: Badge,
  args: { value: '8/10' },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Green: Story = { args: { tone: 'green' } };
export const Warm: Story = { args: { tone: 'warm', value: '7/10' } };
export const Neutral: Story = { args: { tone: 'neutral', value: 'Nouveau' } };
