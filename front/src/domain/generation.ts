export const seasons = ['printemps', 'ete', 'automne', 'hiver'] as const;
export type Season = (typeof seasons)[number];

export const seasonLabels: Record<Season, string> = {
  printemps: 'Printemps',
  ete: 'Été',
  automne: 'Automne',
  hiver: 'Hiver',
};

export function seasonForMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'ete';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
}
