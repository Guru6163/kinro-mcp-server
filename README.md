# Kinro MCP Server

**MCP server that exposes Kinro-style insurance demos as tools—quotes, compliance, carriers, and more—for any MCP-capable assistant.**

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol-111111?style=flat)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is this?

This is an [MCP](https://modelcontextprotocol.io) server that exposes Kinro’s insurance capabilities as **tools** any AI assistant can call. It runs entirely on **mock / offline data**—no live rating APIs or secrets required. It was built as a **demo** for the Founding Engineer role.

---

## Demo

```text
User (in Claude Desktop)
  → “I’m in CA, ZIP 94103—give me three homeowners quotes.”
    → Claude invokes Kinro MCP tool `get_quote`
      → Kinro MCP Server (this repo)
        → returns JSON quotes (carrier, premium, limits, …)
          → Claude shows the options in chat
```

---

## Tools

| Tool | Input | What it does |
| --- | --- | --- |
| `get_quote` | `state`, `zip_code`, `coverage_type` (`homeowners` \| `auto` \| `renters` \| `pet`) | Returns up to three rated demo quotes with premiums, deductibles, and limits. |
| `explain_policy` | `policy_id`, `buyer_question` | Returns a plain-English agent-style explanation woven around the buyer’s question. |
| `check_compliance` | `response_text`, `state` | Scans copy for banned phrases and returns a compliance score and issues list. |
| `list_carriers` | `state`, `coverage_type` | Lists carriers from the demo panel for that market (with a note when using fallback). |
| `qualify_buyer` | `zip_code`, `coverage_type`, optional `property_value`, `prior_claims` | Scores the lead and returns tier, recommended coverage bundle, and next-step hints. |
| `get_demo_conversation` | `scenario` (`homeowner` \| `renter` \| `auto` \| `first_time_buyer`) | Returns a scripted user/agent transcript for stakeholder walkthroughs. |

---

## Quick Start (3 steps only)

```bash
git clone https://github.com/<your-org>/kinro-mcp.git && cd kinro-mcp
npm install && npm run build
npm test
```

Optional: copy `.env.example` to `.env` to override **`PORT`** for HTTP transport (defaults to **3000**).

---

## Connect to Claude Desktop

After `npm run build`, add this block to your Claude Desktop MCP config (replace the path with the **absolute** path to `build/index.js` on your machine):

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

If your config already defines `mcpServers`, merge in only the `"kinro"` entry. Stdio is the default transport; stdout stays reserved for MCP JSON-RPC (logs go to stderr).

---

## Project Structure

```text
src/
├── data/
│   ├── carriers.ts
│   ├── compliance_rules.ts
│   └── mock-conversations.ts
├── tools/
│   ├── check_compliance.ts
│   ├── explain_policy.ts
│   ├── get_demo_conversation.ts
│   ├── get_quote.ts
│   ├── list_carriers.ts
│   └── qualify_buyer.ts
├── index.ts
├── kinro_mcp_server.ts
├── server-http.ts
├── server-stdio.ts
└── types.ts
```

---

## Why I built this

Kinro’s thesis is **“sell everywhere buyers are.”** MCP is a new distribution channel: any AI product that supports MCP can surface insurance workflows through Kinro-style tools. To my knowledge, **no major insurer has shipped a public MCP server yet**—this demo shows what that could look like.

---

## Run modes

| Mode | Command |
| --- | --- |
| **Stdio** (default) | `npm run start:stdio` or `node build/index.js` |
| **HTTP** (Streamable HTTP + SSE) | `npm run start:http` — `POST` / `GET` `/mcp`, `GET` `/health` |

For HTTP smoke test: `curl -s http://127.0.0.1:3000/health`

Docker: `docker build -t kinro-mcp .` then `docker run --rm -p 3000:3000 kinro-mcp`
