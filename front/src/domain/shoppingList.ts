import type { MealPlan } from './mealPlan';
import type { Ingredient } from './recipe';

const units: Record<string, { unit: string; factor: number }> = {
  g: { unit: 'g', factor: 1 },
  kg: { unit: 'g', factor: 1000 },
  ml: { unit: 'ml', factor: 1 },
  cl: { unit: 'ml', factor: 10 },
  l: { unit: 'ml', factor: 1000 },
};

const normalize = (text: string) => text.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr');

export function buildShoppingList(menu: MealPlan): Ingredient[] {
  const items = new Map<string, Ingredient>();

  for (const meal of menu.meals) {
    for (const ingredient of meal.ingredients) {
      const normalizedUnit = normalize(ingredient.unit);
      const conversion = units[normalizedUnit] ?? { unit: normalizedUnit, factor: 1 };
      // Keep different ingredients and incompatible units separate.
      const key = JSON.stringify([normalize(ingredient.name), conversion.unit]);
      const quantity = ingredient.quantity * conversion.factor;
      const existing = items.get(key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.set(key, { name: ingredient.name.trim(), quantity, unit: conversion.unit });
      }
    }
  }

  return [...items.values()].map(item => ({
    ...item,
    quantity: Number(item.quantity.toFixed(6)),
  })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
