import { z } from "zod";
import {
  DEMO_CONVERSATIONS,
  type DemoScenario,
} from "../data/mock-conversations.js";

export const getDemoConversationInputSchema = z.object({
  scenario: z.enum(["homeowner", "renter", "auto", "first_time_buyer"]),
});

export const getDemoConversationTool = {
  name: "get_demo_conversation" as const,
  description:
    "Return a scripted demo conversation for investor or stakeholder walkthroughs (simulated Kinro agent flow, no live buyer).",
  inputSchema: {
    type: "object" as const,
    properties: {
      scenario: {
        type: "string",
        enum: ["homeowner", "renter", "auto", "first_time_buyer"],
        description:
          "Which sample flow to return: homeowner (includes post-bind segment), renter, auto, or first_time_buyer.",
      },
    },
    required: ["scenario"],
  },
};

export function handleGetDemoConversation(raw: unknown) {
  const parsed = getDemoConversationInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
    );
  }
  const scenario = parsed.data.scenario as DemoScenario;
  const conversation = DEMO_CONVERSATIONS[scenario];
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ scenario, conversation }),
      },
    ],
  };
}
