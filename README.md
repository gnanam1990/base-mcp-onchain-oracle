# OnchainOracle

x402-monetized Base analytics for agents and builders.

**Status:** Data console MVP foundation

Serve reliable token metrics, whale alerts, yield rankings, and protocol health data as paid machine-readable feeds.

## Current MVP
- Base industrial-neon UI theme from the shared suite prompt.
- Responsive dashboard with wallet/action controls, live feed metrics, workflow, MCP tools, and record surface.
- File-backed oracle feed registry with feed creation, observation ingestion, x402 quote lookup, paid query execution, and receipt recording.
- Demo x402 flow that returns `402 Payment Required` until a payment header or demo payment approval is provided.
- Product status API at `/api/onchain-oracle/status`.
- MCP-compatible JSON endpoint at `/api/mcp/onchain-oracle`.
- Smoke checks for feed creation, observation ingest, quote, unpaid lock, paid unlock, receipt, and MCP quote.

## API Surface
- `GET /api/onchain-oracle/feeds` lists active feeds.
- `POST /api/onchain-oracle/feeds` registers a paid feed.
- `POST /api/onchain-oracle/feeds/:slug/observations` records the latest signed-style observation payload.
- `GET /api/onchain-oracle/feeds/:slug/quote` returns the x402 payment requirement for a feed query.
- `POST /api/onchain-oracle/feeds/:slug/query` releases feed data after payment verification and records a receipt.
- `GET /api/onchain-oracle/status` returns dashboard data and oracle stats.
- `GET /api/mcp/onchain-oracle` lists MCP tools.
- `POST /api/mcp/onchain-oracle` runs MVP tools such as `get_feed_quote`, `prepare_feed_query`, and `get_oracle_stats`.

## Local Development
```bash
npm install
npm run dev -- -p 3002
```

Open `http://127.0.0.1:3002`.

Local data is written to `.data/onchain-oracle-db.json`. Override it with `ORACLE_DATA_FILE` for isolated runs.

## Environment
Copy `.env.example` to `.env.local` when you need custom payment behavior.

- `ORACLE_PAYMENT_MODE=demo` accepts the `x-demo-payment: accepted` header for local demos.
- `ORACLE_PAYMENT_MODE=strict` requires a real `x-payment` header and facilitator configuration.
- `X402_FACILITATOR_URL` points to a facilitator that can verify and settle x402 payments.
- `X402_RECEIVING_ADDRESS` sets the oracle feed payout address.

## Checks
```bash
npm run typecheck
npm run build
npm run test:smoke
```

## Next Build Slice
Replace the file-backed feed store with signed job output, add onchain anchoring for feed roots, and wire a production facilitator for live Base payments.

## License
MIT
