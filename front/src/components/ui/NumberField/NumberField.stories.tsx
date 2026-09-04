import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NumberField } from './NumberField';

const meta: Meta<typeof NumberField> = {
  title: 'ui/NumberField',
  component: NumberField,
  args: { label: 'Âge', value: 30, unit: 'ans', onChangeValue: () => {} },
};
export default meta;

type Story = StoryObj<typeof NumberField>;

export const Age: Story = {};
export const Height: Story = { args: { label: 'Taille', value: 170, unit: 'cm' } };

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <NumberField {...args} value={value} onChangeValue={setValue} />;
  },
};
