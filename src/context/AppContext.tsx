'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Locale } from '@/types/game';
import { UI_TRANSLATIONS, type UILabels } from '@/lib/i18n';
import { loadSavedLocale, loadSavedTheme, saveLocale, saveTheme } from '@/lib/storage';

interface AppContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  t: UILabels;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const initialLocale = loadSavedLocale();
    const initialTheme = loadSavedTheme();
    setLocaleState(initialLocale);
    setThemeState(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    document.documentElement.classList.toggle('light', initialTheme === 'light');
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    saveLocale(next);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    saveTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.classList.toggle('light', next === 'light');
  };

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        toggleTheme,
        t: UI_TRANSLATIONS[locale],
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
