# OnchainOracle Architecture

## Product Role
OnchainOracle exposes curated token, whale, yield, and protocol-health data as paid x402 endpoints and MCP tools.

## System Shape
- Frontend app: Next.js, TypeScript, Tailwind, shadcn-style components, responsive dashboards.
- API layer: Node/TypeScript endpoints for product reads, prepare flows, analytics, and x402-gated access.
- Base layer: Base Account for user approval and Base MCP for assistant-driven actions.
- Payment layer: x402 for paid API/content/service access using USDC on Base or Base Sepolia.
- Data layer: PostgreSQL for durable product state and Redis for cache/session/rate-limit workloads.
- Contracts: Solidity/Foundry only where the module needs onchain state or settlement logic.

## Main Modules
- Data ingestion jobs for Base token, DeFi, and wallet activity.
- Paid x402 endpoints for token metrics, whale alerts, yield rankings, and protocol health.
- Developer portal with docs, endpoint status, pricing, and example responses.
- MCP server exposing query tools for AI assistants.
- Usage dashboard for paid queries and data freshness.

## Data Model
- Token metrics, volumes, holder snapshots, and price references.
- Large transfer alerts with token, amount, wallet, and timestamp.
- Protocol yield snapshots and risk annotations.
- Paid request receipts and data freshness audit records.

## MCP And x402 Pattern
Every write action should be exposed as a prepare endpoint that returns unsigned calldata or a payment request. MCP/plugin documentation must explain onboarding, read endpoints, prepare endpoints, and the mapping into Base MCP actions.

For paid resources, endpoints should return an x402 payment requirement before serving premium data. The app must enforce a user-defined max payment cap and record receipts for analytics and support.

## Safety Defaults
- Base Sepolia first, then Base mainnet.
- No private keys in app config.
- No hidden approvals or auto-execution.
- Clear user review before paid access or onchain writes.
- Placeholder env vars only in committed files.
