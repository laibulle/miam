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
        Sur un écran large, cette colonne reste à largeur mobile, centrée sur le fond sombre.
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
