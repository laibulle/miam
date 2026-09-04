import type { Meta, StoryObj } from '@storybook/react';

import { TimerTrigger } from './TimerTrigger';

const meta: Meta<typeof TimerTrigger> = {
  title: 'ui/TimerTrigger',
  component: TimerTrigger,
  args: { label: 'Lancer 30 min', onPress: () => {} },
};
export default meta;

type Story = StoryObj<typeof TimerTrigger>;

export const Default: Story = {};
