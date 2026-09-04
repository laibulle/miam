import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';

export interface SelectFieldOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: SelectFieldOption<T>[];
  onChange: (value: T) => void;
}

/**
 * A boxed, tap-to-cycle field matching the Penpot "Select" component. Cycles
 * through `options` on press — a picker/modal is unnecessary complexity for
 * the short option lists this screen uses (gender, country region, ...).
 */
export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  const currentIndex = options.findIndex((option) => option.value === value);
  const current = options[currentIndex] ?? options[0];

  const selectNext = () => {
    const nextIndex = (currentIndex + 1) % options.length;
    onChange(options[nextIndex].value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={selectNext}
        style={({ pressed }) => [styles.box, pressed && styles.pressed]}
      >
        <Text style={styles.value}>{current?.label}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    ...typography.bodyM,
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  value: {
    ...typography.bodyMBold,
    color: colors.ink,
  },
  chevron: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
});
