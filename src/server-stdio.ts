import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createKinroMcpServer } from "./kinro_mcp_server.js";

export async function runStdioServer(): Promise<void> {
  const server = createKinroMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kinro MCP server running (stdio)");
  console.error("Kinro MCP — 6 tools registered (demo mode)");
}
