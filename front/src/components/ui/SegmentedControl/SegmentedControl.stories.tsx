import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { SegmentedControl } from './SegmentedControl';

const options = [1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }));

const meta: Meta<typeof SegmentedControl> = {
  title: 'ui/SegmentedControl',
  component: SegmentedControl,
  args: { options, value: 3, onChange: () => {} },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
};
