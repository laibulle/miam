import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';

export interface SegmentedControlOption {
  value: number;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: number;
  onChange: (value: number) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
  },
  segmentSelected: {
    backgroundColor: colors.coral.DEFAULT,
  },
  label: {
    ...typography.bodyMBold,
    color: colors.inkMuted,
  },
  labelSelected: {
    color: colors.onColor,
  },
});
