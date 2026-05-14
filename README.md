# Kinro MCP

## Demo mode

**Everything runs locally with mock data.** Clone, `npm install`, `npm run build`, then `node build/index.js` — no API keys, no `.env` file, and **no outbound network calls** from the server. Optional `PORT` is only used when you start **HTTP** transport.

The Kinro MCP server powers **Kinro**-style AI insurance agent demos: quotes, policy talk-tracks, compliance screening, carrier panels, lead scoring, and scripted investor conversations.

---

## Prerequisites

- Node.js 18+
- npm

## Setup (zero configuration)

```bash
git clone <this-repo>
cd kinro-mcp
npm install
npm run build
```

Optional: copy `.env.example` to `.env` if you want to override **`PORT`** for HTTP (defaults to **3000**).

## Run

| Mode | Command |
| --- | --- |
| **Stdio** (default) | `node build/index.js` or `npm run start:stdio` |
| **Stdio** (explicit) | `node build/index.js --transport stdio` |
| **HTTP** | `npm run start:http` (uses `PORT` or 3000) |

**Stdio:** logs go to **stderr** only; stdout is reserved for MCP JSON-RPC.

**HTTP:** `POST /mcp` and `GET /mcp` (Streamable HTTP + SSE), `GET /health`, `GET /`. The home page shows a **yellow “DEMO MODE”** banner. CORS allows `*` origin with `POST`, `GET`, `OPTIONS` and `Content-Type` header.

### Quick HTTP checks

```bash
npm run start:http
# other terminal:
curl -s http://127.0.0.1:3000/health
```

## Tools (all mock / offline)

| Tool | What it does (demo) |
| --- | --- |
| `get_quote` | Three quotes with ZIP-seeded premiums, deductibles, limits, Clearbit-style logo URLs, `quote_id`, `valid_until`, `estimated_annual`. |
| `explain_policy` | One of three agent-style templates (chosen from `policy_id` length); 3–4 sentences with the buyer’s question woven in. |
| `check_compliance` | Banned-phrase scan + **`compliance_score`** (100 minus 15 per issue). |
| `list_carriers` | Filters the built-in 10-carrier panel; if the state does not match, returns the first three carriers plus an availability **note**. |
| `qualify_buyer` | Existing score/tier logic plus **`recommended_coverage_type`**, **`next_step`**, **`estimated_annual_savings`**. |
| `get_demo_conversation` | Returns a scripted `user` / `agent` transcript for **`homeowner`**, **`renter`**, **`auto`**, or **`first_time_buyer`**. A fifth bind-phase script lives in source as `POST_BIND_DEMO_FLOW` in `src/data/mock-conversations.ts`. |

## Claude Desktop — stdio

Use the default stdio transport (no flags required):

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

## Claude Desktop — HTTP (Streamable)

Run `npm run start:http`, then point your client’s MCP HTTP entry at `http://127.0.0.1:3000/mcp` (adjust host/port). Exact JSON keys depend on your Claude Desktop version—use the in-app MCP developer docs for **Streamable HTTP** / remote server fields.

## Example prompts (one tool each)

1. **Quotes:** “I’m in **CA**, ZIP **94103**, need **homeowners** quotes—show me three options with annual totals.” → `get_quote`
2. **Policy plain English:** “Explain **HO-94103-001** for a buyer asking whether sewer backup is covered.” → `explain_policy`
3. **Compliance:** “Scan this pitch for **California**: *We guarantee the cheapest rates and earthquake not covered without saying more.*” → `check_compliance`
4. **Carrier panel:** “Which carriers write **auto** in **FL** in the Kinro demo panel?” → `list_carriers`
5. **Lead score:** “Qualify a **homeowners** lead in **80202**, $450k home, **0** prior claims.” → `qualify_buyer`
6. **Investor demo:** “Show the **`homeowner`** scripted Kinro conversation for a board walkthrough.” → `get_demo_conversation`

## Docker

```bash
docker build -t kinro-mcp .
docker run --rm -p 3000:3000 kinro-mcp
```

No secrets or API configuration required.

## Developer: handler smoke tests

```bash
npm run test:tools
```

---

Paste the following into Claude Desktop’s MCP configuration if you prefer an explicit stdio flag:

```json
{
  "mcpServers": {
    "kinro": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/kinro-mcp/build/index.js",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

If your config already has `mcpServers`, add only the `"kinro"` entry inside that object.
