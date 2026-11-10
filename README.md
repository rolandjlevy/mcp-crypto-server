# MCP Crypto Server with UI Explorer

A Model Context Protocol (MCP) server built with Node.js, TypeScript, and React that pulls real-time cryptocurrency data and includes an interactive web dashboard, tool playground, live market matrix, and JSON-RPC protocol console.

See [live version](https://mcp-crypto-server-mqlf.vercel.app)

## Features
- **MCP Server Protocol**: Full implementation of MCP `2024-11-05` supporting `initialize`, `tools/list`, `tools/call`, and `ping`.
- **Dual Transports**:
  - **Stdio Transport**: Seamless integration with desktop AI hosts (Claude Desktop, Cursor, Windsurf).
  - **HTTP JSON-RPC Transport**: Web console, remote agents, and REST proxies.
- **Crypto Tool Suite**:
  - `get_crypto_price`: Fetches real-time cryptocurrency prices in any major fiat currency (USD, EUR, GBP, JPY, CAD, AUD).
  - `get_crypto_market_overview`: Ranks top cryptocurrencies by market capitalization with 24h change and volume.
  - `convert_crypto_fiat`: Real-time fiat valuation calculator.
  - `search_crypto_coins`: Fast token symbol lookup and ID resolution.
- **Interactive UI Playground**:
  - Live tool execution and schema validation.
  - Raw JSON-RPC request and response inspection with latency metrics.
  - Live market matrix with search and quick-inspect tool actions.
  - Client configuration generator for Claude Desktop and Cursor.

## Running the Server

### 1. Launching the Interactive Web Dashboard
```bash
npm run dev
# or
npm run ui
```
Navigate to `http://localhost:3000` to access the full UI testing console.

### 2. Testing via MCP Inspector (Host Debugging)
```bash
npx @modelcontextprotocol/inspector npm run mcp:stdio
```

### 3. Registering with Claude Desktop
Add this fragment to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "mcp-crypto-ui": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/src/mcp-server.ts"]
    }
  }
}
```

### 4. Direct CLI Execution (Stdio Mode)
```bash
npm run mcp:stdio
```
