import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';
import { ClockIcon } from '../icons/icons';

export interface TimerTriggerProps {
  label: string;
  onPress: () => void;
}

export function TimerTrigger({ label, onPress }: TimerTriggerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <ClockIcon size={16} color={colors.coral.strong} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.coral.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    ...typography.bodyMBold,
    color: colors.coral.strong,
  },
});
