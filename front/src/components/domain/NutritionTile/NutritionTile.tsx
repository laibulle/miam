import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../ui/tokens';

export interface NutritionTileProps {
  label: string;
  value: number;
  unit: string;
}

export function NutritionTile({ label, value, unit }: NutritionTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} <Text style={styles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 130,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.numeral,
    color: colors.ink,
  },
  unit: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
});
