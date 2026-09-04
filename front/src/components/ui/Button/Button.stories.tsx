import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'ui/Button',
  component: Button,
  args: {
    label: 'Continuer',
    onPress: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', label: 'Passer' } };
export const Ghost: Story = { args: { variant: 'ghost', label: "J'ai déjà un compte" } };
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };
export const FullWidth: Story = { args: { variant: 'primary', fullWidth: true, label: 'Générer ma recette' } };
