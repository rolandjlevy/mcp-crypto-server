import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ServerStatusBar } from './components/ServerStatusBar';
import { ToolPlayground } from './components/ToolPlayground';
import { MarketMatrix } from './components/MarketMatrix';
import { JsonRpcConsole } from './components/JsonRpcConsole';
import { ClientConfig } from './components/ClientConfig';
import { Documentation } from './components/Documentation';
import { McpServerInfo, JsonRpcHistoryItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'playground' | 'markets' | 'jsonrpc' | 'config' | 'docs'>('playground');
  const [serverStatus, setServerStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');
  const [serverInfo, setServerInfo] = useState<McpServerInfo | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [pinging, setPinging] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  // Cross-component coordination
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('usd');

  // JSON-RPC Session History
  const [rpcHistory, setRpcHistory] = useState<JsonRpcHistoryItem[]>([]);

  const checkHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const info = await res.json();
        const duration = Math.round(performance.now() - start);
        setServerInfo(info);
        setLatencyMs(duration);
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handlePing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/mcp/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.floor(Math.random() * 1000),
          method: 'ping',
        }),
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      if (data.result !== undefined) {
        setServerStatus('online');
      }
    } catch {
      setServerStatus('offline');
    } finally {
      setPinging(false);
    }
  };

  const handleCopyQuickConfig = () => {
    const config = JSON.stringify(
      {
        mcpServers: {
          'mcp-crypto-ui': {
            command: 'npx',
            args: ['tsx', '/absolute/path/to/src/mcp-server.ts'],
          },
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleSelectCoinFromMarket = (coinId: string, currency: string) => {
    setSelectedCoinId(coinId);
    setSelectedCurrency(currency);
    setActiveTab('playground');
  };

  const handleToolExecuted = (historyItem: JsonRpcHistoryItem) => {
    setRpcHistory(prev => [historyItem, ...prev.slice(0, 19)]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        onPing={handlePing}
        pinging={pinging}
        copiedConfig={copiedConfig}
        onCopyQuickConfig={handleCopyQuickConfig}
      />

      {/* Unboxed Metadata & Diagnostics Bar */}
      <ServerStatusBar
        serverInfo={serverInfo}
        latencyMs={latencyMs}
        serverStatus={serverStatus}
        onRefreshStatus={checkHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playground' && (
          <ToolPlayground
            initialCoinId={selectedCoinId}
            initialCurrency={selectedCurrency}
            onToolExecuted={handleToolExecuted}
          />
        )}

        {activeTab === 'markets' && (
          <MarketMatrix onSelectCoinForTool={handleSelectCoinFromMarket} />
        )}

        {activeTab === 'jsonrpc' && (
          <JsonRpcConsole
            history={rpcHistory}
            onAddHistory={handleToolExecuted}
            onClearHistory={() => setRpcHistory([])}
          />
        )}

        {activeTab === 'config' && <ClientConfig />}

        {activeTab === 'docs' && <Documentation />}
      </main>

      {/* Clean Unboxed Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">MCP Crypto Server</span>
            <span aria-hidden="true">·</span>
            <span>Model Context Protocol v2024-11-05</span>
            <span aria-hidden="true">·</span>
            <span>CoinGecko API Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('docs')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Protocol Specs
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Client Configs
            </button>
            <button
              onClick={() => setActiveTab('jsonrpc')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              RPC Console
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
