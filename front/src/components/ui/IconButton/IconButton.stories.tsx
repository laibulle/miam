import type { Meta, StoryObj } from '@storybook/react';

import { colors } from '../tokens';
import { BackIcon, HeartIcon, SettingsIcon } from '../icons/icons';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'ui/IconButton',
  component: IconButton,
  args: { icon: <BackIcon />, accessibilityLabel: 'Retour', onPress: () => {} },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Back: Story = {};
export const Settings: Story = {
  args: { icon: <SettingsIcon size={24} />, accessibilityLabel: 'Réglages', variant: 'plain' },
};
export const Favorite: Story = {
  args: { icon: <HeartIcon />, accessibilityLabel: 'Ajouter aux favoris', tint: colors.coral.tint },
};
