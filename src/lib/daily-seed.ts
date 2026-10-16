import type { CanonicalCard, GameMode } from '@/types/game';

export function getParisDateKey(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDayOfYear(dateKey: string): { year: string; dayIndex: number } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const start = Date.UTC(y, 0, 1);
  const current = Date.UTC(y, (m || 1) - 1, d || 1);
  const dayIndex = Math.floor((current - start) / 86400000);
  return { year: String(y), dayIndex: Math.max(0, dayIndex) };
}

function shuffleWithSeed<T>(items: readonly T[], seedStr: string): T[] {
  const copy = [...items];
  const rand = mulberry32(hashString(seedStr));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function getDailyCard(
  cards: readonly CanonicalCard[],
  dateKey: string,
  mode: GameMode
): CanonicalCard {
  if (cards.length === 0) {
    throw new Error('Card pool cannot be empty');
  }

  const { year, dayIndex } = getDayOfYear(dateKey);

  const pickForMode = (targetMode: GameMode, usedIds: Set<number>): CanonicalCard => {
    const pool =
      targetMode === 'character'
        ? cards.filter((c) => c.type === 'Character')
        : cards;
    const shuffled = shuffleWithSeed(pool, `lorcadle:${year}:${targetMode}`);
    let idx = dayIndex % shuffled.length;
    for (let offset = 0; offset < shuffled.length; offset++) {
      const candidate = shuffled[(idx + offset) % shuffled.length];
      if (!usedIds.has(candidate.id)) {
        return candidate;
      }
    }
    return shuffled[idx];
  };

  const usedIds = new Set<number>();
  const cardChoice = pickForMode('card', usedIds);
  if (mode === 'card') return cardChoice;
  usedIds.add(cardChoice.id);

  const charChoice = pickForMode('character', usedIds);
  if (mode === 'character') return charChoice;
  usedIds.add(charChoice.id);

  return pickForMode('blur', usedIds);
}
