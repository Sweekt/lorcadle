import type { CanonicalCard, Dictionaries, GameMode, Locale } from '@/types/game';
import cardsData from '@/data/cards.json';
import dictionariesData from '@/data/dictionaries.json';

export const ALL_CARDS: CanonicalCard[] = cardsData as CanonicalCard[];
export const DICTIONARIES: Dictionaries = dictionariesData as Dictionaries;

const CARD_BY_ID = new Map<number, CanonicalCard>(ALL_CARDS.map((c) => [c.id, c]));

export function getCardById(id: number): CanonicalCard | undefined {
  return CARD_BY_ID.get(id);
}

export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeCollapsed(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`-]+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function searchCards(
  cards: readonly CanonicalCard[],
  query: string,
  locale: Locale,
  excludedIds: ReadonlySet<number>,
  mode: GameMode = 'card',
  limit = 12
): CanonicalCard[] {
  const cleanQuery = normalizeSearchText(query);
  const collapsedQuery = normalizeCollapsed(query);

  if (!cleanQuery) return [];

  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
  const collapsedTokens = collapsedQuery.split(/\s+/).filter(Boolean);

  const scored: { card: CanonicalCard; score: number }[] = [];

  for (const card of cards) {
    if (excludedIds.has(card.id)) continue;
    if (mode === 'character' && card.type !== 'Character') continue;

    const locFullName = card.translations[locale]?.fullName ?? card.translations.en.fullName;
    const enFullName = card.translations.en.fullName;

    const normLoc = normalizeSearchText(locFullName);
    const collLoc = normalizeCollapsed(locFullName);
    const normEn = normalizeSearchText(enFullName);
    const collEn = normalizeCollapsed(enFullName);

    const matchesLocale =
      queryTokens.every((t) => normLoc.includes(t)) ||
      collapsedTokens.every((t) => collLoc.includes(t));

    const matchesEnglish =
      locale !== 'en' &&
      (queryTokens.every((t) => normEn.includes(t)) ||
        collapsedTokens.every((t) => collEn.includes(t)));

    if (!matchesLocale && !matchesEnglish) continue;

    // Score higher when prefix matches in active locale
    let score = 0;
    if (matchesLocale) {
      score += 100;
      if (normLoc.startsWith(cleanQuery) || collLoc.startsWith(collapsedQuery)) {
        score += 50;
      }
    } else if (matchesEnglish) {
      score += 40;
      if (normEn.startsWith(cleanQuery) || collEn.startsWith(collapsedQuery)) {
        score += 20;
      }
    }

    scored.push({ card, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const nameA = a.card.translations[locale]?.fullName ?? a.card.translations.en.fullName;
    const nameB = b.card.translations[locale]?.fullName ?? b.card.translations.en.fullName;
    return nameA.localeCompare(nameB, locale);
  });

  return scored.slice(0, limit).map((item) => item.card);
}
