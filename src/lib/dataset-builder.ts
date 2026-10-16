import type {
  CanonicalCard,
  CardType,
  Dictionaries,
  InkColor,
  Locale,
  LocalizedCardInfo,
  Rarity,
} from '@/types/game';

export interface RawSetInfo {
  name: string;
  type: string;
  hasAllCards?: boolean;
  number: number;
}

export interface RawCard {
  id: number;
  baseId?: number;
  promoSource?: string;
  reprintOfId?: number;
  reprintedAsIds?: number[];
  fullName: string;
  name: string;
  version?: string;
  simpleName: string;
  type: string;
  color: string;
  cost: number;
  inkwell: boolean;
  story?: string;
  setCode: string;
  rarity: string;
  subtypes?: string[];
  strength?: number;
  willpower?: number;
  lore?: number;
  flavorText?: string;
  images?: {
    full?: string;
    thumbnail?: string;
  };
}

export interface RawLorcanaJson {
  metadata: {
    language: string;
  };
  sets: Record<string, RawSetInfo>;
  cards: RawCard[];
}

const LOCALES: Locale[] = ['en', 'fr', 'de', 'it'];

const DEFAULT_TYPES: Record<CardType, Record<Locale, string>> = {
  Character: { en: 'Character', fr: 'Personnage', de: 'Charakter', it: 'Personaggio' },
  Action: { en: 'Action', fr: 'Action', de: 'Aktion', it: 'Azione' },
  Item: { en: 'Item', fr: 'Objet', de: 'Gegenstand', it: 'Oggetto' },
  Location: { en: 'Location', fr: 'Lieu', de: 'Ort', it: 'Luogo' },
};

const DEFAULT_RARITIES: Record<Rarity, Record<Locale, string>> = {
  Common: { en: 'Common', fr: 'Commune', de: 'Gewöhnlich', it: 'Comune' },
  Uncommon: { en: 'Uncommon', fr: 'Inhabituelle', de: 'Ungewöhnlich', it: 'Non comune' },
  Rare: { en: 'Rare', fr: 'Rare', de: 'Selten', it: 'Rara' },
  'Super Rare': { en: 'Super Rare', fr: 'Très Rare', de: 'Episch', it: 'Super Rara' },
  Legendary: { en: 'Legendary', fr: 'Légendaire', de: 'Legendär', it: 'Leggendaria' },
};

const DEFAULT_COLORS: Record<InkColor, Record<Locale, string>> = {
  Amber: { en: 'Amber', fr: 'Ambre', de: 'Bernstein', it: 'Ambra' },
  Amethyst: { en: 'Amethyst', fr: 'Améthyste', de: 'Amethyst', it: 'Ametista' },
  Emerald: { en: 'Emerald', fr: 'Émeraude', de: 'Smaragd', it: 'Smeraldo' },
  Ruby: { en: 'Ruby', fr: 'Rubis', de: 'Rubin', it: 'Rubino' },
  Sapphire: { en: 'Sapphire', fr: 'Saphir', de: 'Saphir', it: 'Zaffiro' },
  Steel: { en: 'Steel', fr: 'Acier', de: 'Stahl', it: 'Acciaio' },
};

export function buildDatasetFromRaw(rawByLocale: Record<Locale, RawLorcanaJson>): {
  cards: CanonicalCard[];
  dictionaries: Dictionaries;
} {
  const enData = rawByLocale.en;
  const cardByIdPerLocale: Record<Locale, Map<number, RawCard>> = {
    en: new Map(),
    fr: new Map(),
    de: new Map(),
    it: new Map(),
  };

  for (const locale of LOCALES) {
    const raw = rawByLocale[locale];
    if (!raw) continue;
    for (const card of raw.cards) {
      cardByIdPerLocale[locale].set(card.id, card);
    }
  }

  const dictionaries: Dictionaries = {
    stories: {},
    subtypes: {},
    sets: {},
    rarities: structuredClone(DEFAULT_RARITIES),
    types: structuredClone(DEFAULT_TYPES),
    colors: structuredClone(DEFAULT_COLORS),
  };

  // Populate set names across locales
  for (const [setCode, enSet] of Object.entries(enData.sets)) {
    if (enSet.type !== 'expansion' || enSet.hasAllCards === false) continue;
    dictionaries.sets[setCode] = {
      en: enSet.name,
      fr: rawByLocale.fr?.sets?.[setCode]?.name || enSet.name,
      de: rawByLocale.de?.sets?.[setCode]?.name || enSet.name,
      it: rawByLocale.it?.sets?.[setCode]?.name || enSet.name,
    };
  }

  // Filter base expansion cards in English
  const baseEnCards = enData.cards.filter((card) => {
    const setInfo = enData.sets[card.setCode];
    if (!setInfo || setInfo.type !== 'expansion' || setInfo.hasAllCards === false) {
      return false;
    }
    if (card.baseId !== undefined || card.promoSource !== undefined) {
      return false;
    }
    return true;
  });

  // Group by English fullName
  const groupedByFullName = new Map<string, RawCard[]>();
  for (const card of baseEnCards) {
    const group = groupedByFullName.get(card.fullName) ?? [];
    group.push(card);
    groupedByFullName.set(card.fullName, group);
  }

  const canonicalCards: CanonicalCard[] = [];

  for (const [, group] of groupedByFullName) {
    // Sort printings by numeric setCode ascending
    group.sort((a, b) => Number(a.setCode) - Number(b.setCode));
    const primary = group[0];

    const sets = Array.from(new Set(group.map((c) => Number(c.setCode)))).sort((a, b) => a - b);
    const rarities = Array.from(new Set(group.map((c) => c.rarity as Rarity)));
    const colors = primary.color
      .split('-')
      .map((c) => c.trim())
      .filter(Boolean) as InkColor[];
    const story = primary.story || 'Unknown';
    const subtypes = primary.subtypes ?? [];

    // Populate story dictionary
    if (!dictionaries.stories[story]) {
      dictionaries.stories[story] = {
        en: story,
        fr: story,
        de: story,
        it: story,
      };
    }

    // Populate subtypes dictionary
    for (const st of subtypes) {
      if (!dictionaries.subtypes[st]) {
        dictionaries.subtypes[st] = {
          en: st,
          fr: st,
          de: st,
          it: st,
        };
      }
    }

    // Look across all printings in the group to harvest localized strings if a later printing is translated
    for (const printing of group) {
      for (const locale of ['fr', 'de', 'it'] as Locale[]) {
        const locCard = cardByIdPerLocale[locale].get(printing.id);
        if (!locCard) continue;
        if (locCard.story && dictionaries.stories[story][locale] === story) {
          dictionaries.stories[story][locale] = locCard.story.trim();
        }
        if (locCard.subtypes && locCard.subtypes.length === subtypes.length) {
          subtypes.forEach((enSt, idx) => {
            const locSt = locCard.subtypes?.[idx]?.trim();
            if (locSt && dictionaries.subtypes[enSt][locale] === enSt) {
              dictionaries.subtypes[enSt][locale] = locSt;
            }
          });
        }
      }
    }

    const enInfo: LocalizedCardInfo = {
      fullName: primary.fullName,
      name: primary.name,
      version: primary.version,
      image: primary.images?.full ?? '',
      thumbnail: primary.images?.thumbnail ?? '',
      ...(primary.flavorText ? { flavorText: primary.flavorText } : {}),
    };

    const translations: Record<Locale, LocalizedCardInfo> = {
      en: enInfo,
      fr: enInfo,
      de: enInfo,
      it: enInfo,
    };

    for (const locale of ['fr', 'de', 'it'] as Locale[]) {
      // Find first printing available in this locale (preferring earliest set)
      const locPrinting =
        group.map((p) => cardByIdPerLocale[locale].get(p.id)).find((c) => c !== undefined) ??
        undefined;

      if (locPrinting) {
        translations[locale] = {
          fullName: locPrinting.fullName || enInfo.fullName,
          name: locPrinting.name || enInfo.name,
          version: locPrinting.version ?? enInfo.version,
          image: locPrinting.images?.full || enInfo.image,
          thumbnail: locPrinting.images?.thumbnail || enInfo.thumbnail,
          ...(locPrinting.flavorText
            ? { flavorText: locPrinting.flavorText }
            : enInfo.flavorText
              ? { flavorText: enInfo.flavorText }
              : {}),
        };
      }
    }

    const slug = primary.simpleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const canonical: CanonicalCard = {
      id: primary.id,
      slug,
      type: primary.type as CardType,
      colors,
      cost: primary.cost,
      inkwell: Boolean(primary.inkwell),
      story,
      sets,
      rarity: primary.rarity as Rarity,
      rarities,
      subtypes,
      ...(primary.strength !== undefined ? { strength: primary.strength } : {}),
      ...(primary.willpower !== undefined ? { willpower: primary.willpower } : {}),
      ...(primary.lore !== undefined ? { lore: primary.lore } : {}),
      translations,
    };

    canonicalCards.push(canonical);
  }

  canonicalCards.sort((a, b) => a.id - b.id);

  return {
    cards: canonicalCards,
    dictionaries,
  };
}
