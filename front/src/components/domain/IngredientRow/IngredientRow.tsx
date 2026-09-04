import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../ui/tokens';
import type { Ingredient } from '../../../domain/recipe';

export interface IngredientRowProps {
  ingredient: Ingredient;
}

export function IngredientRow({ ingredient }: IngredientRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{ingredient.name}</Text>
      <Text style={styles.quantity}>
        {ingredient.quantity} {ingredient.unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  name: {
    ...typography.bodyL,
    color: colors.ink,
    flexShrink: 1,
    paddingRight: spacing.md,
  },
  quantity: {
    ...typography.bodyMBold,
    color: colors.inkMuted,
  },
});
