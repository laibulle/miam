import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ComposerCard } from './ComposerCard';

const meta: Meta<typeof ComposerCard> = {
  title: 'domain/ComposerCard',
  component: ComposerCard,
  args: { value: '', onChangeText: () => {}, onSubmit: () => {} },
};
export default meta;

type Story = StoryObj<typeof ComposerCard>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: 'Un plat healthy avec des frites et une sauce' } };
export const Loading: Story = { args: { disabled: true, helperText: 'Miam réfléchit…' } };

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <ComposerCard {...args} value={value} onChangeText={setValue} />;
  },
};
