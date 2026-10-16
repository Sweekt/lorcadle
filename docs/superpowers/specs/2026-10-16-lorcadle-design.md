# Lorcadle — Document de Conception (Design Spec)

**Date** : 2026-10-16  
**Statut** : En revue  
**Stack cible** : Next.js (App Router) • TypeScript • Tailwind CSS

---

## 1. Intention et Objectif (« Le Pourquoi »)

**Lorcadle** est un jeu web quotidien de déduction dédié à l'univers du jeu de cartes à collectionner **Disney Lorcana**, directement inspiré de **Loldle** (League of Legends) et **Wordle**.

Chaque jour à minuit, tous les joueurs affrontent le même défi quotidien à travers trois modes complémentaires :
1. **Guess the Card (Mode Classique)** : Trouver la carte du jour parmi l'ensemble des cartes jouables en se basant sur ses attributs généraux.
2. **Guess the Character (Mode Personnage)** : Trouver le personnage du jour à partir de ses caractéristiques de combat et de lore.
3. **Carte Floutée (Mode Artwork)** : Identifier la carte du jour à partir de son visuel flouté qui gagne en netteté à chaque essai infructueux.

Le projet est conçu pour être **100 % autonome**, rapide, multilingue (`fr`, `en`, `de`, `it`) et découplé de `lorcana-team-tracker` (aucune dépendance à sa base de données PostgreSQL).

---

## 2. Objectifs, Non-Objectifs et Anti-Objectifs

### Objectifs (Goals)
- **Autonomie totale (Zero-DB runtime)** : Fonctionner à partir d'un dataset JSON statique optimisé généré à partir des fichiers LorcanaJSON (`allCards_en.json`, `allCards_fr.json`, `allCards_de.json`, `allCards_it.json`).
- **Unicité dans la recherche** : Chaque carte canonique (identifiée par son `fullName` anglais) n'apparaît **qu'une seule fois** dans la barre d'autocomplétion (2 680 cartes uniques au total, dont 2 023 personnages). Les rééditions dans plusieurs chapitres (ex. Set 1 et Set 9) sont fusionnées sur la même fiche.
- **Multilingue natif (FR / EN / DE / IT)** : Recherche, autocomplétion et affichage des attributs dans la langue choisie par le joueur, avec repli transparent sur l'anglais si une traduction officielle n'est pas encore présente dans LorcanaJSON (ex. sets 1-2 en italien ou fin du set 14).
- **Trois modes quotidiens indépendants** : Tirage quotidien déterministe (seed basée sur la date + le mode) garantissant que les 3 modes proposent 3 cartes différentes chaque jour et les mêmes pour tous les joueurs.
- **Essais illimités** : Le joueur peut faire autant d'essais que nécessaire ; l'objectif est de trouver en un minimum de coups.
- **Persistance locale** : Sauvegarde de la progression quotidienne par mode et des statistiques (séries/streaks, historique) dans le `localStorage` du navigateur.

### Non-Objectifs (Non-Goals pour la V1)
- Comptes utilisateurs, authentification ou classement mondial serveur.
- Modes secondaires additionnels (ex. mode citation / `flavorText`) dans le premier jalon — le dataset préparera toutefois le champ `flavorText` pour permettre son ajout immédiat par la suite.

### Anti-Objectifs (Anti-Goals)
- **Aucune dépendance vers `lorcana-team-tracker`** ou une base PostgreSQL externe.
- **Pas de doublons visuels dans l'autocomplétion** : pas de cartes Enchantées, Iconic, Epic, Promos, ni de doublons « Chapitre 1 / Chapitre 9 » dans la liste de sélection.

---

## 3. Pipeline de Données et Modèle Canonique

### 3.1 Règles de filtrage et de déduplication (Script de build `scripts/build-dataset.ts`)
À partir des 4 fichiers `allCards_{en,fr,de,it}.json` :
1. **Filtrage des sets** : Ne conserver que les sets de type `"expansion"` ayant des cartes (`hasAllCards: true`, actuellement Sets `"1"` à `"14"`). Exclure les sets coopératifs `"quest"` (`Q1`, `Q2`, `Q3`).
2. **Filtrage des variantes** : Exclure toute carte possédant un `baseId` (Enchanted, Epic, Iconic, variantes alternatives) ou un `promoSource` (cartes promotionnelles). Il reste **2 864 cartes de base**.
3. **Fusion des rééditions (180 cartes rééditées)** :
   - Regrouper les cartes par `fullName` canonique anglais (ou chaîne `reprintOfId` / `reprintedAsIds`). On obtient **2 680 cartes uniques** (dont **2 023 personnages**).
   - Conserver la première édition (set le plus ancien) comme carte de référence pour l'`id` et l'image, tout en agrégeant :
     - `sets: number[]` : liste triée de tous les numéros de chapitres où la carte est sortie (ex. `[1, 9]`).
     - `rarities: Rarity[]` : liste des raretés associées à ses éditions (27 cartes rééditées au Set 9 ont changé de rareté par rapport au Set 1, ex. *Be Our Guest* passée de `Uncommon` à `Common`).
4. **Enrichissement multilingue (`en`, `fr`, `de`, `it`)** :
   - L'identifiant `id` LorcanaJSON étant identique dans les 4 fichiers de langue, associer à chaque carte ses traductions (`fullName`, `name`, `version`, `image`, `flavorText`). Si une carte ou une image n'existe pas dans une langue (ex. Set 1 en italien), utiliser automatiquement la valeur anglaise en repli (`fallback`).
   - Générer un dictionnaire de traductions mutualisé (`translations.json` ou section dédiée) pour les valeurs d'énumérations (`type`, `colors`, `subtypes`, `story`, `rarity`, noms des `sets`) afin d'éviter de dupliquer ces chaînes 2 680 fois.

### 3.2 Schéma TypeScript d'une Carte (`CanonicalCard`)

```ts
export type Locale = 'fr' | 'en' | 'de' | 'it';

export type InkColor = 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel';
export type CardType = 'Character' | 'Action' | 'Item' | 'Location';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary';

export interface LocalizedCardInfo {
  fullName: string;      // ex: "Ariel - Sur des jambes humaines" (personnage) ou "Soyez sympas" (autre)
  name: string;
  version?: string;
  image: string;         // URL CDN Ravensburger (images.full)
  thumbnail: string;     // URL CDN Ravensburger (images.thumbnail)
  flavorText?: string;
}

export interface CanonicalCard {
  id: number;            // ID LorcanaJSON de la première édition
  slug: string;          // Identifiant stable (simpleName normalisé)
  type: CardType;
  colors: InkColor[];    // 1 couleur (monocolore) ou 2 couleurs (bicolore, ex: ['Amber', 'Steel'])
  cost: number;
  inkwell: boolean;      // Encrable (oui/non)
  story: string;         // Clé canonique de la franchise (ex: "The Little Mermaid")
  sets: number[];        // Liste triée des chapitres d'impression (ex: [1] ou [1, 9])
  rarity: Rarity;        // Rareté d'origine (première édition)
  rarities: Rarity[];    // Toutes les raretés connues si rééditée avec changement de rareté
  subtypes: string[];    // Clés canoniques (ex: ["Storyborn", "Hero", "Princess"])
  strength?: number;     // Présent sur tous les Characters
  willpower?: number;    // Présent sur tous les Characters
  lore?: number;         // Présent sur tous les Characters (et certains Items/Locations)
  translations: Record<Locale, LocalizedCardInfo>;
}
```

---

## 4. Modes de Jeu et Mécanique de Déduction

### 4.1 Sélection de la Carte du Jour (Seed Quotidienne)
- La date du jour est calculée au format `YYYY-MM-DD` (fuseau `Europe/Paris` côté client/serveur pour que le changement quotidien ait lieu à minuit heure française, ou date calendaire locale normalisée — *choix builder : `Europe/Paris`*).
- Une fonction de hachage déterministe (ex. `cyrb53` ou `mulberry32`) prend en entrée la chaîne `"${dateKey}:${mode}"` :
  - Mode `card` : choisit un index dans les **2 680 cartes**.
  - Mode `character` : choisit un index dans les **2 023 cartes de type `Character`**.
  - Mode `blur` : choisit un index dans les **2 680 cartes** (avec le sel `"blur"`, garantissant une carte différente du mode `card`).
- Pour éviter qu'une même carte ne retombe deux jours proches, on génère une permutation déterministe de la liste des cartes (via un shuffle de Fisher-Yates seedé par l'année) et on utilise le numéro du jour dans l'année comme index.

### 4.2 États de Comparaison d'une Cellule
Chaque colonne évaluée retourne :
- `status`: `'exact'` (Vert) | `'partial'` (Orange) | `'wrong'` (Rouge)
- `direction` (optionnel) : `'higher'` (`↑` la cible est plus grande) | `'lower'` (`↓` la cible est plus petite)

### 4.3 Règles par Attribut

| Attribut | Modes concernés | Règle Vert (`exact`) | Règle Orange (`partial`) | Règle Rouge (`wrong`) & Flèches (`↑` / `↓`) |
|---|---|---|---|---|
| **Type** | `card` | Même `type` | — | `type` différent |
| **Couleur** | `card`, `character` | Même(s) couleur(s) exactement | Au moins 1 couleur en commun (ex. carte bicolore vs monocolore, ou 2 bicolores partageant 1 encre) | Aucune couleur en commun |
| **Coût** | `card`, `character` | `guess.cost === target.cost` | — | Différent + flèche `↑` si `target.cost > guess.cost`, `↓` si `target.cost < guess.cost` |
| **Encrable** | `card` | `guess.inkwell === target.inkwell` | — | Différent |
| **Franchise** | `card` | `guess.story === target.story` | — | Différent |
| **Set (Chapitre)** | `card`, `character` | Ensembles `sets` strictement identiques (ex. `[1]` et `[1]`), **ou** si la carte n'a qu'un seul set et qu'il correspond | Au moins 1 chapitre en commun quand l'une des deux cartes a plusieurs chapitres (ex. `[1, 9]` vs `[1]`) | Aucun chapitre en commun + flèche `↑` / `↓` comparant le chapitre d'origine (`sets[0]`) de la cible à celui du guess |
| **Rareté** | `card` | `guess.rarity === target.rarity` | La rareté devinée fait partie des `target.rarities` d'une réédition (ou inversement) | Rareté différente + flèche `↑` / `↓` selon l'ordre : `Common (1) < Uncommon (2) < Rare (3) < Super Rare (4) < Legendary (5)` |
| **Sous-type** | `character` | Mêmes `subtypes` exactement | Au moins 1 sous-type en commun (ex. `Storyborn`) | Aucun sous-type en commun |
| **Force** | `character` | `guess.strength === target.strength` | — | Différent + flèche `↑` / `↓` |
| **Volonté** | `character` | `guess.willpower === target.willpower` | — | Différent + flèche `↑` / `↓` |
| **Lore** | `character` | `guess.lore === target.lore` | — | Différent + flèche `↑` / `↓` |

### 4.4 Mode 3 : Carte Floutée (`blur`)
- Au départ (essai 0), l'image de la carte (`image`) est affichée avec un flou CSS important (`blur(28px)`) et en niveaux de gris partiels ou zoom léger optionnel, en masquant les zones de texte ou en floutant toute la carte.
- À chaque mauvaise proposition, le rayon de flou diminue progressivement (ex. `28px → 22px → 17px → 13px → 9px → 6px → 3px → 0px`).
- Chaque essai s'affiche dans la liste des tentatives sous l'image (avec miniature + nom de la carte tentée en rouge, ou vert lorsque la carte est trouvée).
- Dès que la carte est trouvée, le flou passe à `0px` et l'écran de victoire s'affiche avec le nombre d'essais et le bouton pour passer au mode suivant.

---

## 5. Architecture et Arborescence du Projet

```text
lorcadle/
├── allCards_en.json                 # Sources brutes LorcanaJSON (ignorées du bundle client)
├── allCards_fr.json
├── allCards_de.json
├── allCards_it.json
├── scripts/
│   └── build-dataset.ts             # Script de génération du dataset optimisé + dictionnaires i18n
├── src/
│   ├── data/
│   │   ├── cards.json               # Dataset généré (2 680 cartes canoniques + traductions par ID)
│   │   └── dictionaries.json        # Traductions FR/EN/DE/IT des stories, subtypes, sets, rarities, types
│   ├── types/
│   │   └── game.ts                  # Interfaces CanonicalCard, GuessResult, GameMode, Locale
│   ├── lib/
│   │   ├── cards.ts                 # Chargement, indexation et recherche floue / sans accents
│   │   ├── daily-seed.ts            # Générateur PRNG seedé par date + mode (sans répétition)
│   │   ├── compare.ts               # Moteur pur de comparaison (Guess the Card & Guess the Character)
│   │   ├── storage.ts               # Gestion du localStorage (état du jour, streaks, langue)
│   │   └── i18n.ts                  # Labels d'interface et formatage multilingue (FR par défaut)
│   ├── components/
│   │   ├── Header.tsx               # Navigation entre les 3 modes, sélecteur de langue (FR/EN/DE/IT), bascule thème Clair/Sombre, stats
│   │   ├── Footer.tsx               # Footer repris de lorcana-team-tracker (mentions légales Ravensburger/Disney, liens)
│   │   ├── CardSearchInput.tsx      # Barre d'autocomplétion avec miniature, filtrant les cartes déjà tentées (ergonomie mobile)
│   │   ├── GuessGrid.tsx            # Grille d'indices responsive (retournement des cases Vert/Orange/Rouge + ↑/↓, adaptée mobile)
│   │   ├── BlurredCardGame.tsx      # Composant dédié au mode Carte Floutée
│   │   └── VictoryModal.tsx         # Résumé de victoire, aperçu de la carte, partage emoji (Wordle-style) et lien vers le mode suivant
│   └── app/
│       ├── layout.tsx               # Layout global (thème Jaune/Orange + Noir/Blanc, Mode Clair & Mode Sombre, Footer)
│       ├── page.tsx                 # Mode 1 : Guess the Card (Classique)
│       ├── character/
│       │   └── page.tsx             # Mode 2 : Guess the Character
│       └── blur/
│           └── page.tsx             # Mode 3 : Carte Floutée
├── package.json
├── tsconfig.json
├── next.config.ts                   # Configuration images CDN (api.lorcana.ravensburger.com)
└── tailwind.config.ts
```

---

## 6. Design UI, Thème et Responsive Mobile

- **Palette & Thèmes (Mode Sombre & Mode Clair)** :
  - Couleur d'accent principale : **Jaune / Orange (Ambre)** (`amber-400` / `amber-500` / `orange-500`).
  - **Mode Sombre** : Fond noir/anthracite profond (`zinc-950` / `neutral-900`), texte blanc, bordures et accents jaune/orange.
  - **Mode Clair** : Fond blanc/crème très clair (`white` / `amber-50/30`), texte noir/anthracite (`zinc-900`), accents jaune/orange vif.
  - Bascule de thème persistée dans `localStorage` (avec détection initiale de la préférence système).
- **Responsive Mobile-First** :
  - La grille de 7 colonnes doit rester parfaitement lisible et utilisable sur smartphone (colonnes compactes ou scroll horizontal fluide avec indicateur visuel, barre de recherche restant accessible en haut d'écran sans être masquée par le clavier virtuel).
- **Footer** :
  - Reprise fidèle du footer de `lorcana-team-tracker`.

---

## 7. Choix laissés à l'implémentation (Builder Calls)
- **Normalisation de la recherche** : Recherche insensible à la casse et aux accents (`é -> e`, tirets ignorés) permettant de chercher par titre, sous-titre ou nom complet dans la langue active (et en anglais en bonus).
- **Tests unitaires (Vitest)** : Couverture des fonctions pures critiques (`build-dataset`, `daily-seed`, `compare`).
