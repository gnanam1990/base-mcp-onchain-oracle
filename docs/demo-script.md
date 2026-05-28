# OnchainOracle Demo Script

## Goal
Show a complete Base-themed paid oracle loop: create a feed, ingest an observation, quote the x402 price, block unpaid access, unlock paid data, and record the query receipt.

## Flow
1. Open the dashboard.
2. Show live feed metrics: feed count, average freshness, and paid queries.
3. Register a demo feed with `POST /api/onchain-oracle/feeds`.
4. Ingest a fresh observation with `POST /api/onchain-oracle/feeds/:slug/observations`.
5. Fetch the paid query quote with `GET /api/onchain-oracle/feeds/:slug/quote`.
6. Attempt `POST /api/onchain-oracle/feeds/:slug/query` without payment and show the `402 Payment Required` body.
7. Retry with `x-demo-payment: accepted`, show feed payload, recent observations, receipt, and `payment-response`.
8. Call `POST /api/mcp/onchain-oracle` with `get_feed_quote` to prove agents can resolve the same payment metadata.
9. Refresh the dashboard and show paid query movement.

## Next Proof
Swap demo observations for signed worker output, anchor feed roots on Base Sepolia, and use a configured x402 facilitator.
