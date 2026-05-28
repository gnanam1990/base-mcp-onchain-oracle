# OnchainOracle Architecture

## Product Role
Serve reliable token metrics, whale alerts, yield rankings, and protocol health data as paid machine-readable feeds.

## Current Foundation
- Next.js App Router dashboard with the shared Base industrial-neon UI system.
- Static product data in `lib/project-data.json` for the first demo surface.
- Product status endpoint: `GET /api/onchain-oracle/status`.
- MCP tool names are displayed in the UI and ready to back with handlers.

## Base Pattern
- Base Account is the primary wallet and approval surface.
- Read actions should stay free where possible.
- Paid or premium calls should use x402 with explicit max-payment controls.
- Write actions should return prepared calls and wait for user approval.

## Safety Defaults
- Base Sepolia first, then Base mainnet.
- No private keys in committed files.
- No hidden approvals or automatic writes.
- Keep public demo values small and auditable.
