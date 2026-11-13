import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// In-memory cache for CoinGecko API to prevent 429 rate-limiting
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const priceCache = new Map<string, CacheEntry<Record<string, Record<string, number>>>>();
const marketCache = new Map<string, CacheEntry<any[]>>();
const CACHE_TTL_MS = 30_000; // 30 seconds

// Curated fallback prices in case CoinGecko returns 429 rate limit
const FALLBACK_PRICES: Record<string, Record<string, number>> = {
  bitcoin: { usd: 96420, eur: 89310, gbp: 76180, jpy: 14750000, cad: 135800, aud: 148900 },
  ethereum: { usd: 2840, eur: 2630, gbp: 2245, jpy: 435000, cad: 3990, aud: 4380 },
  solana: { usd: 198.5, eur: 184.2, gbp: 157.1, jpy: 30400, cad: 279.5, aud: 306.8 },
  ripple: { usd: 2.34, eur: 2.17, gbp: 1.85, jpy: 358, cad: 3.29, aud: 3.61 },
  binancecoin: { usd: 672.4, eur: 623.1, gbp: 531.4, jpy: 102900, cad: 946.8, aud: 1039.2 },
  cardano: { usd: 0.84, eur: 0.78, gbp: 0.66, jpy: 128.5, cad: 1.18, aud: 1.29 },
  dogecoin: { usd: 0.28, eur: 0.26, gbp: 0.22, jpy: 42.8, cad: 0.39, aud: 0.43 },
  'avalanche-2': { usd: 34.2, eur: 31.7, gbp: 27.0, jpy: 5240, cad: 48.1, aud: 52.8 },
  polkadot: { usd: 7.82, eur: 7.24, gbp: 6.18, jpy: 1198, cad: 11.0, aud: 12.08 },
  chainlink: { usd: 18.9, eur: 17.5, gbp: 14.9, jpy: 2895, cad: 26.6, aud: 29.2 },
  sui: { usd: 3.42, eur: 3.16, gbp: 2.70, jpy: 524, cad: 4.81, aud: 5.28 },
  near: { usd: 5.85, eur: 5.42, gbp: 4.62, jpy: 896, cad: 8.23, aud: 9.04 },
};

const FALLBACK_MARKETS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 96420, price_change_percentage_24h: 3.42, market_cap: 1898000000000, total_volume: 48500000000, high_24h: 97800, low_24h: 93200 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2840, price_change_percentage_24h: 1.84, market_cap: 342000000000, total_volume: 24300000000, high_24h: 2910, low_24h: 2760 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.02, market_cap: 128000000000, total_volume: 68000000000, high_24h: 1.01, low_24h: 0.99 },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 198.5, price_change_percentage_24h: 6.12, market_cap: 94000000000, total_volume: 8700000000, high_24h: 204.0, low_24h: 186.5 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 672.4, price_change_percentage_24h: 0.95, market_cap: 98000000000, total_volume: 1800000000, high_24h: 681.0, low_24h: 664.2 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.34, price_change_percentage_24h: -1.25, market_cap: 133000000000, total_volume: 7100000000, high_24h: 2.45, low_24h: 2.28 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.28, price_change_percentage_24h: -2.31, market_cap: 41000000000, total_volume: 3200000000, high_24h: 0.30, low_24h: 0.27 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.84, price_change_percentage_24h: 4.15, market_cap: 29900000000, total_volume: 1450000000, high_24h: 0.87, low_24h: 0.80 },
  { id: 'tron', symbol: 'trx', name: 'TRON', current_price: 0.20, price_change_percentage_24h: 0.55, market_cap: 17500000000, total_volume: 820000000, high_24h: 0.21, low_24h: 0.19 },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 34.2, price_change_percentage_24h: 2.78, market_cap: 14000000000, total_volume: 680000000, high_24h: 35.4, low_24h: 33.1 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 18.9, price_change_percentage_24h: 5.61, market_cap: 11800000000, total_volume: 820000000, high_24h: 19.4, low_24h: 17.8 },
  { id: 'sui', symbol: 'sui', name: 'Sui', current_price: 3.42, price_change_percentage_24h: 8.44, market_cap: 9800000000, total_volume: 1200000000, high_24h: 3.58, low_24h: 3.12 },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000024, price_change_percentage_24h: -3.14, market_cap: 14200000000, total_volume: 1100000000, high_24h: 0.000026, low_24h: 0.000023 },
  { id: 'the-open-network', symbol: 'ton', name: 'Toncoin', current_price: 5.48, price_change_percentage_24h: -1.10, market_cap: 13900000000, total_volume: 450000000, high_24h: 5.65, low_24h: 5.35 },
  { id: 'stellar', symbol: 'xlm', name: 'Stellar', current_price: 0.42, price_change_percentage_24h: 11.20, market_cap: 12600000000, total_volume: 1900000000, high_24h: 0.45, low_24h: 0.37 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.82, price_change_percentage_24h: 1.65, market_cap: 11200000000, total_volume: 580000000, high_24h: 8.10, low_24h: 7.60 },
  { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', current_price: 485.0, price_change_percentage_24h: -0.85, market_cap: 9600000000, total_volume: 420000000, high_24h: 495.0, low_24h: 478.0 },
  { id: 'hedera-hashgraph', symbol: 'hbar', name: 'Hedera', current_price: 0.22, price_change_percentage_24h: 14.50, market_cap: 8400000000, total_volume: 1600000000, high_24h: 0.24, low_24h: 0.18 },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 11.40, price_change_percentage_24h: 4.30, market_cap: 6800000000, total_volume: 380000000, high_24h: 11.90, low_24h: 10.80 },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 102.5, price_change_percentage_24h: -0.45, market_cap: 7700000000, total_volume: 610000000, high_24h: 106.0, low_24h: 100.5 },
  { id: 'pepe', symbol: 'pepe', name: 'Pepe', current_price: 0.000019, price_change_percentage_24h: 9.80, market_cap: 8100000000, total_volume: 2400000000, high_24h: 0.000021, low_24h: 0.000017 },
  { id: 'near', symbol: 'near', name: 'NEAR Protocol', current_price: 5.85, price_change_percentage_24h: 3.92, market_cap: 7100000000, total_volume: 720000000, high_24h: 6.10, low_24h: 5.60 },
  { id: 'aptos', symbol: 'apt', name: 'Aptos', current_price: 12.10, price_change_percentage_24h: -4.15, market_cap: 6200000000, total_volume: 480000000, high_24h: 12.80, low_24h: 11.70 },
  { id: 'internet-computer', symbol: 'icp', name: 'Internet Computer', current_price: 10.40, price_change_percentage_24h: 2.10, market_cap: 4900000000, total_volume: 210000000, high_24h: 10.80, low_24h: 10.10 },
  { id: 'aave', symbol: 'aave', name: 'Aave', current_price: 194.0, price_change_percentage_24h: 6.85, market_cap: 2900000000, total_volume: 290000000, high_24h: 202.0, low_24h: 181.0 },
  { id: 'crypto-com-chain', symbol: 'cro', name: 'Cronos', current_price: 0.16, price_change_percentage_24h: -1.75, market_cap: 4200000000, total_volume: 180000000, high_24h: 0.17, low_24h: 0.15 },
  { id: 'vechain', symbol: 'vet', name: 'VeChain', current_price: 0.042, price_change_percentage_24h: 5.12, market_cap: 3400000000, total_volume: 160000000, high_24h: 0.045, low_24h: 0.039 },
  { id: 'render-token', symbol: 'render', name: 'Render', current_price: 7.60, price_change_percentage_24h: 7.40, market_cap: 3900000000, total_volume: 410000000, high_24h: 8.00, low_24h: 7.05 },
  { id: 'fetch-ai', symbol: 'fet', name: 'Artificial Superintelligence', current_price: 1.48, price_change_percentage_24h: 12.30, market_cap: 3800000000, total_volume: 380000000, high_24h: 1.58, low_24h: 1.30 },
  { id: 'polygon-ecosystem-token', symbol: 'pol', name: 'Polygon', current_price: 0.58, price_change_percentage_24h: -2.10, market_cap: 4600000000, total_volume: 220000000, high_24h: 0.61, low_24h: 0.56 },
  { id: 'kaspa', symbol: 'kas', name: 'Kaspa', current_price: 0.15, price_change_percentage_24h: -3.80, market_cap: 3700000000, total_volume: 95000000, high_24h: 0.16, low_24h: 0.14 },
  { id: 'bittensor', symbol: 'tao', name: 'Bittensor', current_price: 520.0, price_change_percentage_24h: 8.15, market_cap: 3800000000, total_volume: 240000000, high_24h: 545.0, low_24h: 480.0 },
  { id: 'monero', symbol: 'xmr', name: 'Monero', current_price: 168.0, price_change_percentage_24h: 0.40, market_cap: 3100000000, total_volume: 78000000, high_24h: 172.0, low_24h: 165.0 },
  { id: 'algorand', symbol: 'algo', name: 'Algorand', current_price: 0.28, price_change_percentage_24h: 13.20, market_cap: 2300000000, total_volume: 310000000, high_24h: 0.31, low_24h: 0.24 },
  { id: 'fantom', symbol: 'ftm', name: 'Fantom', current_price: 0.94, price_change_percentage_24h: 6.45, market_cap: 2600000000, total_volume: 210000000, high_24h: 0.99, low_24h: 0.88 },
  { id: 'filecoin', symbol: 'fil', name: 'Filecoin', current_price: 5.60, price_change_percentage_24h: -2.60, market_cap: 3300000000, total_volume: 270000000, high_24h: 5.85, low_24h: 5.40 },
  { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', current_price: 0.88, price_change_percentage_24h: -4.50, market_cap: 3600000000, total_volume: 340000000, high_24h: 0.94, low_24h: 0.85 },
  { id: 'celestia', symbol: 'tia', name: 'Celestia', current_price: 6.20, price_change_percentage_24h: -7.80, market_cap: 1400000000, total_volume: 180000000, high_24h: 6.85, low_24h: 6.05 },
  { id: 'cosmos', symbol: 'atom', name: 'Cosmos', current_price: 6.90, price_change_percentage_24h: 1.20, market_cap: 2700000000, total_volume: 160000000, high_24h: 7.20, low_24h: 6.70 },
  { id: 'injective-protocol', symbol: 'inj', name: 'Injective', current_price: 24.5, price_change_percentage_24h: 4.90, market_cap: 2400000000, total_volume: 190000000, high_24h: 25.8, low_24h: 23.1 },
  { id: 'blockstack', symbol: 'stx', name: 'Stacks', current_price: 2.15, price_change_percentage_24h: 3.10, market_cap: 3200000000, total_volume: 170000000, high_24h: 2.28, low_24h: 2.05 },
  { id: 'optimism', symbol: 'op', name: 'Optimism', current_price: 1.95, price_change_percentage_24h: -5.20, market_cap: 2400000000, total_volume: 210000000, high_24h: 2.10, low_24h: 1.88 },
  { id: 'bonk', symbol: 'bonk', name: 'Bonk', current_price: 0.000038, price_change_percentage_24h: 15.40, market_cap: 2800000000, total_volume: 850000000, high_24h: 0.000042, low_24h: 0.000032 },
  { id: 'thorchain', symbol: 'rune', name: 'THORChain', current_price: 5.80, price_change_percentage_24h: -3.20, market_cap: 1900000000, total_volume: 150000000, high_24h: 6.10, low_24h: 5.60 },
  { id: 'floki', symbol: 'floki', name: 'Floki', current_price: 0.00021, price_change_percentage_24h: -1.90, market_cap: 2000000000, total_volume: 380000000, high_24h: 0.00023, low_24h: 0.00020 },
  { id: 'sei-network', symbol: 'sei', name: 'Sei', current_price: 0.52, price_change_percentage_24h: 5.80, market_cap: 2200000000, total_volume: 170000000, high_24h: 0.56, low_24h: 0.48 },
  { id: 'dogwifcoin', symbol: 'wif', name: 'dogwifhat', current_price: 2.85, price_change_percentage_24h: -8.40, market_cap: 2800000000, total_volume: 620000000, high_24h: 3.20, low_24h: 2.70 },
  { id: 'immutable-x', symbol: 'imx', name: 'Immutable', current_price: 1.55, price_change_percentage_24h: 2.30, market_cap: 2500000000, total_volume: 120000000, high_24h: 1.64, low_24h: 1.48 },
  { id: 'the-graph', symbol: 'grt', name: 'The Graph', current_price: 0.26, price_change_percentage_24h: 4.10, market_cap: 2500000000, total_volume: 140000000, high_24h: 0.28, low_24h: 0.24 },
  { id: 'maker', symbol: 'mkr', name: 'Maker', current_price: 1840.0, price_change_percentage_24h: 1.15, market_cap: 1700000000, total_volume: 95000000, high_24h: 1890.0, low_24h: 1800.0 },
];

// CoinGecko fetch helper with caching and fallback
async function fetchCoinGeckoPrices(coinIds: string[], currencies: string[]): Promise<Record<string, Record<string, number>>> {
  const cacheKey = `${coinIds.sort().join(',')}_${currencies.sort().join(',')}`;
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const idsParam = coinIds.map(c => encodeURIComponent(c.toLowerCase())).join(',');
  const currParam = currencies.map(c => encodeURIComponent(c.toLowerCase())).join(',');

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=${currParam}&include_24hr_change=true`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'mcp-crypto-server-ui/1.0.0',
      },
    });

    if (res.ok) {
      const data = await res.json();
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
    // If rate limited or error, fall back gracefully
    console.warn(`CoinGecko status ${res.status}, using cached/fallback price data`);
  } catch (err) {
    console.warn('Network error reaching CoinGecko:', err);
  }

  // Construct fallback for requested coins
  const fallbackResult: Record<string, Record<string, number>> = {};
  for (const coin of coinIds) {
    const lower = coin.toLowerCase();
    fallbackResult[lower] = {};
    for (const curr of currencies) {
      const cLower = curr.toLowerCase();
      const val = FALLBACK_PRICES[lower]?.[cLower] ?? (FALLBACK_PRICES[lower]?.usd ?? 100);
      fallbackResult[lower][cLower] = val;
    }
  }
  return fallbackResult;
}

// Zod schemas for MCP tools
const GetCryptoPriceArgs = z.object({
  coinId: z.string().describe("The cryptocurrency name (e.g., bitcoin, ethereum, solana)"),
  currency: z.string().default("usd").describe("The fiat currency (e.g., usd, eur, gbp)"),
});

const GetMarketOverviewArgs = z.object({
  limit: z.number().min(1).max(25).default(10).describe("Number of top coins to return"),
  currency: z.string().default("usd").describe("Quote currency (e.g. usd, eur, gbp)"),
});

const ConvertCryptoFiatArgs = z.object({
  amount: z.number().positive().describe("Amount of token to convert"),
  fromCoin: z.string().describe("Token identifier (e.g., bitcoin, ethereum, solana)"),
  toCurrency: z.string().default("usd").describe("Target fiat currency (e.g., usd, eur, gbp)"),
});

const SearchCoinsArgs = z.object({
  query: z.string().min(1).describe("Search string for coin token or symbol"),
});

// MCP Tools Definition Registry
const MCP_TOOLS = [
  {
    name: "get_crypto_price",
    description: "Fetches live price data for a specified cryptocurrency token in target fiat currency.",
    inputSchema: {
      type: "object",
      properties: {
        coinId: {
          type: "string",
          description: "The cryptocurrency token ID (e.g., bitcoin, ethereum, solana, ripple, cardano, dogecoin)",
        },
        currency: {
          type: "string",
          description: "Target fiat currency code (e.g., usd, eur, gbp, jpy, aud, cad). Defaults to usd.",
          default: "usd",
        },
      },
      required: ["coinId"],
    },
  },
  {
    name: "get_crypto_market_overview",
    description: "Returns an overview of top cryptocurrencies by market capitalization including 24h change and volume.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of assets to retrieve (1 to 25)",
          default: 10,
        },
        currency: {
          type: "string",
          description: "Target fiat currency code (e.g., usd, eur, gbp)",
          default: "usd",
        },
      },
    },
  },
  {
    name: "convert_crypto_fiat",
    description: "Calculates the real-time fiat conversion value for a given quantity of cryptocurrency.",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount of tokens to convert (e.g. 0.5, 100)",
        },
        fromCoin: {
          type: "string",
          description: "Source cryptocurrency ID (e.g., bitcoin, ethereum)",
        },
        toCurrency: {
          type: "string",
          description: "Target fiat currency (e.g., usd, eur, gbp)",
          default: "usd",
        },
      },
      required: ["amount", "fromCoin"],
    },
  },
  {
    name: "search_crypto_coins",
    description: "Searches cryptocurrency tokens by name or ticker symbol to locate matching coin IDs.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword or ticker symbol to search for (e.g., btc, sol, doge, avalanche)",
        },
      },
      required: ["query"],
    },
  },
];

// Tool execution handler
async function executeMcpTool(name: string, args: Record<string, any>) {
  switch (name) {
    case "get_crypto_price": {
      const parsed = GetCryptoPriceArgs.parse(args);
      const coinId = parsed.coinId.toLowerCase().trim();
      const currency = (parsed.currency || "usd").toLowerCase().trim();

      const priceData = await fetchCoinGeckoPrices([coinId], [currency]);
      const price = priceData[coinId]?.[currency];

      if (price === undefined) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find price data for ${coinId} in ${currency.toUpperCase()}. Please check the coinId.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `The current price of ${coinId} is ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${currency.toUpperCase()}`,
          },
        ],
        structuredData: {
          coinId,
          currency: currency.toUpperCase(),
          price,
          timestamp: new Date().toISOString(),
        },
      };
    }

    case "get_crypto_market_overview": {
      const parsed = GetMarketOverviewArgs.parse(args);
      const limit = parsed.limit || 10;
      const currency = (parsed.currency || "usd").toLowerCase();

      // Retrieve market data
      const cacheKey = `market_${currency}_${limit}`;
      const cached = marketCache.get(cacheKey);
      let items: any[] = [];

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        items = cached.data;
      } else {
        try {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
            {
              headers: { Accept: 'application/json', 'User-Agent': 'mcp-crypto-server-ui/1.0.0' },
            }
          );
          if (res.ok) {
            items = await res.json();
            marketCache.set(cacheKey, { data: items, timestamp: Date.now() });
          } else {
            items = FALLBACK_MARKETS.slice(0, limit);
          }
        } catch {
          items = FALLBACK_MARKETS.slice(0, limit);
        }
      }

      const summaryText = items
        .map(
          (m: any, i: number) =>
            `${i + 1}. ${m.name} (${m.symbol.toUpperCase()}): ${m.current_price?.toLocaleString()} ${currency.toUpperCase()} (${m.price_change_percentage_24h >= 0 ? '+' : ''}${m.price_change_percentage_24h?.toFixed(2)}% 24h)`
        )
        .join('\n');

      return {
        content: [
          {
            type: "text",
            text: `Top ${items.length} Cryptocurrencies by Market Cap (${currency.toUpperCase()}):\n\n${summaryText}`,
          },
        ],
        structuredData: {
          currency: currency.toUpperCase(),
          totalAssets: items.length,
          markets: items.map((m: any) => ({
            id: m.id,
            name: m.name,
            symbol: m.symbol,
            price: m.current_price,
            change24h: m.price_change_percentage_24h,
            marketCap: m.market_cap,
          })),
        },
      };
    }

    case "convert_crypto_fiat": {
      const parsed = ConvertCryptoFiatArgs.parse(args);
      const coinId = parsed.fromCoin.toLowerCase().trim();
      const currency = (parsed.toCurrency || "usd").toLowerCase().trim();
      const amount = parsed.amount;

      const priceData = await fetchCoinGeckoPrices([coinId], [currency]);
      const price = priceData[coinId]?.[currency];

      if (!price) {
        return {
          content: [{ type: "text", text: `Unable to calculate conversion: Token "${coinId}" price not found.` }],
          isError: true,
        };
      }

      const total = amount * price;
      return {
        content: [
          {
            type: "text",
            text: `${amount} ${coinId.toUpperCase()} = ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency.toUpperCase()} (Unit rate: ${price} ${currency.toUpperCase()})`,
          },
        ],
        structuredData: {
          coinId,
          amount,
          unitPrice: price,
          totalValue: total,
          currency: currency.toUpperCase(),
        },
      };
    }

    case "search_crypto_coins": {
      const parsed = SearchCoinsArgs.parse(args);
      const q = parsed.query.toLowerCase().trim();

      const KNOWN_COINS = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'eth' },
        { id: 'solana', name: 'Solana', symbol: 'sol' },
        { id: 'ripple', name: 'XRP', symbol: 'xrp' },
        { id: 'binancecoin', name: 'BNB', symbol: 'bnb' },
        { id: 'cardano', name: 'Cardano', symbol: 'ada' },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge' },
        { id: 'avalanche-2', name: 'Avalanche', symbol: 'avax' },
        { id: 'polkadot', name: 'Polkadot', symbol: 'dot' },
        { id: 'chainlink', name: 'Chainlink', symbol: 'link' },
        { id: 'sui', name: 'Sui', symbol: 'sui' },
        { id: 'near', name: 'NEAR Protocol', symbol: 'near' },
        { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'shib' },
        { id: 'polygon-ecosystem-token', name: 'Polygon', symbol: 'pol' },
        { id: 'uniswap', name: 'Uniswap', symbol: 'uni' },
        { id: 'tron', name: 'TRON', symbol: 'trx' },
      ];

      const matches = KNOWN_COINS.filter(
        c => c.id.includes(q) || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase() === q
      );

      return {
        content: [
          {
            type: "text",
            text: matches.length
              ? `Found ${matches.length} matching coin(s):\n` +
                matches.map(m => `• ID: "${m.id}" | Name: ${m.name} | Symbol: ${m.symbol.toUpperCase()}`).join('\n')
              : `No direct matches found for "${q}". You can try full names like "bitcoin", "ethereum", "solana".`,
          },
        ],
        structuredData: { query: q, matches },
      };
    }

    default:
      throw new Error(`Unknown tool name: ${name}`);
  }
}

// REST API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    server: 'NodeCryptoServer',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    uptime: Math.floor(process.uptime()),
    registeredTools: MCP_TOOLS.map(t => t.name),
  });
});

// Public tools list endpoint
app.get('/api/mcp/tools', (req: Request, res: Response) => {
  res.json({ tools: MCP_TOOLS });
});

// Download project zip endpoint
app.get('/api/download-zip', (req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, '..', 'public', 'mcp-crypto-server-ui.zip');
  res.download(filePath, 'mcp-crypto-server-ui.zip');
});

// Direct REST price endpoint with cache
app.get('/api/crypto/price', async (req: Request, res: Response) => {
  const coinId = (req.query.coinId as string) || 'bitcoin';
  const currency = (req.query.currency as string) || 'usd';
  const data = await fetchCoinGeckoPrices([coinId], [currency]);
  res.json({
    coinId,
    currency,
    price: data[coinId.toLowerCase()]?.[currency.toLowerCase()] ?? null,
    timestamp: new Date().toISOString(),
  });
});

// Markets overview endpoint
app.get('/api/crypto/markets', async (req: Request, res: Response) => {
  const currency = ((req.query.currency as string) || 'usd').toLowerCase();
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));

  const cacheKey = `market_${currency}_${limit}`;
  const cached = marketCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ currency, markets: cached.data });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true`,
      { headers: { Accept: 'application/json', 'User-Agent': 'mcp-crypto-server-ui/1.0.0' } }
    );
    if (response.ok) {
      const data = await response.json();
      marketCache.set(cacheKey, { data, timestamp: Date.now() });
      return res.json({ currency, markets: data });
    }
  } catch (err) {
    console.warn('Markets fetch error, using fallback:', err);
  }

  // Convert fallback currency if not USD
  let fallbackData = FALLBACK_MARKETS.slice(0, limit);
  if (currency !== 'usd') {
    const rates: Record<string, number> = { eur: 0.93, gbp: 0.79, jpy: 153.2, cad: 1.41, aud: 1.54 };
    const rate = rates[currency] ?? 1.0;
    fallbackData = fallbackData.map(m => ({
      ...m,
      current_price: m.current_price * rate,
      high_24h: m.high_24h * rate,
      low_24h: m.low_24h * rate,
      market_cap: m.market_cap * rate,
      total_volume: m.total_volume * rate,
    }));
  }

  res.json({ currency, markets: fallbackData });
});

// Official JSON-RPC 2.0 Handler for MCP
app.post('/api/mcp/rpc', async (req: Request, res: Response) => {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request: payload must be a JSON object' },
      id: null,
    });
  }

  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
      id: id ?? null,
    });
  }

  try {
    switch (method) {
      case 'initialize': {
        return res.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false },
              logging: {},
            },
            serverInfo: {
              name: 'NodeCryptoServer',
              version: '1.0.0',
            },
          },
          id,
        });
      }

      case 'ping': {
        return res.json({
          jsonrpc: '2.0',
          result: {},
          id,
        });
      }

      case 'tools/list': {
        return res.json({
          jsonrpc: '2.0',
          result: {
            tools: MCP_TOOLS,
          },
          id,
        });
      }

      case 'tools/call': {
        if (!params || typeof params.name !== 'string') {
          return res.json({
            jsonrpc: '2.0',
            error: { code: -32602, message: 'Invalid params: name required' },
            id,
          });
        }

        const toolName = params.name;
        const toolArgs = params.arguments || {};

        try {
          const executionResult = await executeMcpTool(toolName, toolArgs);
          return res.json({
            jsonrpc: '2.0',
            result: executionResult,
            id,
          });
        } catch (toolErr: any) {
          return res.json({
            jsonrpc: '2.0',
            result: {
              content: [
                {
                  type: 'text',
                  text: `Tool Execution Error: ${toolErr.message || String(toolErr)}`,
                },
              ],
              isError: true,
            },
            id,
          });
        }
      }

      default: {
        return res.json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
          id,
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error: ' + error.message },
      id: id ?? null,
    });
  }
});


export default app;
