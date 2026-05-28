import fs from "node:fs";
import path from "node:path";
import projectData from "./project-data.json";

export type OracleFeed = {
  slug: string;
  name: string;
  category: string;
  description: string;
  source: string;
  priceUsdc: number;
  freshnessSeconds: number;
  paidQueries: number;
  revenueUsdc: number;
  status: "Active" | "Draft";
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type OracleObservation = {
  id: string;
  feedSlug: string;
  value: string;
  confidence: number;
  sourceTx?: string;
  createdAt: string;
};

export type OracleReceipt = {
  id: string;
  feedSlug: string;
  feedName: string;
  amountUsdc: number;
  asset: "USDC";
  network: string;
  paymentMode: "demo" | "facilitator";
  paymentPayloadHash?: string;
  facilitatorReference?: string;
  createdAt: string;
};

type OracleDb = {
  feeds: OracleFeed[];
  observations: OracleObservation[];
  receipts: OracleReceipt[];
};

type FeedInput = {
  name: string;
  category: string;
  description: string;
  source: string;
  priceUsdc: number;
};

const seedFeeds: OracleFeed[] = [
  {
    slug: "usdc-yield-ranking",
    name: "USDC Yield Ranking",
    category: "Yield",
    description: "Ranks Base USDC yield venues by net APY, liquidity, and freshness.",
    source: "Base yield indexer",
    priceUsdc: 0.002,
    freshnessSeconds: 18,
    paidQueries: 410,
    revenueUsdc: 0.82,
    status: "Active",
    payload: { leader: "Aave Base", netApy: "4.21%", risk: "low" },
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:18.000Z",
  },
  {
    slug: "large-transfer-feed",
    name: "Large Transfer Feed",
    category: "Wallets",
    description: "Flags large Base ERC-20 transfers with asset, notional value, and wallet class.",
    source: "Base transfer monitor",
    priceUsdc: 0.005,
    freshnessSeconds: 24,
    paidQueries: 291,
    revenueUsdc: 1.455,
    status: "Active",
    payload: { latest: "large USDC transfer", notionalUsd: 184000, walletClass: "exchange" },
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:24.000Z",
  },
  {
    slug: "protocol-health",
    name: "Protocol Health",
    category: "Risk",
    description: "Summarizes protocol TVL movement, failure signals, and risk labels.",
    source: "Base protocol health worker",
    priceUsdc: 0.003,
    freshnessSeconds: 42,
    paidQueries: 230,
    revenueUsdc: 0.69,
    status: "Active",
    payload: { protocol: "Base lending basket", risk: "normal", tvlDelta24h: "+1.8%" },
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:42.000Z",
  },
];

function dbPath() {
  if (process.env.ORACLE_DATA_FILE) {
    return process.env.ORACLE_DATA_FILE;
  }
  return process.env.VERCEL
    ? path.join("/tmp", "onchain-oracle-db.json")
    : path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "onchain-oracle-db.json");
}

function readDb(): OracleDb {
  const file = dbPath();
  if (!fs.existsSync(file)) {
    const initial = { feeds: seedFeeds, observations: [], receipts: [] };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as OracleDb;
}

function writeDb(db: OracleDb) {
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `oracle-feed-${Date.now()}`;
}

function uniqueSlug(name: string, feeds: OracleFeed[]) {
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (feeds.some((feed) => feed.slug === slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

export function listFeeds() {
  return readDb().feeds;
}

export function findFeed(slug: string) {
  return readDb().feeds.find((feed) => feed.slug === slug && feed.status === "Active");
}

export function createFeed(input: FeedInput) {
  const db = readDb();
  const now = new Date().toISOString();
  const feed: OracleFeed = {
    slug: uniqueSlug(input.name, db.feeds),
    name: input.name,
    category: input.category,
    description: input.description,
    source: input.source,
    priceUsdc: input.priceUsdc,
    freshnessSeconds: 0,
    paidQueries: 0,
    revenueUsdc: 0,
    status: "Active",
    payload: { status: "awaiting_observation", feed: input.name },
    createdAt: now,
    updatedAt: now,
  };
  db.feeds.unshift(feed);
  writeDb(db);
  return feed;
}

export function addObservation(feedSlug: string, input: Omit<OracleObservation, "id" | "feedSlug" | "createdAt">) {
  const db = readDb();
  const feed = db.feeds.find((item) => item.slug === feedSlug);
  if (!feed) {
    return undefined;
  }

  const now = new Date().toISOString();
  const observation: OracleObservation = {
    id: `observation-${feedSlug}-${Date.now()}`,
    feedSlug,
    value: input.value,
    confidence: input.confidence,
    sourceTx: input.sourceTx,
    createdAt: now,
  };

  feed.payload = {
    value: input.value,
    confidence: input.confidence,
    sourceTx: input.sourceTx || "demo-source",
  };
  feed.freshnessSeconds = 1;
  feed.updatedAt = now;
  db.observations.unshift(observation);
  writeDb(db);
  return { feed, observation };
}

export function feedObservations(feedSlug: string) {
  return readDb().observations.filter((observation) => observation.feedSlug === feedSlug).slice(0, 5);
}

export function oracleStats() {
  const db = readDb();
  const activeFeeds = db.feeds.filter((feed) => feed.status === "Active");
  const freshness = activeFeeds.length
    ? Math.round(activeFeeds.reduce((sum, feed) => sum + feed.freshnessSeconds, 0) / activeFeeds.length)
    : 0;
  return {
    feeds: activeFeeds.length,
    freshness,
    paidQueries: activeFeeds.reduce((sum, feed) => sum + feed.paidQueries, 0),
    revenueUsdc: activeFeeds.reduce((sum, feed) => sum + feed.revenueUsdc, 0),
  };
}

export function dashboardData() {
  const stats = oracleStats();
  const feeds = listFeeds();
  return {
    ...projectData,
    metrics: [
      { label: "Feeds", value: String(stats.feeds), tone: "blue" },
      { label: "Freshness", value: `${stats.freshness}s`, tone: "green" },
      { label: "Paid queries", value: String(stats.paidQueries), tone: "amber" },
    ],
    records: feeds.slice(0, 3).map((feed) => [
      feed.name,
      `${feed.priceUsdc.toFixed(3)} USDC`,
      feed.freshnessSeconds <= 1 ? "fresh now" : `${feed.freshnessSeconds}s fresh`,
    ]),
  };
}

export function recordPaidQuery(
  feedSlug: string,
  payment: Omit<OracleReceipt, "id" | "feedSlug" | "feedName" | "amountUsdc" | "asset" | "createdAt">,
) {
  const db = readDb();
  const feed = db.feeds.find((item) => item.slug === feedSlug);
  if (!feed) {
    return undefined;
  }

  const receipt: OracleReceipt = {
    id: `oracle-${feedSlug}-${Date.now()}`,
    feedSlug,
    feedName: feed.name,
    amountUsdc: feed.priceUsdc,
    asset: "USDC",
    network: payment.network,
    paymentMode: payment.paymentMode,
    paymentPayloadHash: payment.paymentPayloadHash,
    facilitatorReference: payment.facilitatorReference,
    createdAt: new Date().toISOString(),
  };

  feed.paidQueries += 1;
  feed.revenueUsdc = Number((feed.revenueUsdc + feed.priceUsdc).toFixed(6));
  feed.updatedAt = receipt.createdAt;
  db.receipts.unshift(receipt);
  writeDb(db);
  return receipt;
}
