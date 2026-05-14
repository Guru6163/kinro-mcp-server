import { z } from "zod";
import type { PolicyExplanation } from "../types.js";

export const explainPolicyInputSchema = z.object({
  policy_id: z.string(),
  buyer_question: z.string(),
});

function buildFromTemplate(
  templateIndex: 0 | 1 | 2,
  policyId: string,
  buyerQuestion: string,
): string {
  if (templateIndex === 0) {
    return (
      `Thanks for walking through policy ${policyId} with me. ` +
      `When you asked, “${buyerQuestion},” the short answer is that your dec page controls what’s covered, and anything not listed there usually needs an endorsement. ` +
      `Most HO-3 forms cover sudden plumbing leaks but not long-term seepage, so if water is involved we’ll want photos and a timeline. ` +
      `I’m happy to read the exact endorsement language with you line-by-line so there’s no surprises at claim time.`
    );
  }
  if (templateIndex === 1) {
    return (
      `On ${policyId}, I’m going to answer “${buyerQuestion}” the way a field adjuster would: first we confirm cause of loss, then we match it to a covered peril in the contract. ` +
      `Wind-driven rain versus rising water matters a lot—one may be covered subject to deductible, the other often requires separate flood coverage. ` +
      `I’ll note any sub-limits for mold or water backup so you can decide if an endorsement is worth it. ` +
      `Nothing here changes your actual policy until underwriting approves a change—we’re just translating the manual into plain English.`
    );
  }
  return (
    `I love that question about “${buyerQuestion}” because it shows you’re reading ${policyId} closely. ` +
    `In practice, carriers look at whether the damage is sudden and accidental, whether you mitigated further loss, and whether the peril is excluded on the schedule. ` +
    `If you’re worried about a gray area, we can submit a hypothetical to the carrier’s underwriting desk before you file a claim. ` +
    `Either way, you’re already doing the right thing by asking before you have a loss on the kitchen floor.`
  );
}

export function buildPolicyExplanation(
  policyId: string,
  buyerQuestion: string,
): PolicyExplanation {
  const template_index = (policyId.length % 3) as 0 | 1 | 2;
  const agent_narrative = buildFromTemplate(
    template_index,
    policyId,
    buyerQuestion,
  );

  return {
    policy_id: policyId,
    buyer_question: buyerQuestion,
    template_index,
    agent_narrative,
    disclaimer:
      "Demo script for sales training — not a coverage determination, not legal advice, and not a substitute for your carrier’s filed forms.",
  };
}

export const explainPolicyTool = {
  name: "explain_policy" as const,
  description:
    "Return a 3–4 sentence licensed-agent-style explanation (demo template) for a policy id and buyer question.",
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
