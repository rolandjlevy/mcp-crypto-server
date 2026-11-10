import React from 'react';
import { Terminal, Activity, Check, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'playground' | 'markets' | 'jsonrpc' | 'config' | 'docs';
  setActiveTab: (tab: 'playground' | 'markets' | 'jsonrpc' | 'config' | 'docs') => void;
  serverStatus: 'online' | 'connecting' | 'offline';
  onPing: () => void;
  pinging: boolean;
  copiedConfig: boolean;
  onCopyQuickConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  serverStatus,
  onPing,
  pinging,
  copiedConfig,
  onCopyQuickConfig,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            MCP Crypto Server
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('playground')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'playground'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tool Playground
          </button>
          <button
            onClick={() => setActiveTab('markets')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'markets'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Markets
          </button>
          <button
            onClick={() => setActiveTab('jsonrpc')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'jsonrpc'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON-RPC Console
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'config'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Client Config
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'docs'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/api/download-zip"
            download="mcp-crypto-server-ui.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Download full project as .zip file"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Download ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </a>
          <button
            onClick={onPing}
            disabled={pinging}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            title="Send JSON-RPC ping to server"
          >
            <Activity className={`w-3.5 h-3.5 ${pinging ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span>{pinging ? 'Pinging...' : 'Ping'}</span>
          </button>
          <button
            onClick={onCopyQuickConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm shadow-indigo-950"
          >
            {copiedConfig ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied</span>
              </>
            ) : (
              <span>Claude Config</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 overflow-x-auto text-xs font-medium gap-4">
        <button
          onClick={() => setActiveTab('playground')}
          className={`whitespace-nowrap py-1 ${activeTab === 'playground' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Tool Playground
        </button>
        <button
          onClick={() => setActiveTab('markets')}
          className={`whitespace-nowrap py-1 ${activeTab === 'markets' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Markets
        </button>
        <button
          onClick={() => setActiveTab('jsonrpc')}
          className={`whitespace-nowrap py-1 ${activeTab === 'jsonrpc' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          JSON-RPC
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`whitespace-nowrap py-1 ${activeTab === 'config' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Configs
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`whitespace-nowrap py-1 ${activeTab === 'docs' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
