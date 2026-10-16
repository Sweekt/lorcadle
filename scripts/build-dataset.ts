import fs from 'fs';
import path from 'path';
import { buildDatasetFromRaw, type RawLorcanaJson } from '../src/lib/dataset-builder';
import type { Locale } from '../src/types/game';

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');

function loadLocaleJson(locale: Locale): RawLorcanaJson {
  const filePath = path.join(ROOT_DIR, `allCards_${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as RawLorcanaJson;
}

function main() {
  console.log('Loading LorcanaJSON source files (en, fr, de, it)...');
  const rawByLocale: Record<Locale, RawLorcanaJson> = {
    en: loadLocaleJson('en'),
    fr: loadLocaleJson('fr'),
    de: loadLocaleJson('de'),
    it: loadLocaleJson('it'),
  };

  console.log('Building canonical dataset and translation dictionaries...');
  const { cards, dictionaries } = buildDatasetFromRaw(rawByLocale);

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const cardsPath = path.join(DATA_DIR, 'cards.json');
  const dictsPath = path.join(DATA_DIR, 'dictionaries.json');

  fs.writeFileSync(cardsPath, JSON.stringify(cards));
  fs.writeFileSync(dictsPath, JSON.stringify(dictionaries, null, 2));

  const charCount = cards.filter((c) => c.type === 'Character').length;
  const multiSetCount = cards.filter((c) => c.sets.length > 1).length;

  console.log(`Done!`);
  console.log(`- Total canonical cards: ${cards.length}`);
  console.log(`- Character cards: ${charCount}`);
  console.log(`- Reprinted cards merged: ${multiSetCount}`);
  console.log(`- Stories translated: ${Object.keys(dictionaries.stories).length}`);
  console.log(`- Subtypes translated: ${Object.keys(dictionaries.subtypes).length}`);
}

main();
