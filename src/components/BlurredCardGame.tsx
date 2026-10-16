'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { CanonicalCard } from '@/types/game';
import { useApp } from '@/context/AppContext';

const BLUR_STEPS = [28, 22, 17, 13, 9, 6, 3, 0];

interface BlurredCardGameProps {
  guesses: CanonicalCard[];
  target: CanonicalCard;
  won: boolean;
  latestGuessId?: number | null;
}

export default function BlurredCardGame({
  guesses,
  target,
  won,
  latestGuessId = null,
}: BlurredCardGameProps) {
  const { locale, t } = useApp();
  const targetInfo = target.translations[locale] ?? target.translations.en;

  const blurPx = won
    ? 0
    : BLUR_STEPS[Math.min(guesses.length, BLUR_STEPS.length - 1)];

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto animate-fade-in">
      {/* Blurred Card Showcase (hidden once won since VictoryModal displays the card) */}
      {!won && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-52 sm:w-60 aspect-[2.5/3.5] rounded-2xl overflow-hidden border-4 border-amber-500/50 shadow-2xl shadow-amber-500/15 bg-zinc-900 select-none transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={targetInfo.image}
              alt="Carte mystère Lorcadle"
              draggable={false}
              style={{
                filter: `blur(${blurPx}px)`,
                transform: blurPx > 0 ? 'scale(1.08)' : 'scale(1)',
              }}
              className="w-full h-full object-cover transition-all duration-700 pointer-events-none"
            />
          </div>
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {t.blurMode.hintLevel(guesses.length)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            {t.blurMode.instruction}
          </p>
        </div>
      )}

      {/* Previous attempts list */}
      {guesses.length > 0 && (
        <div className="w-full space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
            {t.blurMode.previousGuesses} ({t.attemptsCount(guesses.length)})
          </h3>
          <div className="space-y-2">
            {guesses.map((g) => {
              const info = g.translations[locale] ?? g.translations.en;
              const isMatch = g.id === target.id;
              const isNew = g.id === latestGuessId;
              return (
                <div
                  key={g.id}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border-2 font-bold text-sm shadow-sm ${
                    isMatch
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : 'bg-rose-600/90 text-white border-rose-400'
                  } ${isNew ? 'animate-cell-flip' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={info.thumbnail || info.image}
                      alt={info.fullName}
                      className="w-9 h-12 object-cover rounded border border-white/30 shrink-0"
                    />
                    <span className="truncate">{info.fullName}</span>
                  </div>
                  {isMatch ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
