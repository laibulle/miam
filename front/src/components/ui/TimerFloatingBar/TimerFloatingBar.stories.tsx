import type { Meta, StoryObj } from '@storybook/react';

import { TimerFloatingBar } from './TimerFloatingBar';

const meta: Meta<typeof TimerFloatingBar> = {
  title: 'ui/TimerFloatingBar',
  component: TimerFloatingBar,
  args: {
    title: 'Cuisson en cours · Étape 4',
    remainingLabel: '18:24',
    isPaused: false,
    onTogglePause: () => {},
    onDismiss: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof TimerFloatingBar>;

export const Running: Story = {};
export const Paused: Story = { args: { isPaused: true } };
