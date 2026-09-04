import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { SelectField } from './SelectField';

const meta: Meta<typeof SelectField> = {
  title: 'ui/SelectField',
  component: SelectField,
  args: {
    label: 'Genre',
    value: 'female',
    options: [
      { value: 'female', label: 'Femme' },
      { value: 'male', label: 'Homme' },
      { value: 'other', label: 'Autre' },
    ],
    onChange: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof SelectField>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <SelectField {...args} value={value} onChange={setValue} />;
  },
};
