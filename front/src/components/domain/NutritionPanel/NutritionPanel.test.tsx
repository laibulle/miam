import { fireEvent, render, screen } from '@testing-library/react-native';

import { foodFactsSchema } from '../../../domain/recipe';
import { NutritionPanel } from './NutritionPanel';

const legacyFacts = { energy100: 150, fat100: 5, carb100: 20, prot100: 6, fiber100: 3 };
const facts = {
  ...legacyFacts,
  per_serving: { energy_kcal: 600, fat_g: 20, carb_g: 80, protein_g: 24, fiber_g: 12.5 },
};

describe('NutritionPanel', () => {
  it('preserves serving data through parsing and shows it by default, including fiber', async () => {
    await render(<NutritionPanel facts={foodFactsSchema.parse(facts)} />);
    expect(screen.getByText('Apports estimés pour une portion')).toBeTruthy();
    expect(screen.getByText('600 kcal')).toBeTruthy();
    expect(screen.getByText('Fibres')).toBeTruthy();
    expect(screen.getByText('12,5 g')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Pour 100 g' }));
    expect(screen.getByText('Apports estimés pour 100 g')).toBeTruthy();
    expect(screen.getByText('150 kcal')).toBeTruthy();
    expect(screen.getByText('3 g')).toBeTruthy();
    expect(screen.queryByText('600 kcal')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Par portion' }));
    expect(screen.getByText('600 kcal')).toBeTruthy();
  });

  it('labels legacy values per 100 g without inventing serving values', async () => {
    await render(<NutritionPanel facts={foodFactsSchema.parse(legacyFacts)} />);
    expect(screen.getByText('Apports estimés pour 100 g')).toBeTruthy();
    expect(screen.getByText('150 kcal')).toBeTruthy();
    expect(screen.getByText('Fibres')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Par portion' })).toBeNull();
  });
});
