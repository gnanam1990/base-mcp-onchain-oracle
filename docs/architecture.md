# OnchainOracle Architecture

## Product Role
Serve reliable token metrics, whale alerts, yield rankings, and protocol health data as paid machine-readable feeds.

## Current Foundation
- Next.js App Router dashboard with the shared Base industrial-neon UI system.
- File-backed oracle state in `.data/onchain-oracle-db.json`, seeded with Base analytics feeds.
- Product status endpoint: `GET /api/onchain-oracle/status`.
- Feed endpoints for listing, registering, observing, quoting, and paid querying.
- MCP JSON endpoint backed by live feed state.

## Modules
- `lib/oracle-store.ts` owns feed records, observations, stats, local persistence, and receipts.
- `lib/oracle-payment.ts` prepares x402 payment requirements and verifies demo or facilitator-backed payments.
- `app/api/onchain-oracle/feeds` exposes feed registration and listing.
- `app/api/onchain-oracle/feeds/[slug]/observations` ingests the latest feed observation.
- `app/api/onchain-oracle/feeds/[slug]/quote` returns a feed-specific payment requirement.
- `app/api/onchain-oracle/feeds/[slug]/query` blocks unpaid access with `402 Payment Required`, records paid queries, and emits `payment-response`.
- `app/api/mcp/onchain-oracle` maps agent tools to feed reads, quotes, prepared queries, and stats.

## Base Pattern
- Base Account is the primary wallet and approval surface.
- Read actions should stay free where possible.
- Paid or premium calls should use x402 with explicit max-payment controls.
- Write actions should return prepared calls and wait for user approval.

## Payment Modes
- `demo` mode accepts `x-demo-payment: accepted` so the local demo can show the full paid feed loop without live funds.
- `strict` mode requires `x-payment` plus `X402_FACILITATOR_URL`; the app calls `/verify` and `/settle` before releasing feed payloads.
- Receipts store feed, amount, network, payment hash, facilitator reference, and timestamp for auditability.

## Safety Defaults
- Base Sepolia first, then Base mainnet.
- No private keys in committed files.
- No hidden approvals or automatic writes.
- Keep public demo values small and auditable.
