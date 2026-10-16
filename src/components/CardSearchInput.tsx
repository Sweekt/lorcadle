'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { CanonicalCard, GameMode } from '@/types/game';
import { ALL_CARDS, searchCards } from '@/lib/cards';
import { useApp } from '@/context/AppContext';

interface CardSearchInputProps {
  mode: GameMode;
  excludedIds: ReadonlySet<number>;
  disabled?: boolean;
  onSelectCard: (card: CanonicalCard) => void;
}

export default function CardSearchInput({
  mode,
  excludedIds,
  disabled = false,
  onSelectCard,
}: CardSearchInputProps) {
  const { locale, t } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchCards(ALL_CARDS, query, locale, excludedIds, mode, 10);
  }, [query, locale, excludedIds, mode]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (card: CanonicalCard) => {
    onSelectCard(card);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = results[highlightedIndex];
      if (chosen) handleSelect(chosen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const placeholder =
    mode === 'character' ? t.searchCharacterPlaceholder : t.searchPlaceholder;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-20">
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-amber-500 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-amber-500/40 dark:border-amber-500/30 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm sm:text-base font-medium shadow-lg shadow-amber-500/5 focus:outline-none transition-all disabled:opacity-50"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 dark:border-zinc-700 shadow-2xl max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/70 animate-dropdown-in">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t.noResults}
            </div>
          ) : (
            results.map((card, idx) => {
              const info = card.translations[locale] ?? card.translations.en;
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelect(card)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                    isHighlighted
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 text-zinc-950 dark:text-white'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <img
                    src={info.thumbnail || info.image}
                    alt={info.fullName}
                    loading="lazy"
                    className="w-10 h-14 object-cover rounded-md border border-amber-500/30 shrink-0 bg-zinc-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base truncate">
                      {info.fullName}
                    </p>
                    {locale !== 'en' && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {card.translations.en.fullName}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
