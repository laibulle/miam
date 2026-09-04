import { act, renderHook } from '@testing-library/react-native';

import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts down one second at a time after start', async () => {
    const { result } = await renderHook(() => useCountdown());

    await act(() => result.current.start(3));
    expect(result.current.remainingSeconds).toBe(3);
    expect(result.current.status).toBe('running');

    await act(() => jest.advanceTimersByTime(1000));
    expect(result.current.remainingSeconds).toBe(2);

    await act(() => jest.advanceTimersByTime(2000));
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.status).toBe('done');
  });

  it('pauses and resumes without losing the remaining time', async () => {
    const { result } = await renderHook(() => useCountdown());

    await act(() => result.current.start(5));
    await act(() => jest.advanceTimersByTime(1000));
    await act(() => result.current.togglePause());
    expect(result.current.status).toBe('paused');

    await act(() => jest.advanceTimersByTime(3000));
    expect(result.current.remainingSeconds).toBe(4);

    await act(() => result.current.togglePause());
    expect(result.current.status).toBe('running');
    await act(() => jest.advanceTimersByTime(1000));
    expect(result.current.remainingSeconds).toBe(3);
  });

  it('dismiss resets to idle', async () => {
    const { result } = await renderHook(() => useCountdown());

    await act(() => result.current.start(10));
    await act(() => result.current.dismiss());

    expect(result.current.status).toBe('idle');
    expect(result.current.remainingSeconds).toBe(0);
  });
});
