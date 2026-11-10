import React from 'react';
import { Layers, ShieldCheck, Zap, GitBranch } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Architecture & Model Context Protocol Specifications
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Technical specifications for the crypto tool suite, JSON-RPC 2.0 communication pipeline, and API reliability design.
        </p>
      </div>

      {/* 3 Core Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/40">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Model Context Protocol</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standardized open specification enabling foundation models (Claude, Gemini, GPT) to securely discover and invoke external tools with verified schemas.
          </p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/40">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Dual Transport Modes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supports both standard Stdio transport for local desktop LLMs (Claude Desktop, Cursor) and HTTP JSON-RPC 2.0 endpoints for web consoles and distributed agents.
          </p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-950 flex items-center justify-center text-sky-400 border border-sky-800/40">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Rate-Limit Resilience</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Equipped with 30-second in-memory caching and seamless fallback matrices to prevent CoinGecko 429 rate limit errors during aggressive agent querying.
          </p>
        </div>
      </div>

      {/* Protocol Lifecycle Diagram */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">01. MCP Execution Flow Lifecycle</h3>
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-3 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold shrink-0">STEP 1</span>
            <div>
              <span className="text-white font-semibold">Client Handshake:</span> LLM client dispatches <code className="text-amber-300">initialize</code> request with protocol version <code className="text-slate-300">&quot;2024-11-05&quot;</code>.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold shrink-0">STEP 2</span>
            <div>
              <span className="text-white font-semibold">Tool Discovery:</span> Client calls <code className="text-amber-300">tools/list</code> to fetch JSON Schema signatures for all registered crypto tools.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold shrink-0">STEP 3</span>
            <div>
              <span className="text-white font-semibold">Model Reasoning:</span> The foundation model inspects user intent, selects <code className="text-amber-300">get_crypto_price</code>, and formats input arguments: <code className="text-slate-300">&#123; coinId: &quot;bitcoin&quot;, currency: &quot;usd&quot; &#125;</code>.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold shrink-0">STEP 4</span>
            <div>
              <span className="text-white font-semibold">Server Execution:</span> MCP server validates arguments via Zod schema, fetches or pulls from cache, and returns formatted content blocks.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold shrink-0">STEP 5</span>
            <div>
              <span className="text-white font-semibold">Model Response:</span> The agent embeds the returned real-time price into its final response to the user.
            </div>
          </div>
        </div>
      </div>

      {/* Registered Tools Reference Table */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">02. Registered Tool Suite</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Tool Name</th>
                <th className="py-2.5 px-3 font-semibold">Arguments</th>
                <th className="py-2.5 px-3 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-indigo-400 font-semibold">get_crypto_price</td>
                <td className="py-2.5 px-3 text-slate-300">coinId: string, currency: string = &quot;usd&quot;</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Single asset price lookup in specified fiat</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-indigo-400 font-semibold">get_crypto_market_overview</td>
                <td className="py-2.5 px-3 text-slate-300">limit: number = 10, currency: string = &quot;usd&quot;</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Ranked market list with 24h metrics</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-indigo-400 font-semibold">convert_crypto_fiat</td>
                <td className="py-2.5 px-3 text-slate-300">amount: number, fromCoin: string, toCurrency: string</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Real-time fiat value calculation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-indigo-400 font-semibold">search_crypto_coins</td>
                <td className="py-2.5 px-3 text-slate-300">query: string</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Resolves token symbols to valid CoinGecko IDs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
