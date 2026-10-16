'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Share2, Trophy } from 'lucide-react';
import type { CanonicalCard, GameMode, MatchStatus } from '@/types/game';
import { compareCardGuess, compareCharacterGuess } from '@/lib/compare';
import { useApp } from '@/context/AppContext';

function statusEmoji(status: MatchStatus, direction?: 'higher' | 'lower'): string {
  if (status === 'exact') return '🟩';
  if (status === 'partial') return '🟧';
  if (direction === 'higher') return '⬆️';
  if (direction === 'lower') return '⬇️';
  return '🟥';
}

interface VictoryModalProps {
  mode: GameMode;
  dateKey: string;
  target: CanonicalCard;
  guesses: CanonicalCard[];
}

export default function VictoryModal({
  mode,
  dateKey,
  target,
  guesses,
}: VictoryModalProps) {
  const { locale, t } = useApp();
  const [copied, setCopied] = useState(false);

  const targetInfo = target.translations[locale] ?? target.translations.en;

  const nextModeInfo: { href: string; label: string } | null =
    mode === 'card'
      ? { href: '/character', label: t.modes.character.title }
      : mode === 'character'
        ? { href: '/blur', label: t.modes.blur.title }
        : null;

  const handleShare = async () => {
    const modeTitle = t.modes[mode].title;
    const rows = guesses.slice(0, 6).map((g) => {
      if (mode === 'card') {
        const r = compareCardGuess(g, target);
        return [
          statusEmoji(r.type.status),
          statusEmoji(r.colors.status),
          statusEmoji(r.cost.status, r.cost.direction),
          statusEmoji(r.inkwell.status),
          statusEmoji(r.story.status),
          statusEmoji(r.sets.status, r.sets.direction),
          statusEmoji(r.rarity.status, r.rarity.direction),
        ].join('');
      }
      if (mode === 'character') {
        const r = compareCharacterGuess(g, target);
        return [
          statusEmoji(r.colors.status),
          statusEmoji(r.subtypes.status),
          statusEmoji(r.cost.status, r.cost.direction),
          statusEmoji(r.strength.status, r.strength.direction),
          statusEmoji(r.willpower.status, r.willpower.direction),
          statusEmoji(r.lore.status, r.lore.direction),
          statusEmoji(r.sets.status, r.sets.direction),
        ].join('');
      }
      return g.id === target.id ? '🖼️🟩' : '🖼️🟥';
    });

    const text = `Lorcadle — ${modeTitle} (${dateKey})\n🎯 ${t.attemptsCount(
      guesses.length
    )}\n\n${rows.join('\n')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/15 via-white to-white dark:from-amber-500/15 dark:via-zinc-900 dark:to-zinc-900 p-5 sm:p-6 shadow-2xl shadow-amber-500/10 animate-victory-pop">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <img
          src={targetInfo.image}
          alt={targetInfo.fullName}
          className="w-36 sm:w-40 rounded-xl border-2 border-amber-400 shadow-lg shrink-0"
        />
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>{t.victory.title}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            {targetInfo.fullName}
          </h2>

          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {t.victory.foundIn(guesses.length)}
          </p>

          {targetInfo.flavorText && (
            <blockquote className="text-xs italic text-zinc-500 dark:text-zinc-400 border-l-2 border-amber-500/50 pl-2.5 my-1">
              {targetInfo.flavorText}
            </blockquote>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2 w-full">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold transition-colors border border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? t.victory.copied : t.victory.share}</span>
            </button>

            {nextModeInfo ? (
              <Link
                href={nextModeInfo.href}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
              >
                <span>
                  {t.victory.nextMode} {nextModeInfo.label}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {t.victory.allModesCompleted}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
