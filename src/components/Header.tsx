'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Eye, Flame, Layers, Moon, Sparkles, Sun, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { GameMode, Locale } from '@/types/game';

const LOCALE_LABELS: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
];

interface HeaderProps {
  activeMode: GameMode;
  streak: number;
  completedModes: Record<GameMode, boolean>;
}

export default function Header({ activeMode, streak, completedModes }: HeaderProps) {
  const { locale, setLocale, theme, toggleTheme, t } = useApp();
  const pathname = usePathname();

  const navItems: { mode: GameMode; href: string; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'card',
      href: '/',
      label: t.modes.card.title,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      mode: 'character',
      href: '/character',
      label: t.modes.character.title,
      icon: <User className="w-4 h-4" />,
    },
    {
      mode: 'blur',
      href: '/blur',
      label: t.modes.blur.title,
      icon: <Eye className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-amber-500/20 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col gap-3">
        {/* Top Row: Logo + Controls */}
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                LORCADLE
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block leading-none">
                {t.subtitle}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Streak badge */}
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold"
              title={t.stats.streak}
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak}</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-zinc-800">
              {LOCALE_LABELS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    locale === item.code
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Basculer le thème clair/sombre"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-amber-400 hover:border-amber-500/50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mode Switcher Bar */}
        <nav className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {navItems.map((item) => {
            const isActive = item.mode === activeMode || pathname === item.href;
            const isDone = completedModes[item.mode];
            return (
              <Link
                key={item.mode}
                href={item.href}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {isDone && (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-zinc-950' : 'text-emerald-500'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
