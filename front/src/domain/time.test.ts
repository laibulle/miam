import { formatCountdown } from './time';

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
