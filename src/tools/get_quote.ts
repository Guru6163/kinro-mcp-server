import { z } from "zod";
import { filterMockCarriers } from "../data/carriers.js";
import type { Quote } from "../types.js";

const coverageEnum = z.enum(["homeowners", "auto", "renters", "pet"]);

export const getQuoteInputSchema = z.object({
  state: z.string(),
  zip_code: z.string(),
  coverage_type: coverageEnum,
});

/** First digit of ZIP → regional rating factor (mock actuarial curve). */
const LOCATION_FACTOR_BY_FIRST_DIGIT: Record<string, number> = {
  "9": 1.3,
  "7": 1.1,
  "3": 1.35,
  "6": 0.9,
  "1": 1.0,
};

const DEDUCTIBLES = [500, 1000, 2500] as const;
const COVERAGE_LIMITS = [200_000, 300_000, 500_000] as const;

export function zipLastTwoSeed(zip: string): number {
  const digits = zip.replace(/\D/g, "");
  if (digits.length < 2) {
    return 0;
  }
  return Number.parseInt(digits.slice(-2), 10);
}

export function locationFactorFromZip(zip: string): number {
  const digits = zip.replace(/\D/g, "");
  const first = digits[0];
  if (!first) {
    return 1.0;
  }
  return LOCATION_FACTOR_BY_FIRST_DIGIT[first] ?? 1.0;
}

function quoteIdFor(zip: string): string {
  const z = zip.replace(/\D/g, "") || "00000";
  const tail = String(Date.now()).slice(-6);
  return `QT-${z}-${tail}`;
}

export function buildQuotesForMarket(
  state: string,
  zipCode: string,
  coverageType: string,
): Quote[] {
  const seed = zipLastTwoSeed(zipCode);
  const seedAdj = 1 + (seed % 20) / 100;
  const factor = locationFactorFromZip(zipCode);
  const { matches } = filterMockCarriers(state, coverageType);

  const ranked = [...matches]
    .map((c) => {
      const monthly_premium = Math.round(c.base_premium * seedAdj * factor);
      return { carrier: c, monthly_premium };
    })
    .sort((a, b) => a.monthly_premium - b.monthly_premium)
    .slice(0, 3);

  const validUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const ts = String(Date.now()).slice(-6);

  return ranked.map(({ carrier: c, monthly_premium }, i) => {
    const deductible = DEDUCTIBLES[i % DEDUCTIBLES.length];
    const coverage_limit = COVERAGE_LIMITS[i % COVERAGE_LIMITS.length];
    const estimated_annual = Math.round(monthly_premium * 11.5);
    const zipPart = String(zipCode).replace(/\s+/g, "");
    return {
      quote_id: `QT-${zipPart}-${ts}${i}`,
      carrier_id: c.id,
      carrier_name: c.name,
      am_best_rating: c.am_best,
      monthly_premium,
      estimated_annual,
      deductible,
      coverage_limit,
      carrier_logo_url: c.logo,
      valid_until: validUntil,
    } satisfies Quote;
  });
}

export const getQuoteTool = {
  name: "get_quote" as const,
  description:
    "Return up to three rated demo quotes for a state, ZIP, and coverage type (simulated pricing, no live APIs).",
  inputSchema: {
    type: "object" as const,
    properties: {
      state: {
        type: "string",
        description: "Two-letter state code (e.g. CA).",
      },
      zip_code: {
        type: "string",
        description: "ZIP used for mock rating factors.",
      },
      coverage_type: {
        type: "string",
        enum: ["homeowners", "auto", "renters", "pet"],
        description: "Line of business to quote.",
      },
    },
    required: ["state", "zip_code", "coverage_type"],
  },
};

export function handleGetQuote(raw: unknown) {
  const parsed = getQuoteInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
    );
  }
  const { state, zip_code, coverage_type } = parsed.data;
  const quotes = buildQuotesForMarket(state, zip_code, coverage_type);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(quotes) }],
  };
}
