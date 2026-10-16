# Lorcadle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone multilingual (FR/EN/DE/IT) Lorcadle web game with 3 daily modes (*Guess the Card*, *Guess the Character*, *Blurred Card*), yellow/orange + dark/light theme, and mobile-first responsive UI.

**Architecture:** A static-first Next.js (App Router) + TypeScript + Tailwind CSS application powered by a build-time data pipeline (`scripts/build-dataset.ts`) that merges and deduplicates `allCards_{en,fr,de,it}.json` into `src/data/cards.json` (2,680 canonical cards) and `src/data/dictionaries.json`. Pure TypeScript modules handle deterministic daily seeded selection (`Europe/Paris`), attribute comparison (exact/partial/wrong + directional arrows), accent-insensitive multilingual search, and `localStorage` state persistence.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React (icons), Vitest (unit testing), tsx (dataset build script).

**Spec:** `docs/superpowers/specs/2026-10-16-lorcadle-design.md`

## Global Constraints

- Zero external database or `lorcana-team-tracker` runtime dependency.
- Canonical cards only: `sets[setCode].type === "expansion"` with `hasAllCards === true`, no `baseId` (Enchanted/Epic/Iconic), no `promoSource`.
- Each canonical `fullName` appears once in search autocomplete (2,680 cards total, 2,023 `Character` cards), aggregating reprints into `sets: number[]` and `rarities: Rarity[]`.
- Supported locales: `'fr' | 'en' | 'de' | 'it'` (default `'fr'`), with fallback to `'en'` when a localized string or image is missing.
- UI theme: Yellow/Orange (`amber-500` / `orange-500`) + Black (`zinc-950`) in Dark Mode and White (`white` / `zinc-900`) in Light Mode, fully responsive on mobile.

## Review Focus

- **Reprinted cards with changed rarity (27 cards in Set 9 vs Set 1):** Guessing a card whose rarity matches one of the target's secondary print rarities (`target.rarities`) must return `status: 'partial'` (Orange) rather than `'wrong'`.
- **Missing Italian translations in Sets 1–2 and partial translations in Set 14:** `build-dataset.ts` must fall back to the English `fullName` and `images` whenever a card ID is absent in `allCards_{fr,de,it}.json` so no card has undefined fields.
- **Dual-ink vs Mono-ink color comparison:** Guessing `['Amber']` against `['Amber', 'Steel']` (or `['Amber', 'Ruby']` against `['Amber', 'Steel']`) must return `status: 'partial'` (Orange); only identical sorted arrays return `status: 'exact'` (Green).
- **Accent, hyphen, and case insensitivity in search:** Typing `"ariel jambes"` or `"be our guest"` must match `"Ariel - Sur des jambes humaines"` / `"Be Our Guest"` without requiring exact punctuation or accents, and already-guessed card IDs must be excluded from suggestions.
- **Midnight rollover in `localStorage`:** Saved guesses from `2026-10-15` must not leak into `2026-10-16`'s board while preserving the player's streak if they won the previous day.

---

### Task 1: Project Scaffolding & Core Type Definitions

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/types/game.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `Locale = 'fr' | 'en' | 'de' | 'it'`
  - `GameMode = 'card' | 'character' | 'blur'`
  - `InkColor = 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel'`
  - `CardType = 'Character' | 'Action' | 'Item' | 'Location'`
  - `Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary'`
  - `MatchStatus = 'exact' | 'partial' | 'wrong'`
  - `Direction = 'higher' | 'lower'`
  - `CellComparison<T>`, `CardComparisonResult`, `CharacterComparisonResult`, `CanonicalCard`, `Dictionaries`

- [ ] **Step 1: Initialize Next.js + TypeScript + Tailwind CSS + Vitest configuration files and install dependencies**

Configure `next.config.ts` with `images.remotePatterns` allowing `https://api.lorcana.ravensburger.com/**`. Add scripts `"build:data": "tsx scripts/build-dataset.ts"`, `"dev": "next dev"`, `"build": "next build"`, `"test": "vitest run"`.

- [ ] **Step 2: Create `src/types/game.ts` with all shared domain types**

Define `Locale`, `GameMode`, `InkColor`, `CardType`, `Rarity`, `LocalizedCardInfo`, `CanonicalCard`, `Dictionaries`, `CellComparison<T>`, `CardComparisonResult`, `CharacterComparisonResult`, and `DailyModeState`.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs vitest.config.ts src/types/game.ts .gitignore
git commit -m "chore: scaffold Next.js TypeScript project and core game types"
```

---

### Task 2: Multilingual Dataset Builder (`scripts/build-dataset.ts`)

**Files:**
- Create: `scripts/build-dataset.ts`
- Create: `src/lib/dataset-builder.ts`
- Create: `src/lib/__tests__/dataset-builder.test.ts`
- Create (generated): `src/data/cards.json`
- Create (generated): `src/data/dictionaries.json`

**Interfaces:**
- Consumes: `CanonicalCard`, `Dictionaries`, `Locale` from `src/types/game.ts`
- Produces:
  - `buildDatasetFromRaw(rawByLocale: Record<Locale, RawLorcanaJson>): { cards: CanonicalCard[]; dictionaries: Dictionaries }` in `src/lib/dataset-builder.ts`
  - Generated `src/data/cards.json` and `src/data/dictionaries.json`

- [ ] **Step 1: Write the failing tests in `src/lib/__tests__/dataset-builder.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildDatasetFromRaw } from '../dataset-builder';

describe('buildDatasetFromRaw', () => {
  it('excludes quest sets, promo cards, and enchanted/baseId variants', () => {
    // Fixture with 1 base card, 1 enchanted (baseId), 1 promo (promoSource), 1 quest card (setCode Q1)
    // Expects only the 1 canonical base card to remain
  });

  it('merges reprinted cards by English fullName and aggregates sets and rarities', () => {
    // Fixture with "Be Our Guest" in set 1 (Uncommon) and set 9 (Common)
    // Expects 1 CanonicalCard with sets: [1, 9], rarity: 'Uncommon', rarities: ['Uncommon', 'Common']
  });

  it('falls back to English translation when a card is missing in Italian', () => {
    // Fixture where card id 1 exists in en/fr/de but not in it
    // Expects card.translations.it.fullName === card.translations.en.fullName
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/dataset-builder.test.ts`
Expected: FAIL with module not found `../dataset-builder`.

- [ ] **Step 3: Implement `buildDatasetFromRaw` in `src/lib/dataset-builder.ts` and CLI runner `scripts/build-dataset.ts`**

Parse `color` into `InkColor[]` by splitting on `'-'`. Sort `sets` numerically ascending. Order printings by set number ascending so the earliest set provides canonical `id` and `rarity`. Populate `Dictionaries` for `stories`, `subtypes`, `sets`, `rarities`, `types`, and `colors` across `fr`, `en`, `de`, `it`.

- [ ] **Step 4: Run tests and execute `npm run build:data` against the real `allCards_*.json` files**

Run: `npx vitest run src/lib/__tests__/dataset-builder.test.ts && npm run build:data`
Expected: PASS, generating `src/data/cards.json` (2,680 cards, 2,023 Characters) and `src/data/dictionaries.json`.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-dataset.ts src/lib/dataset-builder.ts src/lib/__tests__/dataset-builder.test.ts src/data/cards.json src/data/dictionaries.json
git commit -m "feat: add multilingual LorcanaJSON dataset builder and canonical data"
```

---

### Task 3: Daily Seed & Comparison Engine (`daily-seed.ts`, `compare.ts`, `cards.ts`)

**Files:**
- Create: `src/lib/daily-seed.ts`
- Create: `src/lib/compare.ts`
- Create: `src/lib/cards.ts`
- Create: `src/lib/__tests__/compare.test.ts`
- Create: `src/lib/__tests__/daily-seed.test.ts`
- Create: `src/lib/__tests__/cards.test.ts`

**Interfaces:**
- Consumes: `CanonicalCard`, `GameMode`, `Locale`, `CardComparisonResult`, `CharacterComparisonResult` from `src/types/game.ts`
- Produces:
  - `getParisDateKey(date?: Date): string` (`YYYY-MM-DD` in `Europe/Paris`)
  - `getDailyCard(cards: CanonicalCard[], dateKey: string, mode: GameMode): CanonicalCard`
  - `compareCardGuess(guess: CanonicalCard, target: CanonicalCard): CardComparisonResult`
  - `compareCharacterGuess(guess: CanonicalCard, target: CanonicalCard): CharacterComparisonResult`
  - `searchCards(cards: CanonicalCard[], query: string, locale: Locale, excludedIds: Set<number>, mode?: GameMode): CanonicalCard[]`

- [ ] **Step 1: Write failing unit tests for comparison, daily seed, and search**

```ts
// In src/lib/__tests__/compare.test.ts:
// - exact match on all attributes returns status 'exact' and isCorrect: true
// - dual-ink ['Amber', 'Steel'] vs ['Amber'] returns colors.status === 'partial'
// - cost/strength/willpower/lore return direction 'higher' when target > guess, 'lower' when target < guess
// - multi-set card [1, 9] vs [1] returns sets.status === 'partial'; [2] vs [5] returns sets.status === 'wrong' with direction 'higher'
// - rarity comparison: Common vs Legendary returns status 'wrong', direction 'higher'; secondary reprint rarity returns 'partial'
// In src/lib/__tests__/daily-seed.test.ts:
// - same dateKey + mode always returns the exact same card
// - same dateKey across 'card', 'character', and 'blur' returns 3 distinct cards
// - 'character' mode always selects a card with type === 'Character'
// In src/lib/__tests__/cards.test.ts:
// - accent-insensitive and punctuation-insensitive search matches French and English names and excludes already-guessed IDs
```

- [ ] **Step 2: Run Vitest to verify tests fail**

Run: `npx vitest run`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/daily-seed.ts`, `src/lib/compare.ts`, and `src/lib/cards.ts`**

Use `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' })` for `YYYY-MM-DD`. Use deterministic seeded PRNG (`mulberry32` + string hash) to shuffle the pool by `(year, mode)` and pick by day-of-year so cards never repeat within a year. Implement `RARITY_ORDER: Record<Rarity, number> = { Common: 1, Uncommon: 2, Rare: 3, 'Super Rare': 4, Legendary: 5 }`.

- [ ] **Step 4: Run Vitest to verify all tests pass**

Run: `npx vitest run`
Expected: PASS on all test suites.

- [ ] **Step 5: Commit**

```bash
git add src/lib/daily-seed.ts src/lib/compare.ts src/lib/cards.ts src/lib/__tests__/
git commit -m "feat: implement daily seed selector, attribute comparison engine, and search"
```

---

### Task 4: Persistence (`storage.ts`), i18n (`i18n.ts`), and Global Providers

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/__tests__/storage.test.ts`
- Create: `src/lib/i18n.ts`
- Create: `src/context/AppContext.tsx`

**Interfaces:**
- Consumes: `Locale`, `GameMode`, `DailyModeState` from `src/types/game.ts`
- Produces:
  - `loadModeState(dateKey: string, mode: GameMode): DailyModeState`
  - `recordGuess(dateKey: string, mode: GameMode, cardId: number, won: boolean): DailyModeState`
  - `useApp(): { locale: Locale; setLocale: (l: Locale) => void; theme: 'dark' | 'light'; toggleTheme: () => void; t: UILabels }`

- [ ] **Step 1: Write failing test in `src/lib/__tests__/storage.test.ts` covering daily rollover and streak preservation**

Test that when `dateKey` advances by 1 day after a win (`2026-10-15` -> `2026-10-16`), `guessedIds` resets to `[]`, `won` resets to `false`, and winning on `2026-10-16` increments `currentStreak` from `1` to `2`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/storage.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/storage.ts`, `src/lib/i18n.ts`, and `src/context/AppContext.tsx`**

Include complete UI translations for `'fr' | 'en' | 'de' | 'it'` in `src/lib/i18n.ts` and manage dark/light class on `document.documentElement`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/__tests__/storage.test.ts src/lib/i18n.ts src/context/AppContext.tsx
git commit -m "feat: add localStorage persistence, streak rollover, and i18n/theme context"
```

---

### Task 5: Mobile-First UI Components & Game Pages (Yellow/Orange + Dark/Light Theme)

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/CardSearchInput.tsx`
- Create: `src/components/GuessGrid.tsx`
- Create: `src/components/BlurredCardGame.tsx`
- Create: `src/components/VictoryModal.tsx`
- Create: `src/components/DailyGameView.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Create: `src/app/character/page.tsx`
- Create: `src/app/blur/page.tsx`

**Interfaces:**
- Consumes: `useApp()`, `cards.ts`, `daily-seed.ts`, `compare.ts`, `storage.ts`
- Produces: Complete playable pages at `/`, `/character`, and `/blur`

- [ ] **Step 1: Implement `Header.tsx` and `Footer.tsx`**

`Header.tsx`: Lorcadle logo in yellow/orange gradient, navigation pills for the 3 modes with completion badges, language selector (`FR`, `EN`, `DE`, `IT`), Dark/Light mode toggle button, and streak indicator.
`Footer.tsx`: Matches `lorcana-team-tracker` footer structure and Ravensburger/Disney community disclaimer.

- [ ] **Step 2: Implement `CardSearchInput.tsx`, `GuessGrid.tsx`, `BlurredCardGame.tsx`, `VictoryModal.tsx`, and `DailyGameView.tsx`**

- `CardSearchInput.tsx`: Touch-friendly autocomplete dropdown with card thumbnail, localized `fullName`, keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
- `GuessGrid.tsx`: Responsive grid supporting `'card'` (7 columns: Type, Couleur, Coût, Encrable, Franchise, Set, Rareté) and `'character'` (7 columns: Couleur, Sous-type, Coût, Force, Volonté, Lore, Set) + sticky/compact card preview column on mobile, animated flip reveal, color-coded cells (`emerald-500` exact, `amber-500` partial, `rose-600` wrong) and prominent `↑`/`↓` directional indicators.
- `BlurredCardGame.tsx`: Progressive unblurring (`Math.max(0, 28 - guesses.length * 4)px` down to `0px` on win) with previous guesses list below.
- `VictoryModal.tsx`: Card reveal, attempt count, shareable emoji grid button, and CTA link to the next uncompleted daily mode.

- [ ] **Step 3: Wire up `/`, `/character`, and `/blur` routes in `src/app/`**

Connect each route to `DailyGameView` with its respective mode (`'card'`, `'character'`, `'blur'`).

- [ ] **Step 4: Run full test suite and production Next.js build**

Run: `npx vitest run && npm run build`
Expected: All tests pass and `next build` succeeds with zero TypeScript or ESLint errors.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: implement responsive Lorcadle game modes, UI theme, and footer"
```
