/** Normalize user input to a two-letter USPS state code when possible. */
export function normalizeStateCode(state: string): string {
  const trimmed = state.trim().toUpperCase();
  if (trimmed.length === 2) {
    return trimmed;
  }
  const alias: Record<string, string> = {
    CALIFORNIA: "CA",
    FLORIDA: "FL",
    "NEW YORK": "NY",
    TEXAS: "TX",
  };
  return alias[trimmed] ?? trimmed.slice(0, 2);
}

/** Phrases that must not appear in regulated sales copy (mock universal rules). */
export const UNIVERSAL_BANNED_PHRASES: readonly string[] = [
  "guaranteed",
  "best price",
  "cheapest",
  "promise",
  "100% covered",
  "always pay",
  "never denied",
];

/**
 * State-specific banned phrases (each list includes universal rules plus overlays).
 * States not listed here fall back to {@link UNIVERSAL_BANNED_PHRASES} only.
 */
export const BANNED_PHRASES_BY_STATE: Record<string, readonly string[]> = {
  CA: [...UNIVERSAL_BANNED_PHRASES, "earthquake not covered"],
  FL: [...UNIVERSAL_BANNED_PHRASES, "flood included"],
  NY: [...UNIVERSAL_BANNED_PHRASES, "guaranteed approval"],
};

/** All phrases to scan for a given jurisdiction (universal + state-specific). */
export function getBannedPhrasesForState(state: string): string[] {
  const code = normalizeStateCode(state);
  const list = BANNED_PHRASES_BY_STATE[code];
  return list ? [...list] : [...UNIVERSAL_BANNED_PHRASES];
}
