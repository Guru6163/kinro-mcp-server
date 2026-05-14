import { z } from "zod";
import { getBannedPhrasesForState } from "../data/compliance_rules.js";
import type { ComplianceResult } from "../types.js";

export const checkComplianceInputSchema = z.object({
  response_text: z.string(),
  state: z.string(),
});

export function evaluateCompliance(
  responseText: string,
  state: string,
): ComplianceResult {
  const haystack = responseText.toLowerCase();
  const phrases = getBannedPhrasesForState(state);
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const phrase of phrases) {
    if (haystack.includes(phrase.toLowerCase()) && !seen.has(phrase)) {
      issues.push(phrase);
      seen.add(phrase);
    }
  }

  const compliance_score = Math.max(0, 100 - issues.length * 15);

  return {
    compliant: issues.length === 0,
    issues,
    compliance_score,
  };
}

export const checkComplianceTool = {
  name: "check_compliance" as const,
  description:
    "Scan sales copy for banned phrases (demo rules) and return a mock compliance score.",
  inputSchema: {
    type: "object" as const,
    properties: {
      response_text: { type: "string", description: "Copy to review." },
      state: { type: "string", description: "State for rule overlay (e.g. CA)." },
    },
    required: ["response_text", "state"],
  },
};

export function handleCheckCompliance(raw: unknown) {
  const parsed = checkComplianceInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
    );
  }
  const result = evaluateCompliance(
    parsed.data.response_text,
    parsed.data.state,
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result) }],
  };
}
