import { randomUUID } from "node:crypto";
import type { Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  createKinroMcpServer,
  KINRO_MCP_VERSION,
  KINRO_TOOL_NAMES,
} from "./kinro_mcp_server.js";

type SessionEntry = {
  transport: StreamableHTTPServerTransport;
  server: Server;
};

function parsePort(): number {
  const raw = process.env.PORT;
  if (!raw) {
    return 3000;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 3000;
}

function corsHeaders(res: Response): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
  );
}

export async function runHttpServer(): Promise<void> {
  const port = parsePort();
  const sessions = new Map<string, SessionEntry>();

  const app = createMcpExpressApp({ host: "0.0.0.0" });

  app.use((req, res, next) => {
    corsHeaders(res);
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/health", (_req, res) => {
    corsHeaders(res);
    res.json({
      status: "ok",
      version: KINRO_MCP_VERSION,
      tools: [...KINRO_TOOL_NAMES],
      transport: "http",
    });
  });

  app.get("/", (_req, res) => {
    corsHeaders(res);
    const base = `http://localhost:${port}`;
    const mcpUrl = `${base}/mcp`;
    const toolsHtml = [...KINRO_TOOL_NAMES]
      .map((t) => `<li><code>${t}</code></li>`)
      .join("\n");
    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Kinro MCP Server</title>
  <style>
    .demo-banner {
      background: #fef08a;
      color: #422006;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    body { font-family: system-ui, sans-serif; max-width: 52rem; margin: 2rem auto; line-height: 1.5; }
    code { background: #f4f4f5; padding: 0.1rem 0.35rem; border-radius: 4px; }
    pre { background: #18181b; color: #fafafa; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="demo-banner">Running in DEMO MODE — all data is simulated</div>
  <h1>Kinro MCP Server</h1>
  <p><strong>Version:</strong> ${KINRO_MCP_VERSION}</p>
  <p><strong>MCP endpoint (Streamable HTTP):</strong> <code>${mcpUrl}</code></p>
  <h2>Available tools</h2>
  <ul>
${toolsHtml}
  </ul>
  <h2>Connect</h2>
  <p>Use this URL as the MCP server address in clients that support Streamable HTTP (for example Claude Desktop with HTTP transport).</p>
  <h2>Test health</h2>
  <pre>curl -s ${base}/health | jq .</pre>
</body>
</html>`);
  });

  app.post("/mcp", async (req, res) => {
    corsHeaders(res);
    try {
      const sessionHeader = req.headers["mcp-session-id"];
      const sessionId =
        typeof sessionHeader === "string"
          ? sessionHeader
          : Array.isArray(sessionHeader)
            ? sessionHeader[0]
            : undefined;

      let entry: SessionEntry | undefined;
      if (sessionId && sessions.has(sessionId)) {
        entry = sessions.get(sessionId);
      } else if (!sessionId && isInitializeRequest(req.body)) {
        const server = createKinroMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid) => {
            sessions.set(sid, { transport, server });
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) {
            sessions.delete(sid);
          }
          void server.close();
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else if (!sessionId) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32_000,
            message: "Bad Request: missing mcp-session-id for non-initialize request",
          },
          id: null,
        });
        return;
      } else {
        res.status(404).json({
          jsonrpc: "2.0",
          error: {
            code: -32_000,
            message: "Not Found: unknown session",
          },
          id: null,
        });
        return;
      }

      if (entry) {
        await entry.transport.handleRequest(req, res, req.body);
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32_603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (req, res) => {
    corsHeaders(res);
    const sessionHeader = req.headers["mcp-session-id"];
    const sessionId =
      typeof sessionHeader === "string"
        ? sessionHeader
        : Array.isArray(sessionHeader)
          ? sessionHeader[0]
          : undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    const { transport } = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  await new Promise<void>((resolve, reject) => {
    const httpServer = app.listen(port, "0.0.0.0", () => {
      console.error(
        `Kinro MCP HTTP listening on 0.0.0.0:${port} (POST/GET /mcp, GET /health)`,
      );
      resolve();
    });
    httpServer.on("error", reject);
  });

  process.on("SIGINT", async () => {
    for (const { transport } of sessions.values()) {
      await transport.close();
    }
    sessions.clear();
    process.exit(0);
  });
}
