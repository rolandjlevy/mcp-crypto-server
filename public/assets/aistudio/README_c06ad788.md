# MCP Crypto Server with UI Demo

A Model Context Protocol (MCP) server built with Node.js and TypeScript that pulls real-time crypto prices and includes a custom local UI testing dashboard.

## File Contents
- `package.json`: System project configuration, dependencies, and target runtime execution scripts.
- `tsconfig.json`: Pre-configured environment details compilation matrix targets for ESM engines.
- `src/index.ts`: Unified logic engine housing standard pipeline transports, Zod type structures, and the optional dashboard payload.

## Installation
Unzip the files, open your terminal inside this directory, and install dependencies:
```bash
npm install
```

## Running the Server

### 1. Launching the UI Frontend Dashboard
To run the interactive browser frontend on port `3000`:
```bash
npm run ui
```
Then navigate to `http://localhost:3000` in your web browser.

### 2. Testing via the MCP Inspector (Recommended for Host Debugging)
To debug and monitor the JSON-RPC interface using the official tool context web viewer:
```bash
npx @modelcontextprotocol/inspector npm start
```

### 3. Registering with Claude Desktop
Add this fragment to your `claude_desktop_config.json` configurations file block to see it work with actual live client prompting paths:
```json
{
  "mcpServers": {
    "mcp-crypto-ui": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/src/index.ts"]
    }
  }
}
```
*Remember to change the path parameters string into a complete matching local system absolute path sequence format.*
