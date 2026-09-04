import type { Meta, StoryObj } from '@storybook/react';

import { ClockIcon } from '../icons/icons';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'ui/Tag',
  component: Tag,
  args: { label: '15 min prépa', icon: <ClockIcon size={14} /> },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {};
export const NoIcon: Story = { args: { icon: undefined, label: '2 portions' } };
