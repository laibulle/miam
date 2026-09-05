import { fireEvent, render, screen } from '@testing-library/react-native';

import { MealPlanView } from './MealPlanView';

const menu = {
  meals: [
    { day: 2, meal: 'Dîner', recipe_title: 'Soupe de légumes', ingredients: [] },
    { day: 1, meal: 'Déjeuner', recipe_title: 'Salade de lentilles', ingredients: [] },
    { day: 1, meal: 'Dîner', recipe_title: 'Pâtes aux courgettes',
      ingredients: [{ name: 'Courgettes', quantity: 200, unit: 'g' }] },
  ],
  user_instructions: 'Préparer les lentilles à J−1.\nCongeler la soupe.',
};

it('keeps courses in their own tab and recommendations expandable', async () => {
  await render(<MealPlanView menu={menu} />);
  expect(screen.getByText('2 jours · 3 repas')).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Menu' }).props.accessibilityState.selected).toBe(true);
  expect(screen.queryByText('Courgettes')).toBeNull();
  expect(screen.getByText('Salade de lentilles')).toBeTruthy();
  expect(screen.getByText(menu.user_instructions).props.numberOfLines).toBe(2);
  await fireEvent.press(screen.getByRole('button', { name: 'Recommandations' }));
  expect(screen.getByText(menu.user_instructions).props.numberOfLines).toBeUndefined();

  await fireEvent.press(screen.getByRole('tab', { name: 'Liste de courses' }));
  expect(screen.getByText('Courgettes')).toBeTruthy();
  expect(screen.getByText('200 g')).toBeTruthy();
  expect(screen.queryByText('Pâtes aux courgettes')).toBeNull();
  await fireEvent.press(screen.getByRole('tab', { name: 'Menu' }));
  expect(screen.getByText('Pâtes aux courgettes')).toBeTruthy();
  expect(screen.queryByText('Courgettes')).toBeNull();
});

it('expands and collapses a meal to show its ingredients', async () => {
  await render(<MealPlanView menu={menu} />);
  const meal = () => screen.getByRole('button', { name: 'Dîner : Pâtes aux courgettes' });
  expect(meal().props.accessibilityState.expanded).toBe(false);
  await fireEvent.press(meal());
  expect(meal().props.accessibilityState.expanded).toBe(true);
  expect(screen.getByText('Courgettes')).toBeTruthy();
  expect(screen.getByText('200 g')).toBeTruthy();
  await fireEvent.press(meal());
  expect(screen.queryByText('Courgettes')).toBeNull();
});
