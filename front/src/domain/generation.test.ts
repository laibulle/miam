import { seasonForMonth } from './generation';

describe('seasonForMonth', () => {
  it('maps calendar months to the French seasons', () => {
    expect(seasonForMonth(1)).toBe('hiver');
    expect(seasonForMonth(4)).toBe('printemps');
    expect(seasonForMonth(7)).toBe('ete');
    expect(seasonForMonth(10)).toBe('automne');
    expect(seasonForMonth(12)).toBe('hiver');
  });
});
