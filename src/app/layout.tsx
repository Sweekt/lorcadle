import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Lorcadle — Le défi quotidien Disney Lorcana',
  description:
    'Devine chaque jour la carte Disney Lorcana mystère en mode Classique, Personnage ou Carte Floutée !',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-amber-50/20 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <AppProvider>
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
