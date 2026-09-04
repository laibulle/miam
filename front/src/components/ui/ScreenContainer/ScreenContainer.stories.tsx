import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';

import { colors, typography } from '../tokens';
import { ScreenContainer } from './ScreenContainer';

const meta: Meta<typeof ScreenContainer> = {
  title: 'ui/ScreenContainer',
  component: ScreenContainer,
};
export default meta;

type Story = StoryObj<typeof ScreenContainer>;

export const Scroll: Story = {
  render: () => (
    <ScreenContainer>
      <Text style={{ ...typography.displayL, color: colors.ink }}>Contenu défilant</Text>
      <Text style={{ ...typography.bodyL, color: colors.inkMuted }}>
        La colonne s'adapte à l'écran jusqu'à 800 px, centrée sur le fond crème.
      </Text>
    </ScreenContainer>
  ),
};

export const Centered: Story = {
  render: () => (
    <ScreenContainer variant="center">
      <Text style={{ ...typography.displayXl, color: colors.ink }}>Contenu centré</Text>
    </ScreenContainer>
  ),
};
