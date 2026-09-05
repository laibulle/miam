import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MealPlan } from '../../../domain/mealPlan';
import { buildShoppingList } from '../../../domain/shoppingList';
import { IngredientRow } from '../IngredientRow/IngredientRow';
import { colors, radii, spacing, typography } from '../../ui/tokens';

const weekdayNames = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];

export function MealPlanView({ menu }: { menu: MealPlan }) {
  const [tab, setTab] = useState<'menu' | 'shopping'>('menu');
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const days = [...new Set(menu.meals.map(meal => meal.day))].sort((a, b) => a - b);
  const mealTypes = [...new Set(menu.meals.map(meal => meal.meal))];
  const shoppingList = buildShoppingList(menu);

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>Ton menu de la semaine</Text>
        <Text style={styles.summary}>{days.length} {days.length === 1 ? 'jour' : 'jours'} · {menu.meals.length} repas</Text>
      </View>

      {menu.user_instructions.trim() ? (
        <View style={styles.advice}>
          <Pressable accessibilityRole="button" accessibilityLabel="Recommandations"
            accessibilityState={{ expanded: showAdvice }} onPress={() => setShowAdvice(!showAdvice)}
            style={styles.adviceHeading}>
            <Text style={styles.adviceTitle}>Pour bien t’organiser</Text>
            <Text style={styles.toggle}>{showAdvice ? 'Réduire −' : 'Lire la suite +'}</Text>
          </Pressable>
          <Text selectable numberOfLines={showAdvice ? undefined : 2} style={styles.instructions}>
            {menu.user_instructions}
          </Text>
        </View>
      ) : null}

      <View accessibilityRole="tablist" style={styles.tabs}>
        {([{ value: 'menu', label: 'Menu' }, { value: 'shopping', label: 'Liste de courses' }] as const).map(item => (
          <Pressable key={item.value} accessibilityRole="tab" accessibilityState={{ selected: tab === item.value }}
            onPress={() => setTab(item.value)} style={[styles.tab, tab === item.value && styles.activeTab]}>
            <Text style={[styles.tabLabel, tab === item.value && styles.activeTabLabel]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'menu' ? (
        <View style={styles.table}>
          <View style={styles.tableHeading}>
            <View style={styles.daySpacer} />
            <View style={styles.meals}>
              {mealTypes.map(type => <Text key={type} style={[styles.cell, styles.mealLabel]}>{type}</Text>)}
            </View>
          </View>
          {days.map(day => (
            <View key={day} style={styles.day}>
              <Text accessibilityRole="header" style={styles.dayTitle}>{weekdayNames[day] ?? `Jour ${day}`}</Text>
              <View style={styles.meals}>
                {mealTypes.map(type => (
                  <View key={type} style={styles.cell}>
                    {menu.meals.map((meal, index) => {
                      if (meal.day !== day || meal.meal !== type) return null;
                      const expanded = expandedMeal === index;
                      return (
                        <View key={index}>
                          <Pressable accessibilityRole="button"
                            accessibilityLabel={`${meal.meal} : ${meal.recipe_title}`}
                            accessibilityState={{ expanded }}
                            onPress={() => setExpandedMeal(expanded ? null : index)} style={styles.mealButton}>
                            <View style={styles.mealText}>
                              <Text numberOfLines={expanded ? undefined : 2} style={styles.recipeTitle}>{meal.recipe_title}</Text>
                            </View>
                            <Text style={styles.chevron} accessible={false}>{expanded ? '−' : '+'}</Text>
                          </Pressable>
                          {expanded ? (
                            <View style={styles.ingredients}>
                              {meal.ingredients.length ? meal.ingredients.map((ingredient, ingredientIndex) => (
                                <IngredientRow key={ingredientIndex} ingredient={ingredient} />
                              )) : <Text style={styles.summary}>Aucun ingrédient renseigné.</Text>}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.shopping}>
          <Text style={styles.summary}>Quantités totales pour les repas du menu.</Text>
          {shoppingList.length ? shoppingList.map(ingredient => (
            <IngredientRow key={JSON.stringify([ingredient.name, ingredient.unit])} ingredient={ingredient} />
          )) : <Text style={styles.instructions}>Aucun ingrédient renseigné.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  heading: { gap: spacing.xs },
  title: { ...typography.displayL, color: colors.ink },
  summary: { ...typography.caption, color: colors.inkMuted },
  advice: { backgroundColor: colors.sage.tint, borderRadius: radii.md, padding: spacing.md, gap: spacing.xs },
  adviceHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, minHeight: 32 },
  adviceTitle: { ...typography.bodyMBold, color: colors.sage.strong },
  toggle: { ...typography.caption, color: colors.sage.strong },
  instructions: { ...typography.bodyM, color: colors.ink },
  tabs: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.surfaceSunken, borderRadius: radii.sm, padding: spacing.xs },
  tab: { flex: 1, minHeight: 40, justifyContent: 'center', alignItems: 'center', borderRadius: radii.sm },
  activeTab: { backgroundColor: colors.surface },
  tabLabel: { ...typography.bodyMBold, color: colors.inkMuted },
  activeTabLabel: { color: colors.coral.strong },
  table: { backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden' },
  tableHeading: { flexDirection: 'row', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  daySpacer: { width: 48 },
  day: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingHorizontal: spacing.sm },
  dayTitle: { ...typography.caption, color: colors.sage.strong, width: 48, paddingTop: spacing.md },
  meals: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { flex: 1, minWidth: 90 },
  mealButton: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', minHeight: 44, paddingVertical: 6 },
  mealText: { flex: 1, gap: 2 },
  mealLabel: { ...typography.caption, fontSize: 11, lineHeight: 14, color: colors.inkMuted },
  recipeTitle: { ...typography.bodyMBold, fontSize: 13, lineHeight: 17, color: colors.ink },
  chevron: { ...typography.bodyM, color: colors.sage.strong },
  ingredients: { paddingBottom: spacing.sm },
  shopping: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg },
});
