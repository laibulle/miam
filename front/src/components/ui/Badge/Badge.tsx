import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';

export type BadgeTone = 'green' | 'warm' | 'neutral';

export interface BadgeProps {
  value: string;
  tone?: BadgeTone;
}

export function Badge({ value, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={[styles.label, toneLabelStyles[tone]]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.bodyMBold,
  },
});

const toneStyles = StyleSheet.create({
  green: { backgroundColor: colors.sage.tint },
  warm: { backgroundColor: colors.gold.tint },
  neutral: { backgroundColor: colors.surfaceSunken },
});

const toneLabelStyles = StyleSheet.create({
  green: { color: colors.sage.strong },
  warm: { color: colors.gold.strong },
  neutral: { color: colors.inkMuted },
});
