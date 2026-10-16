import type { DailyModeState, GameMode, Locale } from '@/types/game';

const STORAGE_PREFIX = 'lorcadle:v1';

export function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

function getStorage(customStorage?: Storage): Storage | null {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function daysBetween(dateKeyA: string, dateKeyB: string): number {
  const [y1, m1, d1] = dateKeyA.split('-').map(Number);
  const [y2, m2, d2] = dateKeyB.split('-').map(Number);
  const utc1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
  const utc2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
  return Math.round((utc2 - utc1) / 86400000);
}

export function loadModeState(
  dateKey: string,
  mode: GameMode,
  customStorage?: Storage
): DailyModeState {
  const storage = getStorage(customStorage);
  const key = `${STORAGE_PREFIX}:mode:${mode}`;

  const defaultState: DailyModeState = {
    dateKey,
    mode,
    guessedIds: [],
    won: false,
    currentStreak: 0,
    maxStreak: 0,
    lastWonDateKey: null,
    totalWins: 0,
  };

  if (!storage) return defaultState;

  try {
    const raw = storage.getItem(key);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as DailyModeState;

    let currentStreak = parsed.currentStreak ?? 0;
    const lastWon = parsed.lastWonDateKey ?? null;

    if (lastWon) {
      const gap = daysBetween(lastWon, dateKey);
      if (gap > 1) {
        currentStreak = 0;
      }
    } else {
      currentStreak = 0;
    }

    if (parsed.dateKey !== dateKey) {
      const rolledOver: DailyModeState = {
        dateKey,
        mode,
        guessedIds: [],
        won: false,
        currentStreak,
        maxStreak: parsed.maxStreak ?? 0,
        lastWonDateKey: lastWon,
        totalWins: parsed.totalWins ?? 0,
      };
      storage.setItem(key, JSON.stringify(rolledOver));
      return rolledOver;
    }

    return {
      ...defaultState,
      ...parsed,
      currentStreak,
    };
  } catch {
    return defaultState;
  }
}

export function recordGuess(
  dateKey: string,
  mode: GameMode,
  cardId: number,
  won: boolean,
  customStorage?: Storage
): DailyModeState {
  const storage = getStorage(customStorage);
  const key = `${STORAGE_PREFIX}:mode:${mode}`;
  const state = loadModeState(dateKey, mode, customStorage);

  if (state.guessedIds.includes(cardId)) {
    return state;
  }

  const nextGuessedIds = [cardId, ...state.guessedIds];
  let currentStreak = state.currentStreak;
  let maxStreak = state.maxStreak;
  let lastWonDateKey = state.lastWonDateKey;
  let totalWins = state.totalWins;
  let nextWon = state.won;

  if (won && !state.won) {
    nextWon = true;
    if (lastWonDateKey && daysBetween(lastWonDateKey, dateKey) === 1) {
      currentStreak += 1;
    } else if (lastWonDateKey !== dateKey) {
      currentStreak = 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    lastWonDateKey = dateKey;
    totalWins += 1;
  }

  const updated: DailyModeState = {
    dateKey,
    mode,
    guessedIds: nextGuessedIds,
    won: nextWon,
    currentStreak,
    maxStreak,
    lastWonDateKey,
    totalWins,
  };

  if (storage) {
    storage.setItem(key, JSON.stringify(updated));
  }

  return updated;
}

export function loadSavedLocale(customStorage?: Storage): Locale {
  const storage = getStorage(customStorage);
  if (!storage) return 'fr';
  const val = storage.getItem(`${STORAGE_PREFIX}:locale`);
  if (val === 'fr' || val === 'en' || val === 'de' || val === 'it') {
    return val;
  }
  return 'fr';
}

export function saveLocale(locale: Locale, customStorage?: Storage): void {
  const storage = getStorage(customStorage);
  storage?.setItem(`${STORAGE_PREFIX}:locale`, locale);
}

export function loadSavedTheme(customStorage?: Storage): 'dark' | 'light' {
  const storage = getStorage(customStorage);
  if (!storage) return 'dark';
  const val = storage.getItem(`${STORAGE_PREFIX}:theme`);
  if (val === 'light' || val === 'dark') return val;
  return 'dark';
}

export function saveTheme(theme: 'dark' | 'light', customStorage?: Storage): void {
  const storage = getStorage(customStorage);
  storage?.setItem(`${STORAGE_PREFIX}:theme`, theme);
}
