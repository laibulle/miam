import { buildShoppingList } from './shoppingList';
import type { Ingredient } from './recipe';

const menuWith = (...ingredients: Ingredient[]) => ({
  meals: ingredients.map((ingredient, day) => ({
    day, meal: 'Dîner', recipe_title: 'Plat', ingredients: [ingredient],
  })),
  user_instructions: '',
});

it('combines compatible quantities across meals without changing the menu', () => {
  const menu = menuWith(
    { name: ' Courgettes ', quantity: 0.5, unit: 'kg' },
    { name: 'courgettes', quantity: 200, unit: 'g' },
    { name: 'Lait', quantity: 0.5, unit: 'L' },
    { name: 'lait', quantity: 20, unit: 'cl' },
  );
  const original = JSON.stringify(menu);
  expect(buildShoppingList(menu)).toEqual([
    { name: 'Courgettes', quantity: 700, unit: 'g' },
    { name: 'Lait', quantity: 700, unit: 'ml' },
  ]);
  expect(JSON.stringify(menu)).toBe(original);
});

it('keeps different ingredients and incompatible units separate', () => {
  expect(buildShoppingList(menuWith(
    { name: 'Tomates', quantity: 2, unit: 'pièces' },
    { name: 'Tomates', quantity: 300, unit: 'g' },
    { name: 'Tomates séchées', quantity: 50, unit: 'g' },
  ))).toHaveLength(3);
});

it('removes floating-point noise from summed quantities', () => {
  expect(buildShoppingList(menuWith(
    { name: 'Sel', quantity: 0.1, unit: 'g' },
    { name: 'Sel', quantity: 0.2, unit: 'g' },
  ))[0].quantity).toBe(0.3);
});
