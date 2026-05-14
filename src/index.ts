import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const getQuoteInputSchema = z.object({
  zip_code: z.string(),
  coverage_type: z.enum(["homeowners", "auto", "renters", "pet"]),
});

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
        "Return a mock insurance quote from Kinro for the given ZIP and coverage type.",
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
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_quote") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const parsed = getQuoteInputSchema.safeParse(
    request.params.arguments ?? {},
  );
  if (!parsed.success) {
    const detail = parsed.error.flatten();
    throw new Error(`Invalid arguments: ${JSON.stringify(detail)}`);
  }

  const quote = {
    carrier: "Mock Carrier",
    monthly_premium: 120,
    coverage_limit: 300_000,
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(quote),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kinro MCP server running");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
