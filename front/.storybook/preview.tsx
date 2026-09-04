import type { Preview } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import { colors, spacing } from '../src/components/ui/tokens';

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: colors.canvas, padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
