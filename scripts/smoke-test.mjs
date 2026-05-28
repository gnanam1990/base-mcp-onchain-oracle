const baseUrl = process.env.ORACLE_BASE_URL || "http://127.0.0.1:3002";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}, expectedStatus = 200) {
  const response = await fetch(new URL(path, baseUrl), options);
  const json = await response.json();
  assert(
    response.status === expectedStatus,
    `${path} expected ${expectedStatus}, received ${response.status}: ${JSON.stringify(json)}`,
  );
  return { response, json };
}

const status = await request("/api/onchain-oracle/status");
assert(status.json.data.name === "OnchainOracle", "project name should match");
assert(status.json.data.metrics.length === 3, "dashboard should expose three metrics");
assert(status.json.data.workflow.length === 4, "agent flow should expose four steps");
assert(status.json.data.tools.length >= 4, "MCP tool list should be present");

const feedName = `Smoke Base Volatility ${Date.now()}`;
const created = await request(
  "/api/onchain-oracle/feeds",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: feedName,
      category: "Risk",
      description: "Publishes a compact volatility signal for Base agents.",
      source: "Smoke indexer",
      priceUsdc: 0.004,
    }),
  },
  201,
);

const feed = created.json.data;
assert(feed.slug, "created feed should include a slug");

const observation = await request(
  `/api/onchain-oracle/feeds/${feed.slug}/observations`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      value: "base-volatility:medium",
      confidence: 0.88,
      sourceTx: "0xsmoketx",
    }),
  },
  201,
);
assert(observation.json.data.observation.feedSlug === feed.slug, "observation should attach to feed");

const quote = await request(`/api/onchain-oracle/feeds/${feed.slug}/quote`);
assert(quote.json.data.payment.scheme === "exact", "quote should expose exact payment scheme");
assert(quote.json.data.payment.asset === "USDC", "quote should request USDC");

const unpaid = await request(
  `/api/onchain-oracle/feeds/${feed.slug}/query`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ window: "1h" }),
  },
  402,
);
assert(unpaid.json.error === "payment_required", "unpaid query should require payment");

const paid = await request(`/api/onchain-oracle/feeds/${feed.slug}/query`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-demo-payment": "accepted",
  },
  body: JSON.stringify({ window: "1h" }),
});
assert(paid.json.receipt.feedSlug === feed.slug, "paid query should return a receipt");
assert(paid.response.headers.get("payment-response"), "paid query should emit payment-response");

const mcp = await request("/api/mcp/onchain-oracle", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    tool: "get_feed_quote",
    arguments: { slug: feed.slug },
  }),
});
assert(mcp.json.data.slug === feed.slug, "MCP quote tool should resolve created feed");

console.log(`OnchainOracle smoke checks passed against ${baseUrl}`);
