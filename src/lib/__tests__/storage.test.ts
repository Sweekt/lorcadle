import { describe, it, expect, beforeEach } from 'vitest';
import { loadModeState, recordGuess, createMemoryStorage } from '../storage';

describe('storage persistence and daily streak rollover', () => {
  let store: Storage;

  beforeEach(() => {
    store = createMemoryStorage();
  });

  it('initializes an empty daily state for a new player', () => {
    const state = loadModeState('2026-10-15', 'card', store);
    expect(state).toEqual({
      dateKey: '2026-10-15',
      mode: 'card',
      guessedIds: [],
      won: false,
      currentStreak: 0,
      maxStreak: 0,
      lastWonDateKey: null,
      totalWins: 0,
    });
  });

  it('records guesses, increments streak on win, and resets board at midnight while keeping streak', () => {
    recordGuess('2026-10-15', 'card', 10, false, store);
    const wonDay1 = recordGuess('2026-10-15', 'card', 25, true, store);

    expect(wonDay1.guessedIds).toEqual([25, 10]);
    expect(wonDay1.won).toBe(true);
    expect(wonDay1.currentStreak).toBe(1);
    expect(wonDay1.maxStreak).toBe(1);
    expect(wonDay1.totalWins).toBe(1);

    // Next day (2026-10-16): guesses reset, won resets, streak preserved
    const nextDay = loadModeState('2026-10-16', 'card', store);
    expect(nextDay.guessedIds).toEqual([]);
    expect(nextDay.won).toBe(false);
    expect(nextDay.currentStreak).toBe(1);
    expect(nextDay.lastWonDateKey).toBe('2026-10-15');

    // Winning on 2026-10-16 increments streak to 2
    const wonDay2 = recordGuess('2026-10-16', 'card', 99, true, store);
    expect(wonDay2.currentStreak).toBe(2);
    expect(wonDay2.maxStreak).toBe(2);
    expect(wonDay2.totalWins).toBe(2);
  });

  it('resets currentStreak to 0 if player skips a day', () => {
    recordGuess('2026-10-15', 'card', 25, true, store);

    // Player skips 2026-10-16 and opens the app on 2026-10-17
    const skipped = loadModeState('2026-10-17', 'card', store);
    expect(skipped.currentStreak).toBe(0);
    expect(skipped.maxStreak).toBe(1);
  });
});
