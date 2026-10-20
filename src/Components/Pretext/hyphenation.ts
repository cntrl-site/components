import { useEffect, useState } from 'react';

// Same limits RichTextItem gives the browser in sdk-nextjs
// (`hyphenate-limit-chars: 6 3 2`): words of 6+ chars, at least 3 letters
// before the break and 2 after.
const MIN_WORD_LENGTH = 6;
const MIN_LETTERS_BEFORE = 3;
const MIN_LETTERS_AFTER = 2;
const SOFT_HYPHEN = '­';
const LETTER = /\p{L}/gu;

// Below this many characters franc-min's trigram model is unreliable — same
// threshold as detectLang in sdk-nextjs.
const MIN_DETECTABLE_LENGTH = 20;

type HyphenateSync = (text: string, options?: { hyphenChar?: string; minWordLength?: number }) => string;

// ISO 639-3 codes franc-min returns, mapped to the ISO 639-1 tag used for
// `lang` and for picking a pattern set. Mirrors detectLang in sdk-nextjs.
const ISO_639_3_TO_1: Record<string, string> = {
  arb: 'ar', azj: 'az', bel: 'be', bos: 'bs', bul: 'bg', ces: 'cs', deu: 'de', eng: 'en',
  fas: 'fa', fra: 'fr', hau: 'ha', hin: 'hi', hrv: 'hr', hun: 'hu', ibo: 'ig', ind: 'id',
  ita: 'it', jav: 'jv', kaz: 'kk', kin: 'rw', lin: 'ln', mar: 'mr', nep: 'ne', nld: 'nl',
  nya: 'ny', pol: 'pl', por: 'pt', ron: 'ro', run: 'rn', rus: 'ru', som: 'so', spa: 'es',
  srp: 'sr', sun: 'su', swe: 'sv', swh: 'sw', tgl: 'tl', tur: 'tr', ukr: 'uk', urd: 'ur',
  uzn: 'uz', vie: 'vi', yor: 'yo', zlm: 'ms', zul: 'zu',
};

// One chunk per language: the full pattern set is ~9MB, so only the language
// a page actually uses gets fetched.
const PATTERN_LOADERS: Record<string, () => Promise<unknown>> = {
  be: () => import('hyphen/be'),
  bg: () => import('hyphen/bg'),
  cs: () => import('hyphen/cs'),
  de: () => import('hyphen/de'),
  en: () => import('hyphen/en'),
  'en-gb': () => import('hyphen/en-gb'),
  es: () => import('hyphen/es'),
  fr: () => import('hyphen/fr'),
  hi: () => import('hyphen/hi'),
  hr: () => import('hyphen/hr'),
  hu: () => import('hyphen/hu'),
  id: () => import('hyphen/id'),
  it: () => import('hyphen/it'),
  mr: () => import('hyphen/mr'),
  nl: () => import('hyphen/nl'),
  pl: () => import('hyphen/pl'),
  pt: () => import('hyphen/pt'),
  ro: () => import('hyphen/ro'),
  ru: () => import('hyphen/ru'),
  sr: () => import('hyphen/sr'),
  sv: () => import('hyphen/sv'),
  tr: () => import('hyphen/tr'),
  uk: () => import('hyphen/uk'),
};

type Franc = typeof import('franc-min');

// `hyphen` is CommonJS; depending on the bundler's interop its exports object
// shows up on the namespace itself or under `default`.
const fromCjs = <T>(mod: unknown, pick: (value: any) => T | undefined): T | null => {
  const namespace = mod as { default?: unknown };
  return pick(namespace) ?? pick(namespace.default) ?? null;
};

let francPromise: Promise<Franc | null> | null = null;
const loadFranc = (): Promise<Franc | null> => {
  francPromise ??= import('franc-min')
    .then(mod => fromCjs<Franc>(mod, value => (typeof value === 'function' ? value : undefined)))
    .catch((error) => {
      console.warn('Pretext: failed to load franc-min, using the page language for hyphenation', error);
      francPromise = null;
      return null;
    });
  return francPromise;
};

const hyphenators = new Map<string, Promise<HyphenateSync | null>>();
const loadHyphenator = (key: string): Promise<HyphenateSync | null> => {
  let pending = hyphenators.get(key);
  if (!pending) {
    pending = PATTERN_LOADERS[key]()
      .then(mod => fromCjs<HyphenateSync>(mod, value => value?.hyphenateSync))
      .catch((error) => {
        console.warn(`Pretext: failed to load "${key}" hyphenation patterns`, error);
        hyphenators.delete(key);
        return null;
      });
    hyphenators.set(key, pending);
  }
  return pending;
};

const patternKey = (lang: string | undefined): string | null => {
  if (!lang) return null;
  const tag = lang.toLowerCase();
  if (PATTERN_LOADERS[tag]) return tag;
  const primary = tag.split('-')[0];
  return PATTERN_LOADERS[primary] ? primary : null;
};

const detectLang = (franc: Franc, text: string): string | undefined => {
  const trimmed = text.trim();
  if (trimmed.length < MIN_DETECTABLE_LENGTH) return undefined;
  const code3 = franc(trimmed, { minLength: MIN_DETECTABLE_LENGTH });
  if (code3 === 'und') return undefined;
  return ISO_639_3_TO_1[code3] ?? code3;
};

export type Hyphenation = {
  lang?: string;
  hyphenateSync: HyphenateSync | null;
};

const NO_HYPHENATION: Hyphenation = { hyphenateSync: null };

/**
 * Detects the text's language (like RichTextItem's `lang`) and loads that
 * language's hyphenation patterns. Undetected text falls back to the page's
 * own `lang`, then English — what the browser would hyphenate with.
 */
export function useHyphenation(enabled: boolean, text: string): Hyphenation {
  const [hyphenation, setHyphenation] = useState<Hyphenation | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadFranc().then(async (franc) => {
      const detected = franc ? detectLang(franc, text) : undefined;
      const pageLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
      const key = patternKey(detected) ?? patternKey(pageLang) ?? 'en';
      const hyphenateSync = await loadHyphenator(key);
      if (!cancelled) setHyphenation({ lang: detected, hyphenateSync });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, text]);

  // While edited text is re-detected the previous result stays in place, so
  // typing doesn't flicker the layout between hyphenated and plain breaks.
  return enabled && hyphenation ? hyphenation : NO_HYPHENATION;
}

const countLetters = (value: string): number => value.match(LETTER)?.length ?? 0;

/**
 * Offsets inside `word` where a line may break: dictionary hyphenation points
 * (a hyphen gets added) plus the spot right after an existing hyphen (nothing
 * added), both kept away from the word's edges.
 */
export function hyphenationPoints(word: string, hyphenateSync: HyphenateSync | null): number[] | undefined {
  if (word.length < 2 || word.includes(SOFT_HYPHEN)) return undefined;
  const points = new Set<number>();

  if (hyphenateSync) {
    const marked = hyphenateSync(word, { hyphenChar: SOFT_HYPHEN, minWordLength: MIN_WORD_LENGTH });
    let offset = 0;
    for (let index = 0; index < marked.length; index += 1) {
      if (marked[index] === SOFT_HYPHEN) points.add(offset);
      else offset += 1;
    }
  }
  for (let index = 1; index < word.length - 1; index += 1) {
    if (word[index - 1] === '-') points.add(index);
  }

  const allowed = [...points]
    .filter((point) => {
      const explicit = word[point - 1] === '-';
      return point > 0
        && point < word.length
        && countLetters(word.slice(0, point)) >= (explicit ? 1 : MIN_LETTERS_BEFORE)
        && countLetters(word.slice(point)) >= (explicit ? 1 : MIN_LETTERS_AFTER);
    })
    .sort((a, b) => a - b);
  return allowed.length ? allowed : undefined;
}
