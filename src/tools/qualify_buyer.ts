import { z } from "zod";
import type { BuyerScore } from "../types.js";

export const qualifyBuyerInputSchema = z.object({
  coverage_type: z.string(),
  property_value: z.number().optional(),
  prior_claims: z.number().optional(),
  zip_code: z.string(),
});

function clampScore(n: number): number {
  return Math.min(100, Math.max(0, n));
}

function firstZipDigit(zip: string): string | undefined {
  const digits = zip.replace(/\D/g, "");
  return digits[0];
}

function recommendedCoverage(
  coverageType: string,
  score: number,
): string {
  const base = coverageType.trim().toLowerCase();
  if (score >= 75) {
    if (base === "auto") {
      return "auto: 100/300 liability + matching UM/UIM + $500 comp/collision (demo bundle)";
    }
    if (base === "renters") {
      return "renters: HO-4 with $500k umbrella stack (demo bundle)";
    }
    if (base === "pet") {
      return "pet: illness + wellness rider with $10k annual cap (demo)";
    }
    return "homeowners: HO-3 replacement cost + water backup endorsement (demo bundle)";
  }
  if (score >= 50) {
    return `${base}: standard admitted-market form with 1% wind/hail deductible (demo)`;
  }
  return `${base}: simplified-issue program pending underwriting review (demo)`;
}

function nextStepFor(score: number): BuyerScore["next_step"] {
  if (score >= 75) {
    return "book_demo";
  }
  if (score >= 50) {
    return "self_serve";
  }
  return "needs_review";
}

export function scoreBuyer(input: z.infer<typeof qualifyBuyerInputSchema>): BuyerScore {
  const prior = input.prior_claims ?? 0;
  const value = input.property_value;
  const digit = firstZipDigit(input.zip_code);

  let score = 60;
  const signals: string[] = [];

  if (prior === 0) {
    score += 20;
    signals.push("no prior claims filed");
  }

  if (
    value !== undefined &&
    value >= 200_000 &&
    value <= 600_000
  ) {
    score += 10;
    signals.push("property value in the 200k–600k sweet spot");
  }

  if (digit === "6" || digit === "8") {
    score += 10;
    signals.push(`ZIP leading digit ${digit} maps to a lower-risk marketing band`);
  }

  if (prior >= 2) {
    score -= 20;
    signals.push("two or more prior claims");
  }

  if (value !== undefined && value > 1_000_000) {
    score -= 10;
    signals.push("high-value home adds underwriting complexity");
  }

  score = clampScore(score);

  let tier: BuyerScore["tier"];
  if (score >= 75) {
    tier = "hot";
  } else if (score >= 50) {
    tier = "warm";
  } else {
    tier = "cold";
  }

  const reason =
    signals.length > 0
      ? `Score ${score} reflects ${signals.join("; ")} for ${input.coverage_type} in ZIP ${input.zip_code}.`
      : `Score ${score} is baseline for ${input.coverage_type} in ZIP ${input.zip_code} with limited signals.`;

  return {
    score,
    tier,
    reason,
    recommended_coverage_type: recommendedCoverage(input.coverage_type, score),
    next_step: nextStepFor(score),
    estimated_annual_savings: score * 12,
  };
}

export const qualifyBuyerTool = {
  name: "qualify_buyer" as const,
  description:
    "Score and tier a buyer using Kinro’s heuristic demo model (no credit pulls, no external APIs).",
  inputSchema: {
    type: "object" as const,
    properties: {
      coverage_type: { type: "string", description: "Line of business." },
      property_value: {
        type: "number",
        description: "Estimated property value (optional).",
      },
      prior_claims: {
        type: "number",
        description: "Count of prior claims (optional).",
      },
      zip_code: { type: "string", description: "Buyer ZIP." },
    },
    required: ["coverage_type", "zip_code"],
  },
};

export function handleQualifyBuyer(raw: unknown) {
  const parsed = qualifyBuyerInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
    );
  }
  const result = scoreBuyer(parsed.data);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result) }],
  };
}
