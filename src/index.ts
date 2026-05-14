import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const coverageTypeEnum = z.enum(["homeowners", "auto", "renters", "pet"]);

const getQuoteInputSchema = z.object({
  zip_code: z.string(),
  coverage_type: coverageTypeEnum,
});

const explainPolicyInputSchema = z.object({
  policy_id: z.string(),
  buyer_question: z.string(),
});

const checkComplianceInputSchema = z.object({
  response_text: z.string(),
  state: z.string(),
});

const listCarriersInputSchema = z.object({
  state: z.string(),
  coverage_type: z.string(),
});

const qualifyBuyerInputSchema = z.object({
  coverage_type: z.string(),
  property_value: z.number().optional(),
  prior_claims: z.number().optional(),
  zip_code: z.string(),
});

const COMPLIANCE_TRIGGERS = [
  "guaranteed",
  "best price",
  "promise",
  "always covered",
] as const;

function zipLastTwoSeed(zip: string): number {
  const digits = zip.replace(/\D/g, "");
  if (digits.length < 2) {
    return 0;
  }
  return Number.parseInt(digits.slice(-2), 10);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function mockQuotes(zipCode: string) {
  const seed = zipLastTwoSeed(zipCode);
  const jitter = (offset: number) =>
    Math.round(clamp(80, 280, 110 + offset + (seed % 45) - 22));

  return [
    {
      carrier: "State Farm",
      monthly_premium: jitter(0),
      coverage_limit: 280_000,
    },
    {
      carrier: "Allstate",
      monthly_premium: jitter(35),
      coverage_limit: 320_000,
    },
    {
      carrier: "Progressive",
      monthly_premium: jitter(70),
      coverage_limit: 300_000,
    },
  ];
}

function explainPolicy(policyId: string, buyerQuestion: string) {
  return (
    `Policy ${policyId} is a standard HO-3 homeowners policy. ` +
    `It covers your dwelling up to $300,000 and personal property up to $150,000. ` +
    `Regarding your question about ${buyerQuestion}: standard exclusions apply ` +
    `for flood and earthquake — you would need separate riders for those.`
  );
}

function checkCompliance(responseText: string) {
  const lower = responseText.toLowerCase();
  const issues: string[] = [];
  for (const phrase of COMPLIANCE_TRIGGERS) {
    if (lower.includes(phrase)) {
      issues.push(phrase);
    }
  }
  return {
    compliant: issues.length === 0,
    issues,
  };
}

function mockCarriers() {
  return [
    {
      name: "State Farm",
      am_best_rating: "A++ (XV)",
      avg_premium: 142,
      available: true,
    },
    {
      name: "Allstate",
      am_best_rating: "A+ (XV)",
      avg_premium: 156,
      available: true,
    },
    {
      name: "Lemonade",
      am_best_rating: "A- (IX)",
      avg_premium: 118,
      available: true,
    },
  ];
}

function qualifyBuyer(args: z.infer<typeof qualifyBuyerInputSchema>) {
  const prior = args.prior_claims ?? 0;
  const value = args.property_value;

  let score = 70;
  if (prior >= 2) {
    score -= 30;
  }
  if (value !== undefined && value > 500_000) {
    score += 15;
  }
  score = clamp(score, 0, 100);

  let tier: "hot" | "warm" | "cold";
  if (prior >= 2) {
    tier = "cold";
  } else if (value !== undefined && value > 500_000) {
    tier = "hot";
  } else {
    tier = "warm";
  }

  let reason: string;
  if (prior >= 2) {
    reason =
      "Multiple prior claims push this profile into a cold tier until more underwriting detail is reviewed.";
  } else if (value !== undefined && value > 500_000) {
    reason =
      "High property value signals strong coverage appetite, so we marked this lead as hot for follow-up.";
  } else {
    reason =
      "Balanced risk signals with no major red flags place this buyer in a warm nurture queue.";
  }

  return { score, tier, reason };
}

const server = new Server(
  {
    name: "kinro-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_quote",
      description:
        "Return mock insurance quotes from Kinro for the given ZIP and coverage type (three carriers).",
      inputSchema: {
        type: "object",
        properties: {
          zip_code: {
            type: "string",
            description: "ZIP code used for rating (mock).",
          },
          coverage_type: {
            type: "string",
            enum: ["homeowners", "auto", "renters", "pet"],
            description: "Line of business to quote.",
          },
        },
        required: ["zip_code", "coverage_type"],
      },
    },
    {
      name: "explain_policy",
      description:
        "Plain-English explanation of a policy for a buyer question (mock).",
      inputSchema: {
        type: "object",
        properties: {
          policy_id: { type: "string", description: "Policy identifier." },
          buyer_question: {
            type: "string",
            description: "What the buyer is asking.",
          },
        },
        required: ["policy_id", "buyer_question"],
      },
    },
    {
      name: "check_compliance",
      description:
        "Check sales copy for compliance flags on prohibited phrasing (mock).",
      inputSchema: {
        type: "object",
        properties: {
          response_text: { type: "string", description: "Copy to review." },
          state: { type: "string", description: "Two-letter or full state." },
        },
        required: ["response_text", "state"],
      },
    },
    {
      name: "list_carriers",
      description:
        "List mock carriers available for a state and coverage type.",
      inputSchema: {
        type: "object",
        properties: {
          state: { type: "string", description: "State for availability." },
          coverage_type: {
            type: "string",
            description: "Line of business.",
          },
        },
        required: ["state", "coverage_type"],
      },
    },
    {
      name: "qualify_buyer",
      description:
        "Mock lead score and tier for a buyer based on simple heuristics.",
      inputSchema: {
        type: "object",
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
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const raw = request.params.arguments ?? {};

  switch (request.params.name) {
    case "get_quote": {
      const parsed = getQuoteInputSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
        );
      }
      const quotes = mockQuotes(parsed.data.zip_code);
      return {
        content: [{ type: "text", text: JSON.stringify(quotes) }],
      };
    }
    case "explain_policy": {
      const parsed = explainPolicyInputSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
        );
      }
      const text = explainPolicy(
        parsed.data.policy_id,
        parsed.data.buyer_question,
      );
      return {
        content: [{ type: "text", text }],
      };
    }
    case "check_compliance": {
      const parsed = checkComplianceInputSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
        );
      }
      const result = checkCompliance(parsed.data.response_text);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
    case "list_carriers": {
      const parsed = listCarriersInputSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
        );
      }
      return {
        content: [{ type: "text", text: JSON.stringify(mockCarriers()) }],
      };
    }
    case "qualify_buyer": {
      const parsed = qualifyBuyerInputSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
        );
      }
      const result = qualifyBuyer(parsed.data);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kinro MCP server running");
  console.error("Kinro MCP — 5 tools registered");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
