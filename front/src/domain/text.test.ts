import { decodeResponseText, decodeTextEntities } from './text';

describe('decodeTextEntities', () => {
  it.each([
    ['P&#224;tes', 'Pàtes'],
    ['P&#226;tes', 'Pâtes'],
    ['Cr&#xE8;me &amp; &#339;uf', 'Crème & œuf'],
    ['&Eacute;plucher les p&acirc;tes', 'Éplucher les pâtes'],
    ['Cr&amp;#232;me', 'Crème'],
    ['Déjà français', 'Déjà français'],
    ['&#99999999; &#xD800; &unknown;', '&#99999999; &#xD800; &unknown;'],
  ])('decodes %s without interpreting HTML', (input, expected) => {
    expect(decodeTextEntities(input)).toBe(expected);
  });

  it('preserves keys, structure, numbers, flags and nulls', () => {
    expect(decodeResponseText({ 'cl&eacute;': [{ name: 'P&#226;tes', duration: 60, timer: true, other: null }] }))
      .toEqual({ 'cl&eacute;': [{ name: 'Pâtes', duration: 60, timer: true, other: null }] });
  });
});
