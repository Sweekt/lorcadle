import { describe, it, expect } from 'vitest';
import { getDailyCard, getParisDateKey } from '../daily-seed';
import type { CanonicalCard } from '@/types/game';

function makePool(): CanonicalCard[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    slug: `card-${i + 1}`,
    type: i % 2 === 0 ? 'Character' : 'Action',
    colors: ['Amber'],
    cost: (i % 8) + 1,
    inkwell: true,
    story: 'Frozen',
    sets: [1],
    rarity: 'Common',
    rarities: ['Common'],
    subtypes: i % 2 === 0 ? ['Storyborn'] : [],
    strength: i % 2 === 0 ? 3 : undefined,
    willpower: i % 2 === 0 ? 3 : undefined,
    lore: i % 2 === 0 ? 1 : undefined,
    translations: {
      en: { fullName: `Card ${i + 1}`, name: `Card ${i + 1}`, image: '', thumbnail: '' },
      fr: { fullName: `Carte ${i + 1}`, name: `Carte ${i + 1}`, image: '', thumbnail: '' },
      de: { fullName: `Karte ${i + 1}`, name: `Karte ${i + 1}`, image: '', thumbnail: '' },
      it: { fullName: `Carta ${i + 1}`, name: `Carta ${i + 1}`, image: '', thumbnail: '' },
    },
  }));
}

describe('daily-seed', () => {
  it('formats a Date into YYYY-MM-DD in Europe/Paris timezone', () => {
    const d = new Date('2026-10-16T10:00:00Z');
    expect(getParisDateKey(d)).toBe('2026-10-16');
  });

  it('returns the exact same card for the same dateKey and mode', () => {
    const pool = makePool();
    const first = getDailyCard(pool, '2026-10-16', 'card');
    const second = getDailyCard(pool, '2026-10-16', 'card');
    expect(first.id).toBe(second.id);
  });

  it('returns distinct cards across card, character, and blur modes on the same day', () => {
    const pool = makePool();
    const cardTarget = getDailyCard(pool, '2026-10-16', 'card');
    const charTarget = getDailyCard(pool, '2026-10-16', 'character');
    const blurTarget = getDailyCard(pool, '2026-10-16', 'blur');

    expect(charTarget.type).toBe('Character');
    expect(new Set([cardTarget.id, charTarget.id, blurTarget.id]).size).toBe(3);
  });

  it('does not repeat cards across consecutive days within the same mode', () => {
    const pool = makePool();
    const d1 = getDailyCard(pool, '2026-10-16', 'card');
    const d2 = getDailyCard(pool, '2026-10-17', 'card');
    const d3 = getDailyCard(pool, '2026-10-18', 'card');
    expect(new Set([d1.id, d2.id, d3.id]).size).toBe(3);
  });
});
