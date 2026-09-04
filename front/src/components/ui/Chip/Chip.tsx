import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected ? styles.selected : styles.unselected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  selected: {
    backgroundColor: colors.coral.DEFAULT,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...typography.bodyMBold,
  },
  labelSelected: {
    color: colors.onColor,
  },
  labelUnselected: {
    color: colors.ink,
  },
});
