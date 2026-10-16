'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="border-t border-amber-500/20 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md py-4 sm:py-5 mt-auto transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Crédits et Branding */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap justify-center">
            <span>{t.footer.createdBy}</span>
            <a
              href="https://sweek.ovh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 font-semibold hover:text-amber-500 dark:hover:text-amber-300 transition-colors inline-flex items-center gap-1 hover:underline"
            >
              Sweek
            </a>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Team Wardens</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-500 text-[11px] sm:text-xs max-w-lg">
            {t.footer.disclaimer}
          </p>
        </div>

        {/* Liens sociaux et mentions légales */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          {/* Réseaux sociaux */}
          <div className="flex items-center gap-2">
            {/* GitHub */}
            <a
              href="https://github.com/Sweekt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Sweek"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shadow-sm"
              title="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com/BenSweek"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) Sweek"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shadow-sm"
              title="X (Twitter)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Site web sweek.ovh */}
            <a
              href="https://sweek.ovh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="sweek.ovh"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shadow-sm"
              title="sweek.ovh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </a>

            {/* Ko-fi */}
            <a
              href="https://ko-fi.com/sweek"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.supportServer}
              className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-amber-400 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shadow-sm inline-flex items-center gap-1.5 text-xs font-medium leading-4"
              title={t.footer.supportServerTitle}
            >
              <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{t.footer.supportServer}</span>
            </a>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

          {/* Mentions Légales */}
          <Link
            href="/mentions-legales"
            className="text-xs text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {t.footer.legalNotice}
          </Link>
        </div>
      </div>
    </footer>
  );
}
