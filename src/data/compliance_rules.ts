import { normalizeStateCode } from "./state_code.js";

/** Phrases that must not appear in regulated sales copy (mock rules). */
export const UNIVERSAL_BANNED_PHRASES: string[] = [
  "guaranteed",
  "best price",
  "cheapest",
  "promise",
  "100% covered",
  "always pay",
  "never denied",
];

/** Extra banned phrases keyed by two-letter state code. */
export const STATE_BANNED_PHRASES: Record<string, string[]> = {
  CA: ["earthquake not covered"],
  FL: ["flood included"],
  NY: ["guaranteed approval"],
};

export { normalizeStateCode };

/** All phrases to scan for a given jurisdiction (universal + state-specific). */
export function getBannedPhrasesForState(state: string): string[] {
  const code = normalizeStateCode(state);
  const extra = STATE_BANNED_PHRASES[code] ?? [];
  return [...UNIVERSAL_BANNED_PHRASES, ...extra];
}
