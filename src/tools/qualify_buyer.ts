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

  return { score, tier, reason };
}

export const qualifyBuyerTool = {
  name: "qualify_buyer" as const,
  description:
    "Score and tier a buyer using Kinro’s heuristic lead model (mock, not credit/CLUE).",
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
