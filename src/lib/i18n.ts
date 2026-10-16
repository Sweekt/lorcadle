import type { CardType, InkColor, Locale, Rarity } from '@/types/game';
import { DICTIONARIES } from './cards';

export interface UILabels {
  subtitle: string;
  modes: {
    card: { title: string; subtitle: string };
    character: { title: string; subtitle: string };
    blur: { title: string; subtitle: string };
  };
  searchPlaceholder: string;
  searchCharacterPlaceholder: string;
  noResults: string;
  attemptsCount: (n: number) => string;
  columns: {
    card: string;
    type: string;
    color: string;
    cost: string;
    inkwell: string;
    story: string;
    set: string;
    rarity: string;
    subtypes: string;
    strength: string;
    willpower: string;
    lore: string;
  };
  inkwellValues: {
    yes: string;
    no: string;
  };
  legend: {
    title: string;
    exact: string;
    partial: string;
    wrong: string;
    higher: string;
    lower: string;
  };
  blurMode: {
    hintLevel: (attempt: number) => string;
    instruction: string;
    previousGuesses: string;
  };
  victory: {
    title: string;
    foundIn: (n: number) => string;
    share: string;
    copied: string;
    nextMode: string;
    allModesCompleted: string;
    comeBackTomorrow: string;
  };
  stats: {
    streak: string;
    maxStreak: string;
    wins: string;
  };
  emptyStateHint: string;
  footer: {
    createdBy: string;
    disclaimer: string;
    supportServer: string;
    supportServerTitle: string;
    legalNotice: string;
  };
  legal: {
    backToGame: string;
    title: string;
    ipTitle: string;
    ipText1: string;
    ipText2: string;
    privacyTitle: string;
    privacyText: string;
  };
}

export const UI_TRANSLATIONS: Record<Locale, UILabels> = {
  fr: {
    subtitle: 'Le défi quotidien Disney Lorcana',
    modes: {
      card: {
        title: 'Guess the Card',
        subtitle: 'Devine la carte du jour parmi toutes les cartes Lorcana',
      },
      character: {
        title: 'Guess the Character',
        subtitle: 'Devine le personnage du jour grâce à ses statistiques',
      },
      blur: {
        title: 'Carte Floutée',
        subtitle: "Retrouve la carte du jour à partir de son illustration floutée",
      },
    },
    searchPlaceholder: 'Tape le nom d’une carte (ex: Ariel, Soyez prêtes...)',
    searchCharacterPlaceholder: 'Tape le nom d’un personnage (ex: Elsa, Mickey...)',
    noResults: 'Aucune carte correspondante disponible',
    attemptsCount: (n) => `${n} ${n > 1 ? 'essais' : 'essai'}`,
    columns: {
      card: 'Carte',
      type: 'Type',
      color: 'Couleur',
      cost: 'Coût',
      inkwell: 'Encrable',
      story: 'Franchise',
      set: 'Set',
      rarity: 'Rareté',
      subtypes: 'Sous-type',
      strength: 'Force',
      willpower: 'Volonté',
      lore: 'Lore',
    },
    inkwellValues: {
      yes: 'Oui',
      no: 'Non',
    },
    legend: {
      title: 'Légende des indices',
      exact: 'Exact',
      partial: 'Partiel',
      wrong: 'Incorrect',
      higher: 'Plus haut',
      lower: 'Plus bas',
    },
    blurMode: {
      hintLevel: (attempt) => `Niveau de netteté : palier ${attempt + 1}`,
      instruction: 'Chaque essai incorrect réduit le flou de la carte !',
      previousGuesses: 'Tes propositions',
    },
    victory: {
      title: 'Victoire !',
      foundIn: (n) => `Carte trouvée en ${n} ${n > 1 ? 'essais' : 'essai'} !`,
      share: 'Partager mon résultat',
      copied: 'Résultat copié !',
      nextMode: 'Mode suivant :',
      allModesCompleted: 'Tu as terminé les 3 défis du jour !',
      comeBackTomorrow: 'Reviens demain à minuit pour de nouvelles cartes.',
    },
    stats: {
      streak: 'Série',
      maxStreak: 'Record',
      wins: 'Victoires',
    },
    emptyStateHint: 'Choisis une première carte ci-dessus pour révéler les premiers indices !',
    footer: {
      createdBy: 'Créé par',
      disclaimer:
        "Lorcadle n'est pas affilié à Disney ou Ravensburger. Disney Lorcana est une marque déposée de Disney et Ravensburger.",
      supportServer: 'Soutenir le serveur',
      supportServerTitle: 'Participer aux frais du serveur sur Ko-fi',
      legalNotice: 'Mentions Légales',
    },
    legal: {
      backToGame: 'Retour au jeu',
      title: 'Mentions Légales',
      ipTitle: 'Propriété intellectuelle & Clause de non-affiliation',
      ipText1:
        'Lorcadle est un projet communautaire gratuit et non commercial créé par Sweek (Team Wardens).',
      ipText2:
        "Ce site utilise des marques déposées et/ou des droits d'auteur associés à Disney Lorcana TCG, utilisés dans le cadre de la politique d'utilisation communautaire de Ravensburger (Ravensburger Community Code). Nous ne sommes pas approuvés, sponsorisés ou affiliés à Disney ou Ravensburger.",
      privacyTitle: 'Données personnelles & Cookies',
      privacyText:
        "Lorcadle ne collecte aucune donnée personnelle et n'utilise aucun cookie de suivi publicitaire. Vos parties du jour, séries de victoires, préférences de langue et de thème sont uniquement stockées localement sur votre appareil via le localStorage de votre navigateur.",
    },
  },
  en: {
    subtitle: 'The Daily Disney Lorcana Challenge',
    modes: {
      card: {
        title: 'Guess the Card',
        subtitle: 'Find today’s card among all canonical Lorcana cards',
      },
      character: {
        title: 'Guess the Character',
        subtitle: 'Deduce today’s character using combat & lore stats',
      },
      blur: {
        title: 'Blurred Card',
        subtitle: 'Identify today’s card from its progressively unblurred artwork',
      },
    },
    searchPlaceholder: 'Type a card name (e.g. Ariel, Be Prepared...)',
    searchCharacterPlaceholder: 'Type a character name (e.g. Elsa, Mickey...)',
    noResults: 'No matching card available',
    attemptsCount: (n) => `${n} ${n === 1 ? 'guess' : 'guesses'}`,
    columns: {
      card: 'Card',
      type: 'Type',
      color: 'Color',
      cost: 'Cost',
      inkwell: 'Inkable',
      story: 'Franchise',
      set: 'Set',
      rarity: 'Rarity',
      subtypes: 'Subtypes',
      strength: 'Strength',
      willpower: 'Willpower',
      lore: 'Lore',
    },
    inkwellValues: {
      yes: 'Yes',
      no: 'No',
    },
    legend: {
      title: 'Clue Legend',
      exact: 'Exact',
      partial: 'Partial',
      wrong: 'Wrong',
      higher: 'Higher',
      lower: 'Lower',
    },
    blurMode: {
      hintLevel: (attempt) => `Clarity level: stage ${attempt + 1}`,
      instruction: 'Every wrong guess makes the card sharper!',
      previousGuesses: 'Your guesses',
    },
    victory: {
      title: 'Victory!',
      foundIn: (n) => `Found in ${n} ${n === 1 ? 'try' : 'tries'}!`,
      share: 'Share my result',
      copied: 'Copied to clipboard!',
      nextMode: 'Next mode:',
      allModesCompleted: 'You completed all 3 daily challenges!',
      comeBackTomorrow: 'Come back tomorrow at midnight for new cards.',
    },
    stats: {
      streak: 'Streak',
      maxStreak: 'Best',
      wins: 'Wins',
    },
    emptyStateHint: 'Pick your first card above to reveal your first clues!',
    footer: {
      createdBy: 'Created by',
      disclaimer:
        'Lorcadle is not affiliated with Disney or Ravensburger. Disney Lorcana is a registered trademark of Disney and Ravensburger.',
      supportServer: 'Support the server',
      supportServerTitle: 'Help cover server costs on Ko-fi',
      legalNotice: 'Legal Notice',
    },
    legal: {
      backToGame: 'Back to game',
      title: 'Legal Notice',
      ipTitle: 'Intellectual Property & Non-Affiliation Disclaimer',
      ipText1:
        'Lorcadle is a free, non-commercial community project created by Sweek (Team Wardens).',
      ipText2:
        'This website uses trademarks and/or copyrights associated with Disney Lorcana TCG, used under Ravensburger’s Community Code policy. We are not endorsed, sponsored, or affiliated with Disney or Ravensburger.',
      privacyTitle: 'Privacy & Local Storage',
      privacyText:
        'Lorcadle collects no personal data and uses no advertising or tracking cookies. Your daily progress, win streaks, language, and theme preferences are stored exclusively on your device via your browser’s localStorage.',
    },
  },
  de: {
    subtitle: 'Die tägliche Disney Lorcana Herausforderung',
    modes: {
      card: {
        title: 'Guess the Card',
        subtitle: 'Errate die heutige Karte aus allen Lorcana-Karten',
      },
      character: {
        title: 'Guess the Character',
        subtitle: 'Errate den heutigen Charakter anhand seiner Werte',
      },
      blur: {
        title: 'Verschwommene Karte',
        subtitle: 'Erkenne die heutige Karte anhand ihres unscharfen Bildes',
      },
    },
    searchPlaceholder: 'Kartenname eingeben (z. B. Arielle, Seid bereit...)',
    searchCharacterPlaceholder: 'Charaktername eingeben (z. B. Elsa, Micky...)',
    noResults: 'Keine passende Karte gefunden',
    attemptsCount: (n) => `${n} ${n === 1 ? 'Versuch' : 'Versuche'}`,
    columns: {
      card: 'Karte',
      type: 'Typ',
      color: 'Farbe',
      cost: 'Kosten',
      inkwell: 'Tintenfass',
      story: 'Franchise',
      set: 'Set',
      rarity: 'Seltenheit',
      subtypes: 'Untertyp',
      strength: 'Stärke',
      willpower: 'Willenskraft',
      lore: 'Legende',
    },
    inkwellValues: {
      yes: 'Ja',
      no: 'Nein',
    },
    legend: {
      title: 'Hinweis-Legende',
      exact: 'Exakt',
      partial: 'Teilweise',
      wrong: 'Falsch',
      higher: 'Höher',
      lower: 'Niedriger',
    },
    blurMode: {
      hintLevel: (attempt) => `Schärfestufe: ${attempt + 1}`,
      instruction: 'Jeder falsche Versuch macht das Bild schärfer!',
      previousGuesses: 'Deine Versuche',
    },
    victory: {
      title: 'Sieg!',
      foundIn: (n) => `In ${n} ${n === 1 ? 'Versuch' : 'Versuchen'} gefunden!`,
      share: 'Ergebnis teilen',
      copied: 'Kopiert!',
      nextMode: 'Nächster Modus:',
      allModesCompleted: 'Du hast alle 3 täglichen Herausforderungen gelöst!',
      comeBackTomorrow: 'Komm morgen um Mitternacht für neue Karten wieder.',
    },
    stats: {
      streak: 'Serie',
      maxStreak: 'Rekord',
      wins: 'Siege',
    },
    emptyStateHint: 'Wähle oben deine erste Karte, um die ersten Hinweise aufzudecken!',
    footer: {
      createdBy: 'Erstellt von',
      disclaimer:
        'Lorcadle steht in keiner Verbindung zu Disney oder Ravensburger. Disney Lorcana ist eine eingetragene Marke von Disney und Ravensburger.',
      supportServer: 'Server unterstützen',
      supportServerTitle: 'Serverkosten auf Ko-fi unterstützen',
      legalNotice: 'Impressum & Rechtliches',
    },
    legal: {
      backToGame: 'Zurück zum Spiel',
      title: 'Impressum & Rechtliche Hinweise',
      ipTitle: 'Urheberrecht & Haftungsausschluss',
      ipText1:
        'Lorcadle ist ein kostenloses, nicht-kommerzielles Community-Projekt von Sweek (Team Wardens).',
      ipText2:
        'Diese Website verwendet Marken und/oder Urheberrechte in Verbindung mit Disney Lorcana TCG gemäß dem Ravensburger Community Code. Wir werden weder von Disney noch von Ravensburger unterstützt, gesponsert oder sind mit ihnen verbunden.',
      privacyTitle: 'Datenschutz & Lokale Speicherung',
      privacyText:
        'Lorcadle erhebt keine personenbezogenen Daten und verwendet keine Tracking-Cookies. Dein täglicher Spielfortschritt, deine Siegesserien sowie Sprach- und Design-Einstellungen werden ausschließlich lokal im Browser (localStorage) gespeichert.',
    },
  },
  it: {
    subtitle: 'La sfida quotidiana di Disney Lorcana',
    modes: {
      card: {
        title: 'Guess the Card',
        subtitle: 'Indovina la carta del giorno tra tutte le carte Lorcana',
      },
      character: {
        title: 'Guess the Character',
        subtitle: 'Indovina il personaggio del giorno grazie alle sue statistiche',
      },
      blur: {
        title: 'Carta Sfocata',
        subtitle: 'Riconosci la carta del giorno dalla sua illustrazione sfocata',
      },
    },
    searchPlaceholder: 'Scrivi il nome di una carta (es. Ariel, Sii Preparato...)',
    searchCharacterPlaceholder: 'Scrivi il nome di un personaggio (es. Elsa, Topolino...)',
    noResults: 'Nessuna carta corrispondente trovata',
    attemptsCount: (n) => `${n} ${n === 1 ? 'tentativo' : 'tentativi'}`,
    columns: {
      card: 'Carta',
      type: 'Tipo',
      color: 'Colore',
      cost: 'Costo',
      inkwell: 'Inchiostrabile',
      story: 'Franchise',
      set: 'Set',
      rarity: 'Rarità',
      subtypes: 'Sottotipo',
      strength: 'Forza',
      willpower: 'Volontà',
      lore: 'Leggenda',
    },
    inkwellValues: {
      yes: 'Sì',
      no: 'No',
    },
    legend: {
      title: 'Legenda indizi',
      exact: 'Esatto',
      partial: 'Parziale',
      wrong: 'Errato',
      higher: 'Più alto',
      lower: 'Più basso',
    },
    blurMode: {
      hintLevel: (attempt) => `Livello nitidezza: ${attempt + 1}`,
      instruction: 'Ogni tentativo errato rende la carta più nitida!',
      previousGuesses: 'I tuoi tentativi',
    },
    victory: {
      title: 'Vittoria!',
      foundIn: (n) => `Carta trovata in ${n} ${n === 1 ? 'tentativo' : 'tentativi'}!`,
      share: 'Condividi risultato',
      copied: 'Copiato!',
      nextMode: 'Prossima modalità:',
      allModesCompleted: 'Hai completato tutte e 3 le sfide di oggi!',
      comeBackTomorrow: 'Torna domani a mezzanotte per nuove carte.',
    },
    stats: {
      streak: 'Serie',
      maxStreak: 'Record',
      wins: 'Vittorie',
    },
    emptyStateHint: 'Scegli una prima carta qui sopra per rivelare i primi indizi!',
    footer: {
      createdBy: 'Creato da',
      disclaimer:
        'Lorcadle non è affiliato con Disney o Ravensburger. Disney Lorcana è un marchio registrato di Disney e Ravensburger.',
      supportServer: 'Sostieni il server',
      supportServerTitle: 'Contribuisci ai costi del server su Ko-fi',
      legalNotice: 'Note Legali',
    },
    legal: {
      backToGame: 'Torna al gioco',
      title: 'Note Legali',
      ipTitle: 'Proprietà Intellettuale & Clausola di non affiliazione',
      ipText1:
        'Lorcadle è un progetto comunitario gratuito e non commerciale creato da Sweek (Team Wardens).',
      ipText2:
        'Questo sito utilizza marchi registrati e/o diritti d’autore associati a Disney Lorcana TCG, in conformità con il Community Code di Ravensburger. Non siamo approvati, sponsorizzati o affiliati con Disney o Ravensburger.',
      privacyTitle: 'Privacy & Archiviazione Locale',
      privacyText:
        'Lorcadle non raccoglie dati personali e non utilizza cookie di profilazione. I tuoi progressi giornalieri, le serie di vittorie e le preferenze di lingua e tema sono salvati esclusivamente sul tuo dispositivo tramite il localStorage del browser.',
    },
  },
};

export function translateType(type: CardType, locale: Locale): string {
  return DICTIONARIES.types[type]?.[locale] ?? type;
}

export function translateRarity(rarity: Rarity, locale: Locale): string {
  return DICTIONARIES.rarities[rarity]?.[locale] ?? rarity;
}

export function translateColor(color: InkColor, locale: Locale): string {
  return DICTIONARIES.colors[color]?.[locale] ?? color;
}

export function translateColors(colors: readonly InkColor[], locale: Locale): string {
  return colors.map((c) => translateColor(c, locale)).join(' / ');
}

export function translateStory(story: string, locale: Locale): string {
  return DICTIONARIES.stories[story]?.[locale] ?? story;
}

export function translateSubtypes(subtypes: readonly string[], locale: Locale): string {
  if (!subtypes || subtypes.length === 0) return '—';
  return subtypes
    .map((st) => DICTIONARIES.subtypes[st]?.[locale] ?? st)
    .join(' • ');
}

export function formatSets(sets: readonly number[]): string {
  return sets.map((s) => `Ch. ${s}`).join(', ');
}
