import { formatCountdown, formatDuration } from './time';

describe('formatDuration', () => {
  it.each([
    [0, '0 s'],
    [30, '30 s'],
    [59, '59 s'],
    [60, '1 min'],
    [120, '2 min'],
    [150, '2 min 30 s'],
    [1800, '30 min'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('formatCountdown', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(9)).toBe('00:09');
    expect(formatCountdown(65)).toBe('01:05');
    expect(formatCountdown(1104)).toBe('18:24');
  });

  it('clamps negative values to zero', () => {
    expect(formatCountdown(-5)).toBe('00:00');
  });
});
