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
