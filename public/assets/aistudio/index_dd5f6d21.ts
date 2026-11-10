import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio.js";
import { z } from "zod";
import http from "node:http";

const server = new McpServer({
  name: "NodeCryptoServer",
  version: "1.0.0",
});

// Register the tool
server.tool(
  "get_crypto_price",
  {
    coinId: z.string().describe("The cryptocurrency name (e.g., bitcoin, ethereum)"),
    currency: z.string().default("usd").describe("The fiat currency (e.g., usd, eur, gbp)"),
  },
  async ({ coinId, currency }) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId.toLowerCase()}&vs_currencies=${currency.toLowerCase()}`
      );
      const data = await response.json();
      const price = data[coinId.toLowerCase()]?.[currency.toLowerCase()];
      
      if (!price) {
        return { content: [{ type: "text", text: `Could not find price data for ${coinId}.` }] };
      }
      return {
        content: [{ type: "text", text: `The current price of ${coinId} is ${price} ${currency.toUpperCase()}` }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error fetching data: ${error}` }] };
    }
  }
);

if (process.argv.includes("--ui")) {
  const PORT = 3000;
  http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MCP Crypto Dashboard</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f4f5f7;
            color: #333;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            max-width: 480px;
            width: 100%;
          }
          h2 { margin-top: 0; color: #111; font-size: 24px; }
          p { color: #666; font-size: 14px; margin-bottom: 24px; }
          .form-group {
            margin-bottom: 16px;
          }
          label {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 14px;
          }
          select, input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 15px;
          }
          button {
            width: 100%;
            background-color: #0066cc;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            margin-top: 10px;
          }
          button:hover { background-color: #0052a3; }
          pre {
            background: #272822;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
            margin-top: 20px;
            max-height: 200px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>MCP Crypto Dashboard</h2>
          <p>Local user interface mock utility simulating tool payload schema configurations.</p>
          
          <div class="form-group">
            <label for="coin">Cryptocurrency Token ID</label>
            <input type="text" id="coin" value="bitcoin" placeholder="e.g., bitcoin, ethereum, solana">
          </div>

          <div class="form-group">
            <label for="fiat">Target Currency</label>
            <select id="fiat">
              <option value="usd">USD ($)</option>
              <option value="gbp">GBP (£)</option>
              <option value="eur">EUR (€)</option>
            </select>
          </div>

          <button onclick="fetchPrice()">Execute Simulated Tool Request</button>
          
          <pre id="output">// Results and JSON-RPC payloads will output here...</pre>
        </div>

        <script>
          async function fetchPrice() {
            const coin = document.getElementById('coin').value.trim().toLowerCase();
            const fiat = document.getElementById('fiat').value;
            const output = document.getElementById('output');
            
            output.innerText = '--> Sending JSON-RPC: get_crypto_price...\n';
            
            try {
              const res = await fetch(\`https://api.coingecko.com/api/v3/simple/price?ids=\${coin}&vs_currencies=\${fiat}\`);
              const data = await res.json();
              
              if (!data[coin]) {
                output.innerText = \`Error: Token "\${coin}" not found in API.\`;
                return;
              }
              
              const mcpResponse = {
                jsonrpc: "2.0",
                result: {
                  content: [
                    {
                      type: "text",
                      text: \`The current price of \${coin} is \${data[coin][fiat]} \${fiat.toUpperCase()}\`
                    }
                  ]
                },
                id: Math.floor(Math.random() * 1000)
              };
              
              output.innerText = JSON.stringify(mcpResponse, null, 2);
            } catch (err) {
              output.innerText = "Network Error execution pipeline failure: " + err.message;
            }
          }
        </script>
      </body>
      </html>
    `);
  }).listen(PORT);
  console.log(`UI running at http://localhost:${PORT}`);
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
