import React from 'react';
import { McpServerInfo } from '../types';

interface ServerStatusBarProps {
  serverInfo: McpServerInfo | null;
  latencyMs: number | null;
  serverStatus: 'online' | 'connecting' | 'offline';
  onRefreshStatus: () => void;
}

export const ServerStatusBar: React.FC<ServerStatusBarProps> = ({
  serverInfo,
  latencyMs,
  serverStatus,
  onRefreshStatus,
}) => {
  return (
    <div className="border-b border-slate-800/60 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs text-slate-400">
        {/* Left unboxed metadata sequence */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'online'
                  ? 'bg-emerald-500'
                  : serverStatus === 'connecting'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span>{serverStatus === 'online' ? 'Server Active' : serverStatus === 'connecting' ? 'Connecting' : 'Offline'}</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>NodeCryptoServer v1.0.0</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Protocol MCP 2024-11-05</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>4 Registered Tools</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Transport: Stdio / HTTP RPC</span>
        </div>

        {/* Right metrics and refresh trigger */}
        <div className="flex items-center gap-4 text-slate-400">
          {latencyMs !== null && (
            <div className="font-mono tabular-nums">
              <span>Ping </span>
              <span className="text-emerald-400">{latencyMs}ms</span>
            </div>
          )}
          {serverInfo && (
            <div className="hidden sm:inline font-mono tabular-nums">
              <span>Uptime </span>
              <span className="text-slate-300">{serverInfo.uptime}s</span>
            </div>
          )}
          <button
            onClick={onRefreshStatus}
            className="hover:text-slate-200 transition-colors cursor-pointer underline underline-offset-4 decoration-slate-700"
          >
            Refresh Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
