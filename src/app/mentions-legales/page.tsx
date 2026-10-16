'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MentionsLegalesPage() {
  const { t } = useApp();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fade-in">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.legal.backToGame}</span>
      </Link>

      <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
        {t.legal.title}
      </h1>

      <section className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          {t.legal.ipTitle}
        </h2>
        <p>{t.legal.ipText1}</p>
        <p>{t.legal.ipText2}</p>
      </section>

      <section className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          {t.legal.privacyTitle}
        </h2>
        <p>{t.legal.privacyText}</p>
      </section>
    </main>
  );
}
