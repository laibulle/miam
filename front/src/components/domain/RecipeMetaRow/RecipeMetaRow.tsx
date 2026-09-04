import { StyleSheet, View } from 'react-native';

import { spacing } from '../../ui/tokens';
import { Tag } from '../../ui/Tag/Tag';
import { ClockIcon, FlameIcon, PlateIcon } from '../../ui/icons/icons';

export interface RecipeMetaRowProps {
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
}

export function RecipeMetaRow({ preparationMinutes, cookingMinutes, servings }: RecipeMetaRowProps) {
  return (
    <View style={styles.row}>
      <Tag icon={<ClockIcon size={14} />} label={`${preparationMinutes} min prépa`} />
      <Tag icon={<FlameIcon size={14} />} label={`${cookingMinutes} min cuisson`} />
      <Tag icon={<PlateIcon size={14} />} label={`${servings} portions`} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
