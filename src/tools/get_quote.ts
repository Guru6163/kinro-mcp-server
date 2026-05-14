import { z } from "zod";
import { carriersInMarket } from "../data/carriers.js";
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

const COVERAGE_LIMITS: Record<string, number> = {
  homeowners: 400_000,
  auto: 100_000,
  renters: 50_000,
  pet: 25_000,
};

export function locationFactorFromZip(zip: string): number {
  const digits = zip.replace(/\D/g, "");
  const first = digits[0];
  if (!first) {
    return 1.0;
  }
  return LOCATION_FACTOR_BY_FIRST_DIGIT[first] ?? 1.0;
}

export function buildQuotesForMarket(
  state: string,
  zipCode: string,
  coverageType: string,
): Quote[] {
  const factor = locationFactorFromZip(zipCode);
  const limit =
    COVERAGE_LIMITS[coverageType.toLowerCase()] ?? COVERAGE_LIMITS.homeowners;

  const candidates = carriersInMarket(state, coverageType).map((c) => {
    const monthly_premium = Math.round(c.base_premium * factor);
    return {
      carrier_id: c.id,
      carrier_name: c.name,
      am_best_rating: c.am_best_rating,
      monthly_premium,
      coverage_limit: limit,
    } satisfies Quote;
  });

  return [...candidates].sort((a, b) => a.monthly_premium - b.monthly_premium).slice(0, 3);
}

export const getQuoteTool = {
  name: "get_quote" as const,
  description:
    "Return up to three rated quotes for a state, ZIP, and coverage type using Kinro’s mock carrier panel.",
  inputSchema: {
    type: "object" as const,
    properties: {
      state: {
        type: "string",
        description: "Two-letter state code (e.g. CA).",
      },
      zip_code: {
        type: "string",
        description: "ZIP used for regional factor (mock).",
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
