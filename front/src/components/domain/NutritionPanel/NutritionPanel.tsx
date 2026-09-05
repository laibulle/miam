import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { FoodFacts } from '../../../domain/recipe';
import { SegmentedControl } from '../../ui/SegmentedControl/SegmentedControl';
import { colors, spacing, typography } from '../../ui/tokens';
import { NutritionTile } from '../NutritionTile/NutritionTile';

export function NutritionPanel({ facts }: { facts: FoodFacts }) {
  const [basis, setBasis] = useState(0);
  const serving = basis === 0 ? facts.per_serving : undefined;
  const values = serving ?? {
    energy_kcal: facts.energy100,
    protein_g: facts.prot100,
    carb_g: facts.carb100,
    fat_g: facts.fat100,
    fiber_g: facts.fiber100,
  };

  return (
    <View style={styles.panel}>
      {facts.per_serving ? (
        <SegmentedControl
          options={[{ value: 0, label: 'Par portion' }, { value: 1, label: 'Pour 100 g' }]}
          value={basis}
          onChange={setBasis}
        />
      ) : null}
      <Text style={styles.hint}>
        {serving ? 'Apports estimés pour une portion' : 'Apports estimés pour 100 g'}
      </Text>
      {!facts.per_serving ? (
        <Text style={styles.hint}>Les apports par portion ne sont pas disponibles pour cette recette.</Text>
      ) : null}
      <View style={styles.grid}>
        <NutritionTile label="Calories" value={values.energy_kcal} unit="kcal" />
        <NutritionTile label="Protéines" value={values.protein_g} unit="g" />
        <NutritionTile label="Glucides" value={values.carb_g} unit="g" />
        <NutritionTile label="Lipides" value={values.fat_g} unit="g" />
        <NutritionTile label="Fibres" value={values.fiber_g} unit="g" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  hint: { ...typography.bodyM, color: colors.inkMuted },
});
