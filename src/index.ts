import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { checkComplianceTool, handleCheckCompliance } from "./tools/check_compliance.js";
import { explainPolicyTool, handleExplainPolicy } from "./tools/explain_policy.js";
import { getQuoteTool, handleGetQuote } from "./tools/get_quote.js";
import { handleListCarriers, listCarriersTool } from "./tools/list_carriers.js";
import { handleQualifyBuyer, qualifyBuyerTool } from "./tools/qualify_buyer.js";

const KINRO_TOOLS = [
  getQuoteTool,
  explainPolicyTool,
  checkComplianceTool,
  listCarriersTool,
  qualifyBuyerTool,
] as const;

const server = new Server(
  {
    name: "kinro-insurance",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [...KINRO_TOOLS],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const raw = request.params.arguments ?? {};
  switch (request.params.name) {
    case getQuoteTool.name:
      return handleGetQuote(raw);
    case explainPolicyTool.name:
      return handleExplainPolicy(raw);
    case checkComplianceTool.name:
      return handleCheckCompliance(raw);
    case listCarriersTool.name:
      return handleListCarriers(raw);
    case qualifyBuyerTool.name:
      return handleQualifyBuyer(raw);
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
