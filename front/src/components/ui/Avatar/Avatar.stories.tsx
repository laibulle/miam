import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'ui/Avatar',
  component: Avatar,
  args: { initials: 'CB' },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
export const Small: Story = { args: { size: 28 } };
