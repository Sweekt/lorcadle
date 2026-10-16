'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { CanonicalCard, DailyModeState, GameMode } from '@/types/game';
import { ALL_CARDS, getCardById } from '@/lib/cards';
import { getDailyCard, getParisDateKey } from '@/lib/daily-seed';
import { loadModeState, recordGuess } from '@/lib/storage';
import { useApp } from '@/context/AppContext';
import Header from './Header';
import CardSearchInput from './CardSearchInput';
import GuessGrid from './GuessGrid';
import BlurredCardGame from './BlurredCardGame';
import VictoryModal from './VictoryModal';

interface DailyGameViewProps {
  mode: GameMode;
}

export default function DailyGameView({ mode }: DailyGameViewProps) {
  const { t } = useApp();
  const [dateKey, setDateKey] = useState<string>(() => getParisDateKey());
  const [modeState, setModeState] = useState<DailyModeState | null>(null);
  const [latestGuessId, setLatestGuessId] = useState<number | null>(null);
  const [completedModes, setCompletedModes] = useState<Record<GameMode, boolean>>({
    card: false,
    character: false,
    blur: false,
  });

  useEffect(() => {
    const key = getParisDateKey();
    setDateKey(key);
    const loaded = loadModeState(key, mode);
    setModeState(loaded);
    setLatestGuessId(null);
    setCompletedModes({
      card: loadModeState(key, 'card').won,
      character: loadModeState(key, 'character').won,
      blur: loadModeState(key, 'blur').won,
    });
  }, [mode]);

  const targetCard = useMemo(
    () => getDailyCard(ALL_CARDS, dateKey, mode),
    [dateKey, mode]
  );

  const guesses: CanonicalCard[] = useMemo(() => {
    if (!modeState) return [];
    return modeState.guessedIds
      .map((id) => getCardById(id))
      .filter((c): c is CanonicalCard => c !== undefined);
  }, [modeState]);

  const excludedIds = useMemo(
    () => new Set(modeState?.guessedIds ?? []),
    [modeState]
  );

  const handleSelectCard = (card: CanonicalCard) => {
    const isWin = card.id === targetCard.id;
    const updated = recordGuess(dateKey, mode, card.id, isWin);
    setLatestGuessId(card.id);
    setModeState(updated);
    if (isWin) {
      setCompletedModes((prev) => ({ ...prev, [mode]: true }));
    }
  };

  const won = Boolean(modeState?.won);

  return (
    <div className="flex flex-col flex-1">
      <Header
        activeMode={mode}
        streak={modeState?.currentStreak ?? 0}
        completedModes={completedModes}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 flex flex-col justify-center">
        {/* Mode Title & Subtitle */}
        <div className="text-center space-y-1 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t.modes[mode].title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.modes[mode].subtitle}
          </p>
        </div>

        {/* Search Input (hidden once won) */}
        {!won && (
          <CardSearchInput
            mode={mode}
            excludedIds={excludedIds}
            onSelectCard={handleSelectCard}
          />
        )}

        {/* Victory Card */}
        {won && (
          <VictoryModal
            mode={mode}
            dateKey={dateKey}
            target={targetCard}
            guesses={guesses}
            completedModes={completedModes}
          />
        )}

        {/* Mode Content */}
        {mode === 'blur' ? (
          <BlurredCardGame
            guesses={guesses}
            target={targetCard}
            won={won}
            latestGuessId={latestGuessId}
          />
        ) : (
          <GuessGrid
            mode={mode}
            guesses={guesses}
            target={targetCard}
            latestGuessId={latestGuessId}
          />
        )}
      </main>
    </div>
  );
}
