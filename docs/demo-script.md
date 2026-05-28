# OnchainOracle Demo Script

## Goal
Show a complete, user-approved Base MCP/x402 workflow for OnchainOracle.

## Demo Flow
1. Agent asks for the best Base USDC yields.
2. OnchainOracle returns a 402 challenge for the paid ranking endpoint.
3. Agent pays with USDC on Base and receives the ranking.
4. Developer portal records the query and settlement receipt.
5. Dashboard shows endpoint freshness and paid call volume.

## Required Prep
- Use a funded Base Account test wallet.
- Verify Base Sepolia before any Base mainnet action.
- Keep payment amounts small for public demos.
- Record the transaction or receipt links used in the demo.

## Success Criteria
- The product problem is clear in the first 30 seconds.
- The UI shows the core workflow without relying only on terminal output.
- Any AI or MCP action ends in a visible user approval or receipt.
- The final screen proves the result with app state and an onchain/payment reference.
