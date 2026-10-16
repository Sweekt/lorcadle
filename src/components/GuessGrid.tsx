'use client';

import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type {
  CanonicalCard,
  Direction,
  InkColor,
  MatchStatus,
} from '@/types/game';
import { compareCardGuess, compareCharacterGuess } from '@/lib/compare';
import {
  formatSets,
  translateColors,
  translateRarity,
  translateStory,
  translateSubtypes,
  translateType,
} from '@/lib/i18n';
import { useApp } from '@/context/AppContext';

const INK_DOT_CLASS: Record<InkColor, string> = {
  Amber: 'bg-amber-400 border-amber-200',
  Amethyst: 'bg-purple-500 border-purple-200',
  Emerald: 'bg-emerald-500 border-emerald-200',
  Ruby: 'bg-rose-600 border-rose-200',
  Sapphire: 'bg-sky-500 border-sky-200',
  Steel: 'bg-slate-400 border-slate-200',
};

function statusClasses(status: MatchStatus): string {
  switch (status) {
    case 'exact':
      return 'bg-emerald-600 dark:bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-950/30';
    case 'partial':
      return 'bg-amber-500 dark:bg-amber-500 text-zinc-950 font-extrabold border-amber-300 shadow-amber-950/30';
    case 'wrong':
      return 'bg-rose-600 dark:bg-rose-700/95 text-white border-rose-400 shadow-rose-950/30';
  }
}

interface ClueCellProps {
  status: MatchStatus;
  direction?: Direction;
  animateFlip?: boolean;
  delayMs?: number;
  children: React.ReactNode;
}

function ClueCell({
  status,
  direction,
  animateFlip = false,
  delayMs = 0,
  children,
}: ClueCellProps) {
  return (
    <div
      style={animateFlip ? { animationDelay: `${delayMs}ms` } : undefined}
      className={`relative h-20 sm:h-24 rounded-xl border-2 p-1.5 flex flex-col items-center justify-center text-center text-xs sm:text-sm font-bold shadow-md overflow-hidden select-none hover:scale-[1.02] transition-transform duration-200 ${statusClasses(
        status
      )} ${animateFlip ? 'animate-cell-flip' : ''}`}
    >
      {direction && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none"
        >
          {direction === 'higher' ? (
            <ArrowUp className="w-16 h-16 stroke-[3]" />
          ) : (
            <ArrowDown className="w-16 h-16 stroke-[3]" />
          )}
        </span>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 leading-tight break-words max-w-full px-1 drop-shadow-xs">
        {children}
      </div>
    </div>
  );
}

interface GuessGridProps {
  mode: 'card' | 'character';
  guesses: CanonicalCard[];
  target: CanonicalCard;
  latestGuessId?: number | null;
}

export default function GuessGrid({
  mode,
  guesses,
  target,
  latestGuessId = null,
}: GuessGridProps) {
  const { locale, t } = useApp();

  if (guesses.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 text-zinc-600 dark:text-zinc-400 text-sm animate-fade-in">
        {t.emptyStateHint}
      </div>
    );
  }

  const headers =
    mode === 'card'
      ? [
          t.columns.card,
          t.columns.type,
          t.columns.color,
          t.columns.cost,
          t.columns.inkwell,
          t.columns.story,
          t.columns.set,
          t.columns.rarity,
        ]
      : [
          t.columns.card,
          t.columns.color,
          t.columns.subtypes,
          t.columns.cost,
          t.columns.strength,
          t.columns.willpower,
          t.columns.lore,
          t.columns.set,
        ];

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <div className="w-full overflow-x-auto pb-2 -mx-2 px-2">
        <div className="min-w-[720px] space-y-2">
          {/* Column Headers */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2 px-1">
            {headers.map((h, i) => (
              <div
                key={i}
                className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-center py-1.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-900 text-zinc-700 dark:text-amber-400 border border-zinc-300 dark:border-zinc-800 ${
                  i === 0 ? 'sticky left-0 z-10' : ''
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Guess Rows */}
          {guesses.map((guess) => {
            const info = guess.translations[locale] ?? guess.translations.en;
            const isNew = guess.id === latestGuessId;

            if (mode === 'card') {
              const res = compareCardGuess(guess, target);
              return (
                <div key={guess.id} className="grid grid-cols-8 gap-1.5 sm:gap-2 items-center">
                  {/* Card Identity Cell (Sticky on mobile scroll) */}
                  <div
                    style={isNew ? { animationDelay: '0ms' } : undefined}
                    className={`sticky left-0 z-10 h-20 sm:h-24 rounded-xl bg-white dark:bg-zinc-900 border-2 border-amber-500/40 p-1 flex flex-col items-center justify-center text-center shadow-md ${
                      isNew ? 'animate-cell-flip' : ''
                    }`}
                    title={info.fullName}
                  >
                    <img
                      src={info.thumbnail || info.image}
                      alt={info.fullName}
                      className="w-9 h-11 sm:w-11 sm:h-14 object-cover rounded border border-amber-500/30"
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-0.5 px-0.5">
                      {info.fullName}
                    </span>
                  </div>

                  <ClueCell status={res.type.status} animateFlip={isNew} delayMs={90}>
                    <span>{translateType(res.type.value, locale)}</span>
                  </ClueCell>

                  <ClueCell status={res.colors.status} animateFlip={isNew} delayMs={180}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      {res.colors.value.map((c) => (
                        <span
                          key={c}
                          className={`w-3 h-3 rounded-full border ${INK_DOT_CLASS[c]}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] sm:text-xs">
                      {translateColors(res.colors.value, locale)}
                    </span>
                  </ClueCell>

                  <ClueCell
                    status={res.cost.status}
                    direction={res.cost.direction}
                    animateFlip={isNew}
                    delayMs={270}
                  >
                    <span className="text-base sm:text-lg font-black leading-none">
                      {res.cost.value}
                    </span>
                  </ClueCell>

                  <ClueCell status={res.inkwell.status} animateFlip={isNew} delayMs={360}>
                    <span>
                      {res.inkwell.value ? t.inkwellValues.yes : t.inkwellValues.no}
                    </span>
                  </ClueCell>

                  <ClueCell status={res.story.status} animateFlip={isNew} delayMs={450}>
                    <span className="text-[11px] sm:text-xs line-clamp-3">
                      {translateStory(res.story.value, locale)}
                    </span>
                  </ClueCell>

                  <ClueCell
                    status={res.sets.status}
                    direction={res.sets.direction}
                    animateFlip={isNew}
                    delayMs={540}
                  >
                    <span>{formatSets(res.sets.value)}</span>
                  </ClueCell>

                  <ClueCell
                    status={res.rarity.status}
                    direction={res.rarity.direction}
                    animateFlip={isNew}
                    delayMs={630}
                  >
                    <span className="text-[11px] sm:text-xs">
                      {translateRarity(res.rarity.value, locale)}
                    </span>
                  </ClueCell>
                </div>
              );
            }

            const charRes = compareCharacterGuess(guess, target);
            return (
              <div key={guess.id} className="grid grid-cols-8 gap-1.5 sm:gap-2 items-center">
                <div
                  style={isNew ? { animationDelay: '0ms' } : undefined}
                  className={`sticky left-0 z-10 h-20 sm:h-24 rounded-xl bg-white dark:bg-zinc-900 border-2 border-amber-500/40 p-1 flex flex-col items-center justify-center text-center shadow-md ${
                    isNew ? 'animate-cell-flip' : ''
                  }`}
                  title={info.fullName}
                >
                  <img
                    src={info.thumbnail || info.image}
                    alt={info.fullName}
                    className="w-9 h-11 sm:w-11 sm:h-14 object-cover rounded border border-amber-500/30"
                  />
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-0.5 px-0.5">
                    {info.fullName}
                  </span>
                </div>

                <ClueCell status={charRes.colors.status} animateFlip={isNew} delayMs={90}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {charRes.colors.value.map((c) => (
                      <span
                        key={c}
                        className={`w-3 h-3 rounded-full border ${INK_DOT_CLASS[c]}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] sm:text-xs">
                    {translateColors(charRes.colors.value, locale)}
                  </span>
                </ClueCell>

                <ClueCell status={charRes.subtypes.status} animateFlip={isNew} delayMs={180}>
                  <span className="text-[10px] sm:text-xs line-clamp-3">
                    {translateSubtypes(charRes.subtypes.value, locale)}
                  </span>
                </ClueCell>

                <ClueCell
                  status={charRes.cost.status}
                  direction={charRes.cost.direction}
                  animateFlip={isNew}
                  delayMs={270}
                >
                  <span className="text-base sm:text-lg font-black leading-none">
                    {charRes.cost.value}
                  </span>
                </ClueCell>

                <ClueCell
                  status={charRes.strength.status}
                  direction={charRes.strength.direction}
                  animateFlip={isNew}
                  delayMs={360}
                >
                  <span className="text-base sm:text-lg font-black leading-none">
                    {charRes.strength.value}
                  </span>
                </ClueCell>

                <ClueCell
                  status={charRes.willpower.status}
                  direction={charRes.willpower.direction}
                  animateFlip={isNew}
                  delayMs={450}
                >
                  <span className="text-base sm:text-lg font-black leading-none">
                    {charRes.willpower.value}
                  </span>
                </ClueCell>

                <ClueCell
                  status={charRes.lore.status}
                  direction={charRes.lore.direction}
                  animateFlip={isNew}
                  delayMs={540}
                >
                  <span className="text-base sm:text-lg font-black leading-none">
                    {charRes.lore.value}
                  </span>
                </ClueCell>

                <ClueCell
                  status={charRes.sets.status}
                  direction={charRes.sets.direction}
                  animateFlip={isNew}
                  delayMs={630}
                >
                  <span>{formatSets(charRes.sets.value)}</span>
                </ClueCell>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-2.5 px-4 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
        <span className="font-bold text-amber-600 dark:text-amber-400">{t.legend.title} :</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
          {t.legend.exact}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" />
          {t.legend.partial}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-600 inline-block" />
          {t.legend.wrong}
        </span>
        <span className="inline-flex items-center gap-1">
          <strong className="text-amber-500">↑</strong> {t.legend.higher}
        </span>
        <span className="inline-flex items-center gap-1">
          <strong className="text-amber-500">↓</strong> {t.legend.lower}
        </span>
      </div>
    </div>
  );
}
