import React, { useState } from 'react';
import { Play, Copy, Check, RotateCcw, Code, Sparkles, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { McpToolSchema } from '../types';

interface ToolPlaygroundProps {
  initialCoinId?: string;
  initialCurrency?: string;
  onViewHistory?: () => void;
  onToolExecuted?: (historyItem: any) => void;
}

const REGISTERED_TOOLS: McpToolSchema[] = [
  {
    name: 'get_crypto_price',
    description: 'Fetches live price data for a specified cryptocurrency token in target fiat currency.',
    inputSchema: {
      type: 'object',
      properties: {
        coinId: {
          type: 'string',
          description: 'The cryptocurrency token ID (e.g., bitcoin, ethereum, solana, ripple, dogecoin)',
        },
        currency: {
          type: 'string',
          description: 'Target fiat currency code (e.g., usd, eur, gbp, jpy, cad, aud). Defaults to usd.',
          default: 'usd',
        },
      },
      required: ['coinId'],
    },
  },
  {
    name: 'get_crypto_market_overview',
    description: 'Returns an overview of top cryptocurrencies by market capitalization including 24h change and volume.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of assets to retrieve (1 to 25)',
          default: 10,
        },
        currency: {
          type: 'string',
          description: 'Target fiat currency code (e.g., usd, eur, gbp)',
          default: 'usd',
        },
      },
    },
  },
  {
    name: 'convert_crypto_fiat',
    description: 'Calculates the real-time fiat conversion value for a given quantity of cryptocurrency.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'The amount of tokens to convert (e.g. 0.5, 100)',
        },
        fromCoin: {
          type: 'string',
          description: 'Source cryptocurrency ID (e.g., bitcoin, ethereum)',
        },
        toCurrency: {
          type: 'string',
          description: 'Target fiat currency (e.g., usd, eur, gbp)',
          default: 'usd',
        },
      },
      required: ['amount', 'fromCoin'],
    },
  },
  {
    name: 'search_crypto_coins',
    description: 'Searches cryptocurrency tokens by name or ticker symbol to locate matching coin IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or ticker symbol to search for (e.g., btc, sol, doge, avalanche)',
        },
      },
      required: ['query'],
    },
  },
];

const PRESET_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
];

const FIAT_CURRENCIES = [
  { code: 'usd', symbol: '$', name: 'USD' },
  { code: 'eur', symbol: '€', name: 'EUR' },
  { code: 'gbp', symbol: '£', name: 'GBP' },
  { code: 'jpy', symbol: '¥', name: 'JPY' },
  { code: 'cad', symbol: 'CA$', name: 'CAD' },
  { code: 'aud', symbol: 'AU$', name: 'AUD' },
];

export const ToolPlayground: React.FC<ToolPlaygroundProps> = ({
  initialCoinId = 'bitcoin',
  initialCurrency = 'usd',
  onToolExecuted,
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('get_crypto_price');

  // Parameters
  const [coinId, setCoinId] = useState<string>(initialCoinId);
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [amount, setAmount] = useState<number>(1);
  const [marketLimit, setMarketLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('sol');

  // Execution states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [rpcRequestPayload, setRpcRequestPayload] = useState<any>(null);
  const [rpcResponsePayload, setRpcResponsePayload] = useState<any>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeToolDef = REGISTERED_TOOLS.find(t => t.name === selectedTool) || REGISTERED_TOOLS[0];

  const handleExecute = async (mode: 'live' | 'simulated') => {
    setIsLoading(true);
    setErrorMessage(null);
    const startTime = performance.now();
    const requestId = Math.floor(Math.random() * 10000) + 1;

    let args: Record<string, any> = {};
    if (selectedTool === 'get_crypto_price') {
      args = { coinId: coinId.trim().toLowerCase(), currency };
    } else if (selectedTool === 'get_crypto_market_overview') {
      args = { limit: Number(marketLimit), currency };
    } else if (selectedTool === 'convert_crypto_fiat') {
      args = { amount: Number(amount), fromCoin: coinId.trim().toLowerCase(), toCurrency: currency };
    } else if (selectedTool === 'search_crypto_coins') {
      args = { query: searchQuery.trim().toLowerCase() };
    }

    const requestPayload = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: selectedTool,
        arguments: args,
      },
    };
    setRpcRequestPayload(requestPayload);

    try {
      if (mode === 'live') {
        const res = await fetch('/api/mcp/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        setExecutionTimeMs(duration);
        setRpcResponsePayload(data);

        if (data.error) {
          setErrorMessage(data.error.message || 'JSON-RPC Execution error');
        } else {
          setExecutionResult(data.result);
        }

        onToolExecuted?.({
          id: requestId,
          timestamp: new Date().toLocaleTimeString(),
          method: `tools/call (${selectedTool})`,
          durationMs: duration,
          request: requestPayload,
          response: data,
          isError: Boolean(data.error || data.result?.isError),
        });
      } else {
        // Direct browser simulation matching user's original index.ts HTML script
        const coin = coinId.trim().toLowerCase();
        const fiat = currency.toLowerCase();
        let simulatedText = '';

        if (selectedTool === 'get_crypto_price') {
          const fetchUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${fiat}`;
          const res = await fetch(fetchUrl);
          const data = await res.json();
          const price = data[coin]?.[fiat];

          if (!price) {
            throw new Error(`Token "${coin}" price not found in CoinGecko API.`);
          }
          simulatedText = `The current price of ${coin} is ${price} ${fiat.toUpperCase()}`;
        } else {
          simulatedText = `Executed simulated ${selectedTool} for token: ${coin}`;
        }

        const duration = Math.round(performance.now() - startTime);
        setExecutionTimeMs(duration);

        const simulatedResponse = {
          jsonrpc: '2.0',
          id: requestId,
          result: {
            content: [{ type: 'text', text: simulatedText }],
          },
        };
        setRpcResponsePayload(simulatedResponse);
        setExecutionResult(simulatedResponse.result);

        onToolExecuted?.({
          id: requestId,
          timestamp: new Date().toLocaleTimeString(),
          method: `simulation (${selectedTool})`,
          durationMs: duration,
          request: requestPayload,
          response: simulatedResponse,
          isError: false,
        });
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setExecutionTimeMs(duration);
      setErrorMessage(err.message || 'Execution failed');
      const errPayload = {
        jsonrpc: '2.0',
        id: requestId,
        error: { code: -32000, message: err.message || 'Network failure' },
      };
      setRpcResponsePayload(errPayload);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRpc = () => {
    if (!rpcResponsePayload) return;
    navigator.clipboard.writeText(JSON.stringify(rpcResponsePayload, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setCoinId('bitcoin');
    setCurrency('usd');
    setAmount(1);
    setMarketLimit(10);
    setSearchQuery('sol');
    setExecutionResult(null);
    setRpcRequestPayload(null);
    setRpcResponsePayload(null);
    setExecutionTimeMs(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      {/* Tool Selection Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              MCP Tool Execution Playground
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Simulate and execute real Model Context Protocol JSON-RPC tool calls against live crypto data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Interactive segmented tool picker (functional buttons) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          {REGISTERED_TOOLS.map(tool => {
            const isSelected = selectedTool === tool.name;
            return (
              <button
                key={tool.name}
                onClick={() => {
                  setSelectedTool(tool.name);
                  setExecutionResult(null);
                  setErrorMessage(null);
                }}
                className={`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="font-mono text-xs font-semibold truncate">{tool.name}</div>
                <div className="text-[11px] text-slate-300/80 truncate mt-0.5">
                  {tool.name === 'get_crypto_price'
                    ? 'Single asset price lookup'
                    : tool.name === 'get_crypto_market_overview'
                    ? 'Top tokens market ranking'
                    : tool.name === 'convert_crypto_fiat'
                    ? 'Pair conversion calculator'
                    : 'Search coin ID registry'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Execution Split View: Left (Parameters) & Right (Inspector Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tool Configuration Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Input Parameters</span>
              <p className="text-xs text-slate-400 mt-0.5">{activeToolDef.description}</p>
            </div>
            <span className="font-mono text-xs text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              MCP Tool
            </span>
          </div>

          {/* Form Fields according to active tool */}
          {selectedTool === 'get_crypto_price' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cryptocurrency Token ID (<span className="text-indigo-400 font-mono">coinId</span>)
                </label>
                <input
                  type="text"
                  value={coinId}
                  onChange={e => setCoinId(e.target.value)}
                  placeholder="e.g. bitcoin, ethereum, solana"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
                  {PRESET_COINS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCoinId(c.id)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        coinId === c.id
                          ? 'bg-indigo-950/80 border-indigo-600 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quote Fiat Currency (<span className="text-indigo-400 font-mono">currency</span>)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FIAT_CURRENCIES.map(f => (
                    <button
                      key={f.code}
                      type="button"
                      onClick={() => setCurrency(f.code)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                        currency === f.code
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-white">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'get_crypto_market_overview' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Asset Limit (<span className="text-indigo-400 font-mono">limit</span>)
                </label>
                <select
                  value={marketLimit}
                  onChange={e => setMarketLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={5}>Top 5 Coins</option>
                  <option value={10}>Top 10 Coins (Default)</option>
                  <option value={15}>Top 15 Coins</option>
                  <option value={20}>Top 20 Coins</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quote Currency (<span className="text-indigo-400 font-mono">currency</span>)
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {FIAT_CURRENCIES.map(f => (
                    <option key={f.code} value={f.code}>
                      {f.name} ({f.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedTool === 'convert_crypto_fiat' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Token Amount (<span className="text-indigo-400 font-mono">amount</span>)
                </label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Source Token ID (<span className="text-indigo-400 font-mono">fromCoin</span>)
                </label>
                <input
                  type="text"
                  value={coinId}
                  onChange={e => setCoinId(e.target.value)}
                  placeholder="e.g. bitcoin, ethereum"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Fiat (<span className="text-indigo-400 font-mono">toCurrency</span>)
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {FIAT_CURRENCIES.map(f => (
                    <option key={f.code} value={f.code}>
                      {f.name} ({f.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedTool === 'search_crypto_coins' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Search Query (<span className="text-indigo-400 font-mono">query</span>)
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. sol, btc, avax, chainlink"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Action Execution Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleExecute('live')}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm shadow-indigo-950"
            >
              <Play className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Executing MCP Tool...' : 'Execute JSON-RPC Tool Call'}</span>
            </button>

            <button
              onClick={() => handleExecute('simulated')}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Run Browser Simulated Call</span>
            </button>
          </div>

          {/* Schema Quick Reference */}
          <div className="pt-3 border-t border-slate-800">
            <details className="text-xs text-slate-400 cursor-pointer group">
              <summary className="font-medium text-slate-300 group-hover:text-white transition-colors">
                View Tool Schema Definition (JSON Schema)
              </summary>
              <pre className="mt-2 p-2.5 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 overflow-x-auto">
                {JSON.stringify(activeToolDef.inputSchema, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* Right Column: Inspector Output (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Primary Result Preview Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Execution Result & Tool Content</span>
              </div>
              {executionTimeMs !== null && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                  <span>Latency:</span>
                  <span className="text-emerald-400">{executionTimeMs}ms</span>
                </div>
              )}
            </div>

            {errorMessage ? (
              <div className="mt-4 p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <div className="text-sm font-semibold">Tool Execution Failure</div>
                  <div className="text-xs mt-1 text-rose-300/80">{errorMessage}</div>
                </div>
              </div>
            ) : executionResult ? (
              <div className="mt-4 space-y-4">
                {/* Visual Highlight banner */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Model Context Protocol Output Text</div>
                  <div className="text-base sm:text-lg font-semibold text-white mt-1 whitespace-pre-wrap leading-relaxed">
                    {executionResult.content?.[0]?.text || 'No text content returned'}
                  </div>
                </div>

                {/* Structured Breakdown if available */}
                {executionResult.structuredData && (
                  <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/60 text-xs space-y-2">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Parsed Structured Payload
                    </span>
                    <pre className="text-emerald-400 font-mono text-xs overflow-x-auto">
                      {JSON.stringify(executionResult.structuredData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ArrowRightLeft className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-medium text-slate-400">Ready to execute tool call</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select parameters on the left and click &quot;Execute JSON-RPC Tool Call&quot; to inspect real live responses.
                </p>
              </div>
            )}
          </div>

          {/* Raw JSON-RPC Protocol Inspection */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Raw JSON-RPC 2.0 Inspection</span>
              <button
                onClick={handleCopyRpc}
                disabled={!rpcResponsePayload}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied' : 'Copy Response'}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Client Request Payload</span>
                  <span className="text-indigo-400">method: tools/call</span>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 border border-slate-800/80 overflow-x-auto max-h-64 leading-tight">
                  {rpcRequestPayload
                    ? JSON.stringify(rpcRequestPayload, null, 2)
                    : '// Click execute to generate client request'}
                </pre>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Server Response Payload</span>
                  <span className={rpcResponsePayload?.error ? 'text-rose-400' : 'text-emerald-400'}>
                    {rpcResponsePayload?.error ? 'Status: Error' : rpcResponsePayload ? 'Status: 200 OK' : 'Idle'}
                  </span>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800/80 overflow-x-auto max-h-64 leading-tight">
                  {rpcResponsePayload
                    ? JSON.stringify(rpcResponsePayload, null, 2)
                    : '// Results will output here...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
