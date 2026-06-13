# OnchainOracle

> x402-monetized Base analytics feeds for agents and builders — pay per query with USDC to unlock token metrics, whale alerts, yield rankings, and protocol health data.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg)

## Overview

OnchainOracle is a Next.js application that serves Base on-chain analytics as paid, machine-readable feeds. Each feed query is gated by the [x402](https://www.x402.org/) HTTP payment protocol: a request returns `402 Payment Required` with a USDC payment requirement until a valid payment (or demo header) is supplied. It exposes both a REST API and an MCP-compatible JSON endpoint so autonomous agents can discover, price, and purchase feed data programmatically. This is an MVP foundation — feed data is currently file-backed and seeded for demonstration.

## Features

- File-backed oracle feed registry with feed creation, observation ingestion, and status tracking.
- x402 payment gating on feed queries: requests are locked with `402 Payment Required` until payment is verified.
- Two payment modes: `demo` (accepts an `x-demo-payment` header for local runs) and `strict` (requires a real `x-payment` header verified and settled through an x402 facilitator).
- Paid-query receipts recording amount, network, payment mode, payload hash, and facilitator reference.
- MCP-compatible endpoint exposing tools for listing feeds, fetching quotes, preparing queries, and reading oracle stats.
- Responsive dashboard UI with feed metrics, agent workflow, MCP tool list, and a record surface.
- Smoke test covering feed creation, observation ingest, quote, unpaid lock, paid unlock, receipt, and MCP quote.

> Status note: feed payloads and metrics are seeded/demo data backed by a local JSON file. There is no live on-chain anchoring or production facilitator wired by default — see [Status](#status).

## Tech stack

- **Next.js 16** (App Router) and **React 19**
- **TypeScript**
- **lucide-react** for icons
- Node.js `crypto` and `fs` for payload hashing and the file-backed store
- [x402](https://www.x402.org/) payment protocol (HTTP 402 flow)

## Getting started

### Prerequisites

- Node.js 20+ (Next.js 16 / React 19)
- npm

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and set values as needed. The app runs with sane defaults in `demo` mode without any configuration. Variable names and purposes:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | Base chain ID exposed to the client (e.g. `8453`). |
| `BASE_RPC_URL` | Base RPC endpoint. |
| `BASE_ACCOUNT_CLIENT_ID` | Base Account client identifier. |
| `BASE_MCP_URL` | Base MCP server URL. |
| `X402_FACILITATOR_URL` | x402 facilitator base URL used to verify and settle payments in `strict` mode. |
| `X402_RECEIVING_ADDRESS` | Payout address that receives feed payments. |
| `X402_DEFAULT_NETWORK` | Default x402 network label. |
| `ORACLE_PAYMENT_MODE` | `demo` (accepts `x-demo-payment`) or `strict` (requires a verified `x-payment` header). |
| `ORACLE_X402_NETWORK` | Network identifier returned in payment requirements (default `eip155:8453`). |
| `ORACLE_DATA_FILE` | Override path for the file-backed data store (useful for isolated runs). |
| `DATABASE_URL` | Reserved database connection string. |
| `REDIS_URL` | Reserved Redis connection string. |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app. |

Never commit real secret values.

### Running

```bash
# default dev server on port 3000
npm run dev

# or pin to port 3002 (matches the default app URL / smoke test)
npm run dev -- -p 3002
```

Then open `http://127.0.0.1:3002` (or `http://localhost:3000`).

Local data is written to `.data/onchain-oracle-db.json` by default. Set `ORACLE_DATA_FILE` to relocate it for isolated runs.

For a production build:

```bash
npm run build
npm run start
```

## Usage

### REST API

| Method & path | Description |
| --- | --- |
| `GET /api/onchain-oracle/feeds` | List active feeds. |
| `POST /api/onchain-oracle/feeds` | Register a paid feed. |
| `POST /api/onchain-oracle/feeds/:slug/observations` | Record the latest observation payload for a feed. |
| `GET /api/onchain-oracle/feeds/:slug/observations` | List recent observations for a feed. |
| `GET /api/onchain-oracle/feeds/:slug/quote` | Return the x402 payment requirement for a feed query. |
| `POST /api/onchain-oracle/feeds/:slug/query` | Release feed data after payment verification and record a receipt. Returns `402` until paid. |
| `GET /api/onchain-oracle/status` | Return dashboard data and oracle stats. |
| `GET /api/mcp/onchain-oracle` | List MCP tools. |
| `POST /api/mcp/onchain-oracle` | Run an MCP tool. |

### Paid query (demo mode)

```bash
# locked: returns 402 Payment Required with an x402 requirement
curl -X POST http://127.0.0.1:3002/api/onchain-oracle/feeds/usdc-yield-ranking/query \
  -H "content-type: application/json" -d '{"window":"1h"}'

# unlocked in demo mode: returns feed payload + receipt
curl -X POST http://127.0.0.1:3002/api/onchain-oracle/feeds/usdc-yield-ranking/query \
  -H "content-type: application/json" \
  -H "x-demo-payment: accepted" -d '{"window":"1h"}'
```

### MCP endpoint

`POST /api/mcp/onchain-oracle` accepts `{ "tool": "...", "arguments": {...} }`. Available tools include:

- `list_oracle_feeds` (also `get_token_metrics`, `get_whale_alerts`, `get_yield_rankings`, `get_protocol_health`) — filter feeds by an optional `query`.
- `get_feed_quote` — return price, resource URL, and network for a feed `slug`.
- `prepare_feed_query` — return the query method, resource, and max payment for a feed `slug`.
- `get_oracle_stats` — return aggregate oracle stats.

```bash
curl -X POST http://127.0.0.1:3002/api/mcp/onchain-oracle \
  -H "content-type: application/json" \
  -d '{"tool":"get_feed_quote","arguments":{"slug":"usdc-yield-ranking"}}'
```

## Testing

```bash
npm run typecheck   # next typegen && tsc --noEmit
npm run build       # production build
npm run test:smoke  # end-to-end smoke checks (server must be running)
```

The smoke test (`scripts/smoke-test.mjs`) exercises status, feed creation, observation ingest, quote, the unpaid `402` lock, paid unlock via the demo header, the receipt, and an MCP quote. It targets `ORACLE_BASE_URL` or `http://127.0.0.1:3002` by default, so start the dev server first.

## Project structure

```
app/
  page.tsx, layout.tsx, globals.css   # dashboard UI
  api/
    onchain-oracle/
      status/route.ts                 # dashboard data + stats
      feeds/route.ts                  # list / create feeds
      feeds/[slug]/quote/route.ts     # x402 quote
      feeds/[slug]/query/route.ts     # payment-gated feed query
      feeds/[slug]/observations/route.ts
    mcp/onchain-oracle/route.ts       # MCP tool list + dispatch
lib/
  oracle-store.ts                     # file-backed feed/observation/receipt store
  oracle-payment.ts                   # x402 requirement build + payment verification
  project-data.json                   # seed project metadata
  types.ts
scripts/smoke-test.mjs                # end-to-end smoke test
docs/                                 # architecture, ui-system, demo-script, roadmap notes
```

## Status

MVP foundation. The full payment-gated REST and MCP flow works end to end, but:

- Feed data and dashboard metrics are seeded/demo values stored in a local JSON file (`.data/onchain-oracle-db.json`); there is no live on-chain data pipeline.
- `demo` payment mode is the default and accepts an `x-demo-payment` header without real settlement. Real verification/settlement requires `ORACLE_PAYMENT_MODE=strict` plus a configured `X402_FACILITATOR_URL` and `X402_RECEIVING_ADDRESS`.
- There is no on-chain anchoring of feed roots yet.

Planned next steps include replacing the file-backed store with signed job output, adding on-chain anchoring for feed roots, and wiring a production facilitator for live Base payments.

## License

MIT — see [LICENSE](LICENSE).
