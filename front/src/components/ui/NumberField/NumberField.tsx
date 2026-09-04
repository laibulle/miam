import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';

export interface NumberFieldProps {
  label: string;
  value: number;
  unit?: string;
  onChangeValue: (value: number) => void;
}

export function NumberField({ label, value, unit, onChangeValue }: NumberFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <TextInput
          accessibilityLabel={label}
          style={styles.value}
          keyboardType="number-pad"
          value={String(value)}
          onChangeText={(text) => {
            const parsed = Number.parseInt(text.replace(/[^0-9]/g, ''), 10);
            onChangeValue(Number.isNaN(parsed) ? 0 : parsed);
          }}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
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
    alignItems: 'baseline',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  value: {
    ...typography.displayM,
    color: colors.ink,
    padding: 0,
    minWidth: 32,
  },
  unit: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
});
