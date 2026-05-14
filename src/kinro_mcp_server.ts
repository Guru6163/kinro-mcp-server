import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { checkComplianceTool, handleCheckCompliance } from "./tools/check_compliance.js";
import { explainPolicyTool, handleExplainPolicy } from "./tools/explain_policy.js";
import {
  getDemoConversationTool,
  handleGetDemoConversation,
} from "./tools/get_demo_conversation.js";
import { getQuoteTool, handleGetQuote } from "./tools/get_quote.js";
import { handleListCarriers, listCarriersTool } from "./tools/list_carriers.js";
import { handleQualifyBuyer, qualifyBuyerTool } from "./tools/qualify_buyer.js";

export const KINRO_TOOL_NAMES = [
  "get_quote",
  "explain_policy",
  "check_compliance",
  "list_carriers",
  "qualify_buyer",
  "get_demo_conversation",
] as const;

export const KINRO_MCP_VERSION = "0.3.0";

const KINRO_TOOLS = [
  getQuoteTool,
  explainPolicyTool,
  checkComplianceTool,
  listCarriersTool,
  qualifyBuyerTool,
  getDemoConversationTool,
] as const;

export function createKinroMcpServer(): Server {
  const server = new Server(
    {
      name: "kinro-insurance",
      version: KINRO_MCP_VERSION,
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
      case getDemoConversationTool.name:
        return handleGetDemoConversation(raw);
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  });

  return server;
}
