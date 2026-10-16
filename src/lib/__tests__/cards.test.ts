import { describe, it, expect } from 'vitest';
import { searchCards, normalizeSearchText } from '../cards';
import type { CanonicalCard } from '@/types/game';

const sampleCards: CanonicalCard[] = [
  {
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
  },
  {
    id: 25,
    slug: 'be-our-guest',
    type: 'Action',
    colors: ['Amber'],
    cost: 2,
    inkwell: true,
    story: 'Beauty and the Beast',
    sets: [1, 9],
    rarity: 'Uncommon',
    rarities: ['Uncommon', 'Common'],
    subtypes: ['Song'],
    translations: {
      en: { fullName: 'Be Our Guest', name: 'Be Our Guest', image: '', thumbnail: '' },
      fr: { fullName: "C'est la fête", name: "C'est la fête", image: '', thumbnail: '' },
      de: { fullName: 'Sei hier Gast', name: 'Sei hier Gast', image: '', thumbnail: '' },
      it: { fullName: 'Stia con Noi', name: 'Stia con Noi', image: '', thumbnail: '' },
    },
  },
];

describe('cards search', () => {
  it('normalizes accents, punctuation, and case', () => {
    expect(normalizeSearchText("C'est la fête - Édition !")).toBe('c est la fete edition');
  });

  it('matches cards in active locale without accents or hyphens and falls back to English', () => {
    const resFr = searchCards(sampleCards, 'cest la fete', 'fr', new Set());
    expect(resFr).toHaveLength(1);
    expect(resFr[0].id).toBe(25);

    const resTokens = searchCards(sampleCards, 'ariel jambes', 'fr', new Set());
    expect(resTokens).toHaveLength(1);
    expect(resTokens[0].id).toBe(1);

    // Searching by English name while in French locale also works
    const resEnFallback = searchCards(sampleCards, 'be our guest', 'fr', new Set());
    expect(resEnFallback).toHaveLength(1);
    expect(resEnFallback[0].id).toBe(25);
  });

  it('excludes already guessed card IDs and filters by character mode when requested', () => {
    const resExcluded = searchCards(sampleCards, 'ariel', 'fr', new Set([1]));
    expect(resExcluded).toHaveLength(0);

    const resCharMode = searchCards(sampleCards, 'fete', 'fr', new Set(), 'character');
    expect(resCharMode).toHaveLength(0);
  });
});
