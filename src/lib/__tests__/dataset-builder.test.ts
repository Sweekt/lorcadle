import { describe, it, expect } from 'vitest';
import { buildDatasetFromRaw, type RawLorcanaJson } from '../dataset-builder';
import type { Locale } from '@/types/game';

function createMockRawJson(language: Locale, cards: RawLorcanaJson['cards']): RawLorcanaJson {
  return {
    metadata: { language },
    sets: {
      '1': { name: language === 'fr' ? 'Le Premier Chapitre' : 'The First Chapter', type: 'expansion', hasAllCards: true, number: 1 },
      '9': { name: language === 'fr' ? 'Fabuleux' : 'Fabled', type: 'expansion', hasAllCards: true, number: 9 },
      'Q1': { name: 'Deep Trouble', type: 'quest', hasAllCards: true, number: 1 },
    },
    cards,
  };
}

describe('buildDatasetFromRaw', () => {
  it('excludes quest sets, promo cards, and enchanted/baseId variants', () => {
    const enCards: RawLorcanaJson['cards'] = [
      {
        id: 1,
        fullName: 'Ariel - On Human Legs',
        name: 'Ariel',
        version: 'On Human Legs',
        simpleName: 'ariel on human legs',
        type: 'Character',
        color: 'Amber',
        cost: 4,
        inkwell: true,
        story: 'The Little Mermaid',
        setCode: '1',
        rarity: 'Uncommon',
        subtypes: ['Storyborn', 'Hero', 'Princess'],
        strength: 3,
        willpower: 4,
        lore: 2,
        images: { full: 'https://cdn/en/1.jpg', thumbnail: 'https://cdn/en/1_thumb.jpg' },
      },
      {
        id: 205,
        baseId: 1,
        fullName: 'Ariel - On Human Legs',
        name: 'Ariel',
        version: 'On Human Legs',
        simpleName: 'ariel on human legs',
        type: 'Character',
        color: 'Amber',
        cost: 4,
        inkwell: true,
        story: 'The Little Mermaid',
        setCode: '1',
        rarity: 'Enchanted',
        subtypes: ['Storyborn', 'Hero', 'Princess'],
        strength: 3,
        willpower: 4,
        lore: 2,
        images: { full: 'https://cdn/en/205.jpg', thumbnail: 'https://cdn/en/205_thumb.jpg' },
      },
      {
        id: 300,
        promoSource: 'D23 Expo',
        fullName: 'Mickey Mouse - Brave Little Tailor',
        name: 'Mickey Mouse',
        version: 'Brave Little Tailor',
        simpleName: 'mickey mouse brave little tailor',
        type: 'Character',
        color: 'Ruby',
        cost: 8,
        inkwell: true,
        story: 'Brave Little Tailor',
        setCode: '1',
        rarity: 'Special',
        subtypes: ['Dreamborn', 'Hero'],
        strength: 5,
        willpower: 5,
        lore: 4,
        images: { full: 'https://cdn/en/300.jpg', thumbnail: 'https://cdn/en/300_thumb.jpg' },
      },
      {
        id: 400,
        fullName: 'Ursula - Lair',
        name: 'Ursula',
        simpleName: 'ursula lair',
        type: 'Location',
        color: 'Amethyst',
        cost: 3,
        inkwell: false,
        story: 'The Little Mermaid',
        setCode: 'Q1',
        rarity: 'Common',
        images: { full: 'https://cdn/en/400.jpg', thumbnail: 'https://cdn/en/400_thumb.jpg' },
      },
    ];

    const rawByLocale: Record<Locale, RawLorcanaJson> = {
      en: createMockRawJson('en', enCards),
      fr: createMockRawJson('fr', []),
      de: createMockRawJson('de', []),
      it: createMockRawJson('it', []),
    };

    const { cards } = buildDatasetFromRaw(rawByLocale);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe(1);
    expect(cards[0].type).toBe('Character');
  });

  it('merges reprinted cards by English fullName and aggregates sets and rarities', () => {
    const enCards: RawLorcanaJson['cards'] = [
      {
        id: 25,
        fullName: 'Be Our Guest',
        name: 'Be Our Guest',
        simpleName: 'be our guest',
        type: 'Action',
        color: 'Amber-Steel',
        cost: 2,
        inkwell: true,
        story: 'Beauty and the Beast',
        setCode: '1',
        rarity: 'Uncommon',
        subtypes: ['Song'],
        images: { full: 'https://cdn/en/25.jpg', thumbnail: 'https://cdn/en/25_thumb.jpg' },
      },
      {
        id: 1980,
        reprintOfId: 25,
        fullName: 'Be Our Guest',
        name: 'Be Our Guest',
        simpleName: 'be our guest',
        type: 'Action',
        color: 'Amber-Steel',
        cost: 2,
        inkwell: true,
        story: 'Beauty and the Beast',
        setCode: '9',
        rarity: 'Common',
        subtypes: ['Song'],
        images: { full: 'https://cdn/en/1980.jpg', thumbnail: 'https://cdn/en/1980_thumb.jpg' },
      },
    ];

    const rawByLocale: Record<Locale, RawLorcanaJson> = {
      en: createMockRawJson('en', enCards),
      fr: createMockRawJson('fr', []),
      de: createMockRawJson('de', []),
      it: createMockRawJson('it', []),
    };

    const { cards } = buildDatasetFromRaw(rawByLocale);
    expect(cards).toHaveLength(1);
    expect(cards[0].sets).toEqual([1, 9]);
    expect(cards[0].rarity).toBe('Uncommon');
    expect(cards[0].rarities).toEqual(['Uncommon', 'Common']);
    expect(cards[0].colors).toEqual(['Amber', 'Steel']);
  });

  it('falls back to English translation when a card is missing in Italian and populates dictionaries', () => {
    const enCards: RawLorcanaJson['cards'] = [
      {
        id: 1,
        fullName: 'Ariel - On Human Legs',
        name: 'Ariel',
        version: 'On Human Legs',
        simpleName: 'ariel on human legs',
        type: 'Character',
        color: 'Amber',
        cost: 4,
        inkwell: true,
        story: 'The Little Mermaid',
        setCode: '1',
        rarity: 'Uncommon',
        subtypes: ['Storyborn', 'Hero'],
        strength: 3,
        willpower: 4,
        lore: 2,
        images: { full: 'https://cdn/en/1.jpg', thumbnail: 'https://cdn/en/1_thumb.jpg' },
      },
    ];

    const frCards: RawLorcanaJson['cards'] = [
      {
        id: 1,
        fullName: 'Ariel - Sur des jambes humaines',
        name: 'Ariel',
        version: 'Sur des jambes humaines',
        simpleName: 'ariel sur des jambes humaines',
        type: 'Personnage',
        color: 'Ambre',
        cost: 4,
        inkwell: true,
        story: 'La Petite Sirène',
        setCode: '1',
        rarity: 'Inhabituelle',
        subtypes: ['Histoire', 'Héros'],
        strength: 3,
        willpower: 4,
        lore: 2,
        images: { full: 'https://cdn/fr/1.jpg', thumbnail: 'https://cdn/fr/1_thumb.jpg' },
      },
    ];

    const rawByLocale: Record<Locale, RawLorcanaJson> = {
      en: createMockRawJson('en', enCards),
      fr: createMockRawJson('fr', frCards),
      de: createMockRawJson('de', []),
      it: createMockRawJson('it', []),
    };

    const { cards, dictionaries } = buildDatasetFromRaw(rawByLocale);
    expect(cards[0].translations.fr.fullName).toBe('Ariel - Sur des jambes humaines');
    expect(cards[0].translations.it.fullName).toBe('Ariel - On Human Legs');
    expect(dictionaries.stories['The Little Mermaid'].fr).toBe('La Petite Sirène');
    expect(dictionaries.stories['The Little Mermaid'].it).toBe('The Little Mermaid');
    expect(dictionaries.subtypes['Storyborn'].fr).toBe('Histoire');
  });

  it('does not overwrite English story dictionary entry when a reprint has a different story and trims localized strings', () => {
    const enCards: RawLorcanaJson['cards'] = [
      {
        id: 50,
        fullName: 'Distract',
        name: 'Distract',
        simpleName: 'distract',
        type: 'Action',
        color: 'Emerald',
        cost: 2,
        inkwell: true,
        story: 'Brave Little Tailor',
        setCode: '1',
        rarity: 'Common',
        images: { full: 'https://cdn/en/50.jpg', thumbnail: 'https://cdn/en/50_thumb.jpg' },
      },
      {
        id: 2500,
        reprintOfId: 50,
        fullName: 'Distract',
        name: 'Distract',
        simpleName: 'distract',
        type: 'Action',
        color: 'Emerald',
        cost: 2,
        inkwell: true,
        story: "Mickey's Christmas Carol",
        setCode: '9',
        rarity: 'Common',
        images: { full: 'https://cdn/en/2500.jpg', thumbnail: 'https://cdn/en/2500_thumb.jpg' },
      },
    ];

    const frCards: RawLorcanaJson['cards'] = [
      {
        id: 50,
        fullName: 'Distraire',
        name: 'Distraire',
        simpleName: 'distraire',
        type: 'Action',
        color: 'Émeraude',
        cost: 2,
        inkwell: true,
        story: 'Le Brave Petit Tailleur ',
        setCode: '1',
        rarity: 'Commune',
        images: { full: 'https://cdn/fr/50.jpg', thumbnail: 'https://cdn/fr/50_thumb.jpg' },
      },
    ];

    const rawByLocale: Record<Locale, RawLorcanaJson> = {
      en: createMockRawJson('en', enCards),
      fr: createMockRawJson('fr', frCards),
      de: createMockRawJson('de', []),
      it: createMockRawJson('it', []),
    };

    const { dictionaries } = buildDatasetFromRaw(rawByLocale);
    expect(dictionaries.stories['Brave Little Tailor'].en).toBe('Brave Little Tailor');
    expect(dictionaries.stories['Brave Little Tailor'].fr).toBe('Le Brave Petit Tailleur');
  });
});
