export type Locale = 'fr' | 'en' | 'de' | 'it';

export type GameMode = 'card' | 'character' | 'blur';

export type InkColor = 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel';

export type CardType = 'Character' | 'Action' | 'Item' | 'Location';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary';

export type MatchStatus = 'exact' | 'partial' | 'wrong';

export type Direction = 'higher' | 'lower';

export interface LocalizedCardInfo {
  fullName: string;
  name: string;
  version?: string;
  image: string;
  thumbnail: string;
  flavorText?: string;
}

export interface CanonicalCard {
  id: number;
  slug: string;
  type: CardType;
  colors: InkColor[];
  cost: number;
  inkwell: boolean;
  story: string;
  sets: number[];
  rarity: Rarity;
  rarities: Rarity[];
  subtypes: string[];
  strength?: number;
  willpower?: number;
  lore?: number;
  translations: Record<Locale, LocalizedCardInfo>;
}

export type LocalizedDictionaryMap = Record<string, Record<Locale, string>>;

export interface Dictionaries {
  stories: LocalizedDictionaryMap;
  subtypes: LocalizedDictionaryMap;
  sets: Record<string, Record<Locale, string>>;
  rarities: Record<Rarity, Record<Locale, string>>;
  types: Record<CardType, Record<Locale, string>>;
  colors: Record<InkColor, Record<Locale, string>>;
}

export interface CellComparison<T> {
  value: T;
  status: MatchStatus;
  direction?: Direction;
}

export interface CardComparisonResult {
  guessCard: CanonicalCard;
  isCorrect: boolean;
  type: CellComparison<CardType>;
  colors: CellComparison<InkColor[]>;
  cost: CellComparison<number>;
  inkwell: CellComparison<boolean>;
  story: CellComparison<string>;
  sets: CellComparison<number[]>;
  rarity: CellComparison<Rarity>;
}

export interface CharacterComparisonResult {
  guessCard: CanonicalCard;
  isCorrect: boolean;
  colors: CellComparison<InkColor[]>;
  subtypes: CellComparison<string[]>;
  cost: CellComparison<number>;
  strength: CellComparison<number>;
  willpower: CellComparison<number>;
  lore: CellComparison<number>;
  sets: CellComparison<number[]>;
}

export interface DailyModeState {
  dateKey: string;
  mode: GameMode;
  guessedIds: number[];
  won: boolean;
  currentStreak: number;
  maxStreak: number;
  lastWonDateKey: string | null;
  totalWins: number;
}
