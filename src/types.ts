export interface McpToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description?: string;
      default?: any;
    }>;
    required?: string[];
  };
}

export interface McpServerInfo {
  status: string;
  server: string;
  version: string;
  protocolVersion: string;
  uptime: number;
  registeredTools: string[];
}

export interface CryptoMarketItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h?: number;
  low_24h?: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface JsonRpcHistoryItem {
  id: string | number;
  timestamp: string;
  method: string;
  durationMs: number;
  request: any;
  response: any;
  isError: boolean;
}
