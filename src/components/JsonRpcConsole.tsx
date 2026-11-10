import React, { useState } from 'react';
import { Send, Copy, Check, Clock, PlayCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { JsonRpcHistoryItem } from '../types';

interface JsonRpcConsoleProps {
  history: JsonRpcHistoryItem[];
  onAddHistory: (item: JsonRpcHistoryItem) => void;
  onClearHistory: () => void;
}

const TEMPLATES: Record<string, { label: string; payload: any }> = {
  get_crypto_price: {
    label: 'tools/call: get_crypto_price',
    payload: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_crypto_price',
        arguments: {
          coinId: 'bitcoin',
          currency: 'usd',
        },
      },
    },
  },
  tools_list: {
    label: 'tools/list (Discover Tools)',
    payload: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    },
  },
  initialize: {
    label: 'initialize (MCP Handshake)',
    payload: {
      jsonrpc: '2.0',
      id: 3,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'MCPWebConsole',
          version: '1.0.0',
        },
      },
    },
  },
  market_overview: {
    label: 'tools/call: get_crypto_market_overview',
    payload: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_crypto_market_overview',
        arguments: {
          limit: 5,
          currency: 'usd',
        },
      },
    },
  },
  convert_crypto: {
    label: 'tools/call: convert_crypto_fiat',
    payload: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'convert_crypto_fiat',
        arguments: {
          amount: 2.5,
          fromCoin: 'ethereum',
          toCurrency: 'usd',
        },
      },
    },
  },
  ping: {
    label: 'ping (Health Heartbeat)',
    payload: {
      jsonrpc: '2.0',
      id: 6,
      method: 'ping',
    },
  },
};

export const JsonRpcConsole: React.FC<JsonRpcConsoleProps> = ({
  history,
  onAddHistory,
  onClearHistory,
}) => {
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(TEMPLATES.get_crypto_price.payload, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleSelectTemplate = (key: string) => {
    const template = TEMPLATES[key];
    if (template) {
      setJsonInput(JSON.stringify(template.payload, null, 2));
      setSyntaxError(null);
    }
  };

  const handleSendRpc = async () => {
    setSyntaxError(null);
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(jsonInput);
    } catch (err: any) {
      setSyntaxError(`Invalid JSON syntax: ${err.message}`);
      return;
    }

    setIsExecuting(true);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/mcp/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBody),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);
      setExecutionTimeMs(duration);
      setResponseOutput(data);

      onAddHistory({
        id: parsedBody.id || Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        method: parsedBody.method || 'unknown',
        durationMs: duration,
        request: parsedBody,
        response: data,
        isError: Boolean(data.error || data.result?.isError),
      });
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setExecutionTimeMs(duration);
      const errResponse = {
        jsonrpc: '2.0',
        id: parsedBody?.id ?? null,
        error: { code: -32000, message: err.message || 'Fetch error' },
      };
      setResponseOutput(errResponse);
      onAddHistory({
        id: parsedBody.id || Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        method: parsedBody.method || 'unknown',
        durationMs: duration,
        request: parsedBody,
        response: errResponse,
        isError: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          JSON-RPC 2.0 Live Protocol Console
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Inspect low-level Model Context Protocol requests and responses dispatched between LLMs and this server.
        </p>
      </div>

      {/* Preset RPC Template Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Load Preset Request:</span>
        {Object.entries(TEMPLATES).map(([key, item]) => (
          <button
            key={key}
            onClick={() => handleSelectTemplate(key)}
            className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Editor & Response Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Request Payload Editor */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200">
              Request Payload (JSON-RPC 2.0)
            </span>
            <span className="text-[11px] font-mono text-indigo-400">POST /api/mcp/rpc</span>
          </div>

          <textarea
            value={jsonInput}
            onChange={e => {
              setJsonInput(e.target.value);
              setSyntaxError(null);
            }}
            rows={12}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 selection:bg-indigo-900"
            spellCheck={false}
          />

          {syntaxError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{syntaxError}</span>
            </div>
          )}

          <button
            onClick={handleSendRpc}
            disabled={isExecuting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm shadow-indigo-950"
          >
            <Send className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Sending RPC Request...' : 'Send JSON-RPC Request'}</span>
          </button>
        </div>

        {/* Response Viewer */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200">
              Server Response
            </span>
            <div className="flex items-center gap-3">
              {executionTimeMs !== null && (
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  Roundtrip: <span className="text-emerald-400">{executionTimeMs}ms</span>
                </span>
              )}
              <button
                onClick={handleCopyResponse}
                disabled={!responseOutput}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto min-h-[290px] max-h-[380px]">
            {responseOutput
              ? JSON.stringify(responseOutput, null, 2)
              : '// Response will appear here after sending request...'}
          </pre>
        </div>
      </div>

      {/* Execution History */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-200">Recent Session Request Log</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No requests executed yet in this session.
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-800/60 font-mono text-xs">
            {history.slice(0, 10).map((item, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {item.isError ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-semibold text-white">{item.method}</span>
                  <span className="text-slate-500">[{item.timestamp}]</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 tabular-nums">{item.durationMs}ms</span>
                  <button
                    onClick={() => {
                      setJsonInput(JSON.stringify(item.request, null, 2));
                      setResponseOutput(item.response);
                      setExecutionTimeMs(item.durationMs);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-sans text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Load</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
