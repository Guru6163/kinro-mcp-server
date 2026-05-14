# Kinro MCP

Model Context Protocol server for **Kinro** (AI insurance sales agents). It exposes a single mock quoting tool over **stdio**, suitable for **Claude Desktop** and other MCP clients that spawn a local process.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npm run build
```

## Run (stdio)

```bash
npm run build && node build/index.js
```

You should see `Kinro MCP server running` on **stderr** only. Do not add `console.log` in this server; stdout is reserved for the MCP JSON-RPC stream.

## Tool: `get_quote`

**Inputs**

| Field | Type | Notes |
| --- | --- | --- |
| `zip_code` | string | Rating ZIP (mock). |
| `coverage_type` | enum | One of: `homeowners`, `auto`, `renters`, `pet`. |

**Response**

Hardcoded mock object:

```json
{
  "carrier": "Mock Carrier",
  "monthly_premium": 120,
  "coverage_limit": 300000
}
```

## Claude Desktop

1. Open Claude Desktop MCP settings (Developer → MCP configuration, or edit the config file per [Anthropic’s docs](https://modelcontextprotocol.io/quickstart/user)).
2. Merge the JSON at the **bottom of this file** into your MCP config. Replace `/ABSOLUTE/PATH/TO/kinro-mcp/build/index.js` with the real absolute path to `build/index.js` on your machine. If you already have `mcpServers`, add only the `"kinro"` entry inside that object.

---

Paste the following into Claude Desktop’s MCP configuration (adjust the path in `args`):

```json
{
  "mcpServers": {
    "kinro": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/kinro-mcp/build/index.js"]
    }
  }
}
```
