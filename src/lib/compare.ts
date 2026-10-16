import type {
  CanonicalCard,
  CardComparisonResult,
  CellComparison,
  CharacterComparisonResult,
  Direction,
  Rarity,
} from '@/types/game';

export const RARITY_ORDER: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  'Super Rare': 4,
  Legendary: 5,
};

function compareNumber(guessVal: number, targetVal: number): CellComparison<number> {
  if (guessVal === targetVal) {
    return { value: guessVal, status: 'exact' };
  }
  return {
    value: guessVal,
    status: 'wrong',
    direction: targetVal > guessVal ? 'higher' : 'lower',
  };
}

function compareStringArray<T extends string>(
  guessArr: readonly T[],
  targetArr: readonly T[]
): CellComparison<T[]> {
  const gSorted = [...guessArr].sort();
  const tSorted = [...targetArr].sort();

  if (
    gSorted.length === tSorted.length &&
    gSorted.every((val, idx) => val === tSorted[idx])
  ) {
    return { value: [...guessArr], status: 'exact' };
  }

  const targetSet = new Set(targetArr);
  const hasOverlap = guessArr.some((item) => targetSet.has(item));

  return {
    value: [...guessArr],
    status: hasOverlap ? 'partial' : 'wrong',
  };
}

function compareSets(
  guessSets: readonly number[],
  targetSets: readonly number[]
): CellComparison<number[]> {
  const gSorted = [...guessSets].sort((a, b) => a - b);
  const tSorted = [...targetSets].sort((a, b) => a - b);

  if (
    gSorted.length === tSorted.length &&
    gSorted.every((val, idx) => val === tSorted[idx])
  ) {
    return { value: [...guessSets], status: 'exact' };
  }

  const targetSet = new Set(targetSets);
  const hasOverlap = guessSets.some((s) => targetSet.has(s));

  if (hasOverlap) {
    return { value: [...guessSets], status: 'partial' };
  }

  const guessOrigin = gSorted[0] ?? 1;
  const targetOrigin = tSorted[0] ?? 1;
  const direction: Direction | undefined =
    targetOrigin > guessOrigin
      ? 'higher'
      : targetOrigin < guessOrigin
        ? 'lower'
        : undefined;

  return {
    value: [...guessSets],
    status: 'wrong',
    direction,
  };
}

function compareRarity(guess: CanonicalCard, target: CanonicalCard): CellComparison<Rarity> {
  if (guess.rarity === target.rarity) {
    return { value: guess.rarity, status: 'exact' };
  }

  if (
    target.rarities.includes(guess.rarity) ||
    guess.rarities.some((r) => target.rarities.includes(r))
  ) {
    return { value: guess.rarity, status: 'partial' };
  }

  const guessRank = RARITY_ORDER[guess.rarity];
  const targetRank = RARITY_ORDER[target.rarity];

  return {
    value: guess.rarity,
    status: 'wrong',
    direction: targetRank > guessRank ? 'higher' : 'lower',
  };
}

export function compareCardGuess(
  guess: CanonicalCard,
  target: CanonicalCard
): CardComparisonResult {
  return {
    guessCard: guess,
    isCorrect: guess.id === target.id,
    type: {
      value: guess.type,
      status: guess.type === target.type ? 'exact' : 'wrong',
    },
    colors: compareStringArray(guess.colors, target.colors),
    cost: compareNumber(guess.cost, target.cost),
    inkwell: {
      value: guess.inkwell,
      status: guess.inkwell === target.inkwell ? 'exact' : 'wrong',
    },
    story: {
      value: guess.story,
      status: guess.story === target.story ? 'exact' : 'wrong',
    },
    sets: compareSets(guess.sets, target.sets),
    rarity: compareRarity(guess, target),
  };
}

export function compareCharacterGuess(
  guess: CanonicalCard,
  target: CanonicalCard
): CharacterComparisonResult {
  return {
    guessCard: guess,
    isCorrect: guess.id === target.id,
    colors: compareStringArray(guess.colors, target.colors),
    subtypes: compareStringArray(guess.subtypes, target.subtypes),
    cost: compareNumber(guess.cost, target.cost),
    strength: compareNumber(guess.strength ?? 0, target.strength ?? 0),
    willpower: compareNumber(guess.willpower ?? 0, target.willpower ?? 0),
    lore: compareNumber(guess.lore ?? 0, target.lore ?? 0),
    sets: compareSets(guess.sets, target.sets),
  };
}
