import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';

export interface TagProps {
  label: string;
  icon?: ReactNode;
}

export function Tag({ label, icon }: TagProps) {
  return (
    <View style={styles.base}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSunken,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
    color: colors.inkMuted,
  },
});
