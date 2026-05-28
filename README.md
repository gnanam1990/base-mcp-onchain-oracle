# OnchainOracle

x402-monetized Base analytics for agents.

**Status:** Planned third build using AgentPay payment/discovery primitives.

OnchainOracle exposes curated token, whale, yield, and protocol-health data as paid x402 endpoints and MCP tools.

## Why It Exists
Base MCP gives AI assistants access to Base Account actions such as balances, sends, swaps, contract calls, and x402 payments, with user approval for writes. This project turns that capability into a focused product for AI agents, DeFi apps, analysts, and developers that need paid high-signal Base data.

## Core Capabilities
- Data ingestion jobs for Base token, DeFi, and wallet activity.
- Paid x402 endpoints for token metrics, whale alerts, yield rankings, and protocol health.
- Developer portal with docs, endpoint status, pricing, and example responses.
- MCP server exposing query tools for AI assistants.
- Usage dashboard for paid queries and data freshness.

## Roadmap Snapshot
1. Define paid data products and static mock responses.
2. Wire live data providers and freshness checks.
3. Protect endpoints with x402 and receipt logging.
4. Add MCP query tools and developer portal docs.
5. Launch API examples, dashboards, and Base mainnet paid usage.

## Repository Status
This repository is public from day one. It starts with product, architecture, roadmap, and demo documentation. Implementation commits should stay small and use conventional commit prefixes.

## License
MIT
