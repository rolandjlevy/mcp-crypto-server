import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, Cpu, FileText, CheckCircle2, Download, Package } from 'lucide-react';

export const ClientConfig: React.FC = () => {
  const [activeClient, setActiveClient] = useState<'claude' | 'cursor' | 'windsurf' | 'node' | 'cli'>('claude');
  const [customPath, setCustomPath] = useState<string>('/path/to/mcp-crypto-server-ui/src/mcp-server.ts');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        'mcp-crypto-ui': {
          command: 'npx',
          args: ['tsx', customPath],
        },
      },
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        'mcp-crypto-server': {
          command: 'npx',
          args: ['-y', 'tsx', customPath],
        },
      },
    },
    null,
    2
  );

  const windsurfConfig = JSON.stringify(
    {
      mcpServers: {
        crypto: {
          command: 'tsx',
          args: [customPath],
          env: {},
        },
      },
    },
    null,
    2
  );

  const nodeClientSnippet = `import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "${customPath}"],
});

const client = new Client({ name: "MyClient", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

// List registered tools
const tools = await client.listTools();
console.log("Available tools:", tools.tools.map(t => t.name));

// Call get_crypto_price
const result = await client.callTool({
  name: "get_crypto_price",
  arguments: { coinId: "bitcoin", currency: "usd" }
});
console.log(result.content[0].text);`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Client Integration & Setup Configurations
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Connect this MCP server to Claude Desktop, Cursor, Windsurf, or custom AI agent pipelines.
        </p>
      </div>

      {/* Direct Project Zip Download Card */}
      <div className="p-4 bg-slate-900/80 border border-indigo-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Full Project Archive</span>
              <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                mcp-crypto-server-ui.zip
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Includes all source files: MCP server, React UI dashboard, package.json, tsconfig.json, and documentation.
            </p>
          </div>
        </div>
        <a
          href="/api/download-zip"
          download="mcp-crypto-server-ui.zip"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm shadow-indigo-950"
        >
          <Download className="w-4 h-4" />
          <span>Download Zip Archive</span>
        </a>
      </div>

      {/* Path Customizer */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Local Absolute Path to <code className="text-indigo-400 font-mono">src/mcp-server.ts</code>
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={customPath}
            onChange={e => setCustomPath(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            placeholder="/Users/username/Desktop/mcp-crypto-server-ui/src/mcp-server.ts"
          />
          <button
            onClick={() => setCustomPath('/absolute/path/to/src/mcp-server.ts')}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset Path
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Tip: In terminal, run <code className="font-mono text-slate-400">pwd</code> inside this project directory to get your exact absolute path.
        </p>
      </div>

      {/* Client Target Tabs (Segmented control) */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
        {[
          { id: 'claude', label: 'Claude Desktop' },
          { id: 'cursor', label: 'Cursor IDE' },
          { id: 'windsurf', label: 'Windsurf / Cline' },
          { id: 'node', label: 'Node.js Client SDK' },
          { id: 'cli', label: 'CLI & Inspector' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveClient(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeClient === tab.id
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Target Content Panel */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        {activeClient === 'claude' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Claude Desktop Configuration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste this into your <code className="font-mono text-slate-300">claude_desktop_config.json</code> file.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(claudeConfig, 'claude')}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'claude' ? 'Copied' : 'Copy Configuration'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              {claudeConfig}
            </pre>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="font-semibold text-slate-300">File location paths:</div>
              <div className="font-mono text-[11px] space-y-1">
                <div><span className="text-slate-500">macOS:</span> ~/Library/Application Support/Claude/claude_desktop_config.json</div>
                <div><span className="text-slate-500">Windows:</span> %APPDATA%\Claude\claude_desktop_config.json</div>
              </div>
            </div>
          </div>
        )}

        {activeClient === 'cursor' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Cursor MCP Configuration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste into your workspace&apos;s <code className="font-mono text-slate-300">.cursor/mcp.json</code> or add via Cursor Settings → Features → MCP.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(cursorConfig, 'cursor')}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                {copiedKey === 'cursor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cursor' ? 'Copied' : 'Copy Cursor Config'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              {cursorConfig}
            </pre>
          </div>
        )}

        {activeClient === 'windsurf' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Windsurf / Cline Integration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure inside <code className="font-mono text-slate-300">~/.codeium/windsurf/mcp_config.json</code>.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(windsurfConfig, 'windsurf')}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                {copiedKey === 'windsurf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'windsurf' ? 'Copied' : 'Copy Config'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              {windsurfConfig}
            </pre>
          </div>
        )}

        {activeClient === 'node' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Programmatic Node.js Client</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Use the official <code className="font-mono text-slate-300">@modelcontextprotocol/sdk</code> to spawn and invoke tools programmatically.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(nodeClientSnippet, 'node')}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                {copiedKey === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'node' ? 'Copied' : 'Copy Node Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {nodeClientSnippet}
            </pre>
          </div>
        )}

        {activeClient === 'cli' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white pb-3 border-b border-slate-800">
              Terminal Execution & MCP Inspector Commands
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">1. Launch the interactive browser UI dashboard:</div>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-emerald-400">npm run ui</code>
                  <button
                    onClick={() => copyToClipboard('npm run ui', 'cmd1')}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'cmd1' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">2. Run official Anthropic MCP Inspector on Stdio transport:</div>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-emerald-400">npx @modelcontextprotocol/inspector npm run mcp:stdio</code>
                  <button
                    onClick={() => copyToClipboard('npx @modelcontextprotocol/inspector npm run mcp:stdio', 'cmd2')}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'cmd2' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">3. Run standalone Stdio server for AI clients:</div>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-emerald-400">npm run mcp:stdio</code>
                  <button
                    onClick={() => copyToClipboard('npm run mcp:stdio', 'cmd3')}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'cmd3' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
