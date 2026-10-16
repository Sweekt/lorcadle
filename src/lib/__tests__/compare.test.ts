import { describe, it, expect } from 'vitest';
import { compareCardGuess, compareCharacterGuess } from '../compare';
import type { CanonicalCard } from '@/types/game';

function makeCard(overrides: Partial<CanonicalCard> = {}): CanonicalCard {
  return {
    id: 1,
    slug: 'ariel-on-human-legs',
    type: 'Character',
    colors: ['Amber'],
    cost: 4,
    inkwell: true,
    story: 'The Little Mermaid',
    sets: [1],
    rarity: 'Uncommon',
    rarities: ['Uncommon'],
    subtypes: ['Storyborn', 'Hero', 'Princess'],
    strength: 3,
    willpower: 4,
    lore: 2,
    translations: {
      en: { fullName: 'Ariel - On Human Legs', name: 'Ariel', version: 'On Human Legs', image: '', thumbnail: '' },
      fr: { fullName: 'Ariel - Sur des jambes humaines', name: 'Ariel', version: 'Sur des jambes humaines', image: '', thumbnail: '' },
      de: { fullName: 'Arielle - Auf menschlichen Beinen', name: 'Arielle', version: 'Auf menschlichen Beinen', image: '', thumbnail: '' },
      it: { fullName: 'Ariel - Su Gambe Umane', name: 'Ariel', version: 'Su Gambe Umane', image: '', thumbnail: '' },
    },
    ...overrides,
  };
}

describe('compareCardGuess', () => {
  it('returns exact on all fields and isCorrect=true when guessing the target card', () => {
    const target = makeCard();
    const res = compareCardGuess(target, target);
    expect(res.isCorrect).toBe(true);
    expect(res.type.status).toBe('exact');
    expect(res.colors.status).toBe('exact');
    expect(res.cost.status).toBe('exact');
    expect(res.inkwell.status).toBe('exact');
    expect(res.story.status).toBe('exact');
    expect(res.sets.status).toBe('exact');
    expect(res.rarity.status).toBe('exact');
  });

  it('returns partial for dual-ink vs mono-ink sharing one color, and wrong when disjoint', () => {
    const target = makeCard({ id: 2, colors: ['Amber', 'Steel'] });
    const partialGuess = makeCard({ id: 3, colors: ['Amber'] });
    const dualPartialGuess = makeCard({ id: 4, colors: ['Amber', 'Ruby'] });
    const wrongGuess = makeCard({ id: 5, colors: ['Amethyst'] });

    expect(compareCardGuess(partialGuess, target).colors.status).toBe('partial');
    expect(compareCardGuess(dualPartialGuess, target).colors.status).toBe('partial');
    expect(compareCardGuess(wrongGuess, target).colors.status).toBe('wrong');
  });

  it('returns higher/lower directions on cost, sets, and rarity', () => {
    const target = makeCard({ id: 10, cost: 5, sets: [6], rarity: 'Legendary', rarities: ['Legendary'] });
    const guessLow = makeCard({ id: 11, cost: 3, sets: [2], rarity: 'Common', rarities: ['Common'] });
    const guessHigh = makeCard({ id: 12, cost: 8, sets: [9], rarity: 'Rare', rarities: ['Rare'] });

    const resLow = compareCardGuess(guessLow, target);
    expect(resLow.cost).toEqual({ value: 3, status: 'wrong', direction: 'higher' });
    expect(resLow.sets).toEqual({ value: [2], status: 'wrong', direction: 'higher' });
    expect(resLow.rarity).toEqual({ value: 'Common', status: 'wrong', direction: 'higher' });

    const resHigh = compareCardGuess(guessHigh, target);
    expect(resHigh.cost).toEqual({ value: 8, status: 'wrong', direction: 'lower' });
    expect(resHigh.sets).toEqual({ value: [9], status: 'wrong', direction: 'lower' });
  });

  it('handles reprinted cards with multiple sets and secondary rarities as partial match', () => {
    const target = makeCard({
      id: 25,
      sets: [1, 9],
      rarity: 'Uncommon',
      rarities: ['Uncommon', 'Common'],
    });
    const guessSet1Only = makeCard({
      id: 30,
      sets: [1],
      rarity: 'Common',
      rarities: ['Common'],
    });

    const res = compareCardGuess(guessSet1Only, target);
    expect(res.sets.status).toBe('partial');
    expect(res.rarity.status).toBe('partial');
  });
});

describe('compareCharacterGuess', () => {
  it('compares subtypes (exact, partial, wrong) and numeric combat stats (strength, willpower, lore)', () => {
    const target = makeCard({
      id: 1,
      subtypes: ['Storyborn', 'Hero', 'Princess'],
      strength: 3,
      willpower: 4,
      lore: 2,
    });
    const guess = makeCard({
      id: 2,
      subtypes: ['Storyborn', 'Villain'],
      strength: 5,
      willpower: 2,
      lore: 2,
    });

    const res = compareCharacterGuess(guess, target);
    expect(res.isCorrect).toBe(false);
    expect(res.subtypes.status).toBe('partial');
    expect(res.strength).toEqual({ value: 5, status: 'wrong', direction: 'lower' });
    expect(res.willpower).toEqual({ value: 2, status: 'wrong', direction: 'higher' });
    expect(res.lore).toEqual({ value: 2, status: 'exact', direction: undefined });
  });
});
