import { z } from "zod";
import type { PolicyExplanation } from "../types.js";

export const explainPolicyInputSchema = z.object({
  policy_id: z.string(),
  buyer_question: z.string(),
});

function inferProductLine(policyId: string): "homeowners" | "auto" | "other" {
  const upper = policyId.toUpperCase();
  if (upper.includes("HO-") || upper.startsWith("HO")) {
    return "homeowners";
  }
  if (upper.includes("AU-") || upper.includes("AUTO") || upper.startsWith("PPA")) {
    return "auto";
  }
  return "other";
}

export function buildPolicyExplanation(
  policyId: string,
  buyerQuestion: string,
): PolicyExplanation {
  const line = inferProductLine(policyId);

  const product_summary =
    line === "homeowners"
      ? "HO-3-style homeowners form: open perils on the dwelling with named-peril personal property."
      : line === "auto"
        ? "Personal auto policy with split liability, UM/UIM, and optional comp/collision."
        : "Bundled personal-lines policy (mock): review declarations for exact form series.";

  const coverage_highlights =
    line === "homeowners"
      ? [
          "Dwelling coverage with replacement-cost option where selected.",
          "Personal liability and medical payments to others.",
          "Loss of use when the home is uninhabitable due to a covered loss.",
        ]
      : line === "auto"
        ? [
            "Bodily injury and property damage liability limits per declarations.",
            "Uninsured/underinsured motorist where elected.",
            "Optional physical damage (comprehensive/collision) with deductibles shown.",
          ]
        : [
            "Refer to the declarations page for policy form numbers and endorsements.",
            "Coverage limits and deductibles are itemized per scheduled property/vehicles.",
          ];

  const buyer_answer =
    line === "homeowners"
      ? `On “${buyerQuestion}”: flood and earthquake are typically excluded unless purchased as separate endorsements or policies; mudflow and sewer backup may also be limited unless endorsed.`
      : line === "auto"
        ? `On “${buyerQuestion}”: business use, rideshare, and racing are commonly excluded or require endorsements; confirm garaging ZIP and listed drivers match actual use.`
        : `On “${buyerQuestion}”: Kinro will map your question to the governing form in ${policyId} and confirm any endorsements that modify base coverage.`;

  return {
    policy_id: policyId,
    buyer_question: buyerQuestion,
    product_summary,
    coverage_highlights,
    buyer_answer,
    disclaimer:
      "Mock explanation for sales enablement only — not underwriting, not legal advice, and not a coverage determination.",
  };
}

export const explainPolicyTool = {
  name: "explain_policy" as const,
  description:
    "Produce a structured plain-English policy explanation tied to a policy id and buyer question (mock).",
  inputSchema: {
    type: "object" as const,
    properties: {
      policy_id: { type: "string", description: "Policy identifier." },
      buyer_question: {
        type: "string",
        description: "What the buyer is asking.",
      },
    },
    required: ["policy_id", "buyer_question"],
  },
};

export function handleExplainPolicy(raw: unknown) {
  const parsed = explainPolicyInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
    );
  }
  const explanation = buildPolicyExplanation(
    parsed.data.policy_id,
    parsed.data.buyer_question,
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(explanation) }],
  };
}
