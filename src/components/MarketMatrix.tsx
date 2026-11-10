import React, { useState, useEffect, useTransition } from 'react';
import { Search, RefreshCw, TrendingUp, TrendingDown, ArrowUpRight, Download, Check, Flame, Table } from 'lucide-react';
import { CryptoMarketItem } from '../types';
import { MarketHeatmap } from './MarketHeatmap';

interface MarketMatrixProps {
  onSelectCoinForTool: (coinId: string, currency: string) => void;
}

const DEFAULT_MARKETS: CryptoMarketItem[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 96420, price_change_percentage_24h: 3.42, market_cap: 1898000000000, total_volume: 48500000000, high_24h: 97800, low_24h: 93200 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2840, price_change_percentage_24h: 1.84, market_cap: 342000000000, total_volume: 24300000000, high_24h: 2910, low_24h: 2760 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.02, market_cap: 128000000000, total_volume: 68000000000, high_24h: 1.01, low_24h: 0.99 },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 198.5, price_change_percentage_24h: 6.12, market_cap: 94000000000, total_volume: 8700000000, high_24h: 204.0, low_24h: 186.5 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 672.4, price_change_percentage_24h: 0.95, market_cap: 98000000000, total_volume: 1800000000, high_24h: 681.0, low_24h: 664.2 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.34, price_change_percentage_24h: -1.25, market_cap: 133000000000, total_volume: 7100000000, high_24h: 2.45, low_24h: 2.28 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.28, price_change_percentage_24h: -2.31, market_cap: 41000000000, total_volume: 3200000000, high_24h: 0.30, low_24h: 0.27 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.84, price_change_percentage_24h: 4.15, market_cap: 29900000000, total_volume: 1450000000, high_24h: 0.87, low_24h: 0.80 },
  { id: 'tron', symbol: 'trx', name: 'TRON', current_price: 0.20, price_change_percentage_24h: 0.55, market_cap: 17500000000, total_volume: 820000000, high_24h: 0.21, low_24h: 0.19 },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 34.2, price_change_percentage_24h: 2.78, market_cap: 14000000000, total_volume: 680000000, high_24h: 35.4, low_24h: 33.1 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 18.9, price_change_percentage_24h: 5.61, market_cap: 11800000000, total_volume: 820000000, high_24h: 19.4, low_24h: 17.8 },
  { id: 'sui', symbol: 'sui', name: 'Sui', current_price: 3.42, price_change_percentage_24h: 8.44, market_cap: 9800000000, total_volume: 1200000000, high_24h: 3.58, low_24h: 3.12 },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000024, price_change_percentage_24h: -3.14, market_cap: 14200000000, total_volume: 1100000000, high_24h: 0.000026, low_24h: 0.000023 },
  { id: 'the-open-network', symbol: 'ton', name: 'Toncoin', current_price: 5.48, price_change_percentage_24h: -1.10, market_cap: 13900000000, total_volume: 450000000, high_24h: 5.65, low_24h: 5.35 },
  { id: 'stellar', symbol: 'xlm', name: 'Stellar', current_price: 0.42, price_change_percentage_24h: 11.20, market_cap: 12600000000, total_volume: 1900000000, high_24h: 0.45, low_24h: 0.37 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.82, price_change_percentage_24h: 1.65, market_cap: 11200000000, total_volume: 580000000, high_24h: 8.10, low_24h: 7.60 },
  { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', current_price: 485.0, price_change_percentage_24h: -0.85, market_cap: 9600000000, total_volume: 420000000, high_24h: 495.0, low_24h: 478.0 },
  { id: 'hedera-hashgraph', symbol: 'hbar', name: 'Hedera', current_price: 0.22, price_change_percentage_24h: 14.50, market_cap: 8400000000, total_volume: 1600000000, high_24h: 0.24, low_24h: 0.18 },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 11.40, price_change_percentage_24h: 4.30, market_cap: 6800000000, total_volume: 380000000, high_24h: 11.90, low_24h: 10.80 },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 102.5, price_change_percentage_24h: -0.45, market_cap: 7700000000, total_volume: 610000000, high_24h: 106.0, low_24h: 100.5 },
  { id: 'pepe', symbol: 'pepe', name: 'Pepe', current_price: 0.000019, price_change_percentage_24h: 9.80, market_cap: 8100000000, total_volume: 2400000000, high_24h: 0.000021, low_24h: 0.000017 },
  { id: 'near', symbol: 'near', name: 'NEAR Protocol', current_price: 5.85, price_change_percentage_24h: 3.92, market_cap: 7100000000, total_volume: 720000000, high_24h: 6.10, low_24h: 5.60 },
  { id: 'aptos', symbol: 'apt', name: 'Aptos', current_price: 12.10, price_change_percentage_24h: -4.15, market_cap: 6200000000, total_volume: 480000000, high_24h: 12.80, low_24h: 11.70 },
  { id: 'internet-computer', symbol: 'icp', name: 'Internet Computer', current_price: 10.40, price_change_percentage_24h: 2.10, market_cap: 4900000000, total_volume: 210000000, high_24h: 10.80, low_24h: 10.10 },
  { id: 'aave', symbol: 'aave', name: 'Aave', current_price: 194.0, price_change_percentage_24h: 6.85, market_cap: 2900000000, total_volume: 290000000, high_24h: 202.0, low_24h: 181.0 },
  { id: 'crypto-com-chain', symbol: 'cro', name: 'Cronos', current_price: 0.16, price_change_percentage_24h: -1.75, market_cap: 4200000000, total_volume: 180000000, high_24h: 0.17, low_24h: 0.15 },
  { id: 'vechain', symbol: 'vet', name: 'VeChain', current_price: 0.042, price_change_percentage_24h: 5.12, market_cap: 3400000000, total_volume: 160000000, high_24h: 0.045, low_24h: 0.039 },
  { id: 'render-token', symbol: 'render', name: 'Render', current_price: 7.60, price_change_percentage_24h: 7.40, market_cap: 3900000000, total_volume: 410000000, high_24h: 8.00, low_24h: 7.05 },
  { id: 'fetch-ai', symbol: 'fet', name: 'Artificial Superintelligence', current_price: 1.48, price_change_percentage_24h: 12.30, market_cap: 3800000000, total_volume: 380000000, high_24h: 1.58, low_24h: 1.30 },
  { id: 'polygon-ecosystem-token', symbol: 'pol', name: 'Polygon', current_price: 0.58, price_change_percentage_24h: -2.10, market_cap: 4600000000, total_volume: 220000000, high_24h: 0.61, low_24h: 0.56 },
  { id: 'kaspa', symbol: 'kas', name: 'Kaspa', current_price: 0.15, price_change_percentage_24h: -3.80, market_cap: 3700000000, total_volume: 95000000, high_24h: 0.16, low_24h: 0.14 },
  { id: 'bittensor', symbol: 'tao', name: 'Bittensor', current_price: 520.0, price_change_percentage_24h: 8.15, market_cap: 3800000000, total_volume: 240000000, high_24h: 545.0, low_24h: 480.0 },
  { id: 'monero', symbol: 'xmr', name: 'Monero', current_price: 168.0, price_change_percentage_24h: 0.40, market_cap: 3100000000, total_volume: 78000000, high_24h: 172.0, low_24h: 165.0 },
  { id: 'algorand', symbol: 'algo', name: 'Algorand', current_price: 0.28, price_change_percentage_24h: 13.20, market_cap: 2300000000, total_volume: 310000000, high_24h: 0.31, low_24h: 0.24 },
  { id: 'fantom', symbol: 'ftm', name: 'Fantom', current_price: 0.94, price_change_percentage_24h: 6.45, market_cap: 2600000000, total_volume: 210000000, high_24h: 0.99, low_24h: 0.88 },
  { id: 'filecoin', symbol: 'fil', name: 'Filecoin', current_price: 5.60, price_change_percentage_24h: -2.60, market_cap: 3300000000, total_volume: 270000000, high_24h: 5.85, low_24h: 5.40 },
  { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', current_price: 0.88, price_change_percentage_24h: -4.50, market_cap: 3600000000, total_volume: 340000000, high_24h: 0.94, low_24h: 0.85 },
  { id: 'celestia', symbol: 'tia', name: 'Celestia', current_price: 6.20, price_change_percentage_24h: -7.80, market_cap: 1400000000, total_volume: 180000000, high_24h: 6.85, low_24h: 6.05 },
  { id: 'cosmos', symbol: 'atom', name: 'Cosmos', current_price: 6.90, price_change_percentage_24h: 1.20, market_cap: 2700000000, total_volume: 160000000, high_24h: 7.20, low_24h: 6.70 },
  { id: 'injective-protocol', symbol: 'inj', name: 'Injective', current_price: 24.5, price_change_percentage_24h: 4.90, market_cap: 2400000000, total_volume: 190000000, high_24h: 25.8, low_24h: 23.1 },
  { id: 'blockstack', symbol: 'stx', name: 'Stacks', current_price: 2.15, price_change_percentage_24h: 3.10, market_cap: 3200000000, total_volume: 170000000, high_24h: 2.28, low_24h: 2.05 },
  { id: 'optimism', symbol: 'op', name: 'Optimism', current_price: 1.95, price_change_percentage_24h: -5.20, market_cap: 2400000000, total_volume: 210000000, high_24h: 2.10, low_24h: 1.88 },
  { id: 'bonk', symbol: 'bonk', name: 'Bonk', current_price: 0.000038, price_change_percentage_24h: 15.40, market_cap: 2800000000, total_volume: 850000000, high_24h: 0.000042, low_24h: 0.000032 },
  { id: 'thorchain', symbol: 'rune', name: 'THORChain', current_price: 5.80, price_change_percentage_24h: -3.20, market_cap: 1900000000, total_volume: 150000000, high_24h: 6.10, low_24h: 5.60 },
  { id: 'floki', symbol: 'floki', name: 'Floki', current_price: 0.00021, price_change_percentage_24h: -1.90, market_cap: 2000000000, total_volume: 380000000, high_24h: 0.00023, low_24h: 0.00020 },
  { id: 'sei-network', symbol: 'sei', name: 'Sei', current_price: 0.52, price_change_percentage_24h: 5.80, market_cap: 2200000000, total_volume: 170000000, high_24h: 0.56, low_24h: 0.48 },
  { id: 'dogwifcoin', symbol: 'wif', name: 'dogwifhat', current_price: 2.85, price_change_percentage_24h: -8.40, market_cap: 2800000000, total_volume: 620000000, high_24h: 3.20, low_24h: 2.70 },
  { id: 'immutable-x', symbol: 'imx', name: 'Immutable', current_price: 1.55, price_change_percentage_24h: 2.30, market_cap: 2500000000, total_volume: 120000000, high_24h: 1.64, low_24h: 1.48 },
  { id: 'the-graph', symbol: 'grt', name: 'The Graph', current_price: 0.26, price_change_percentage_24h: 4.10, market_cap: 2500000000, total_volume: 140000000, high_24h: 0.28, low_24h: 0.24 },
  { id: 'maker', symbol: 'mkr', name: 'Maker', current_price: 1840.0, price_change_percentage_24h: 1.15, market_cap: 1700000000, total_volume: 95000000, high_24h: 1890.0, low_24h: 1800.0 },
];

export const MarketMatrix: React.FC<MarketMatrixProps> = ({ onSelectCoinForTool }) => {
  const [markets, setMarkets] = useState<CryptoMarketItem[]>(DEFAULT_MARKETS);
  const [currency, setCurrency] = useState<string>('usd');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matrixView, setMatrixView] = useState<'heatmap' | 'table'>('heatmap');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isExported, setIsExported] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const handleExportCsv = () => {
    const itemsToExport = filteredMarkets.length > 0 ? filteredMarkets : markets;
    if (itemsToExport.length === 0) return;

    const headers = [
      'Token ID',
      'Asset Name',
      'Symbol',
      `Price (${currency.toUpperCase()})`,
      'Quote Currency',
      '24h Change (%)',
      `24h High (${currency.toUpperCase()})`,
      `24h Low (${currency.toUpperCase()})`,
      `Market Cap (${currency.toUpperCase()})`,
      `24h Volume (${currency.toUpperCase()})`,
      'Timestamp (UTC)',
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = itemsToExport.map(coin => [
      escapeCsv(coin.id),
      escapeCsv(coin.name),
      escapeCsv(coin.symbol.toUpperCase()),
      coin.current_price,
      escapeCsv(currency.toUpperCase()),
      coin.price_change_percentage_24h !== undefined ? Number(coin.price_change_percentage_24h.toFixed(2)) : 0,
      coin.high_24h !== undefined ? coin.high_24h : '',
      coin.low_24h !== undefined ? coin.low_24h : '',
      coin.market_cap !== undefined ? coin.market_cap : '',
      coin.total_volume !== undefined ? coin.total_volume : '',
      escapeCsv(new Date().toISOString()),
    ]);

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const filterSuffix = searchTerm.trim() ? `_filtered` : '';
    link.setAttribute('href', url);
    link.setAttribute('download', `crypto_market_matrix_${currency}_${dateStr}${filterSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2200);
  };

  const fetchMarkets = async (selectedCurrency: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/crypto/markets?currency=${selectedCurrency}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        if (data.markets && Array.isArray(data.markets)) {
          setMarkets(data.markets);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch {
      // Fallback kept
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets(currency);
  }, [currency]);

  const filteredMarkets = markets.filter(
    m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrencySymbol = (c: string) => {
    switch (c) {
      case 'eur':
        return '€';
      case 'gbp':
        return '£';
      case 'jpy':
        return '¥';
      default:
        return '$';
    }
  };

  const currSym = getCurrencySymbol(currency);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Live Market Matrix & Watchlist
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time cryptocurrency metrics tracked by the MCP server tools. Click any token to inspect tool calling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setMatrixView('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                matrixView === 'heatmap'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Heatmap (50)</span>
            </button>
            <button
              onClick={() => setMatrixView('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                matrixView === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-slate-300" />
              <span>Table</span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {['usd', 'eur', 'gbp', 'jpy'].map(c => (
              <button
                key={c}
                onClick={() => {
                  startTransition(() => {
                    setCurrency(c);
                  });
                }}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer uppercase ${
                  currency === c
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Export CSV Action Button */}
          <button
            onClick={handleExportCsv}
            disabled={filteredMarkets.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Export market matrix data to CSV file for offline spreadsheet analysis"
          >
            {isExported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">CSV Exported</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export CSV</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchMarkets(currency)}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh market prices"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Unboxed Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by token name or symbol (e.g. BTC, Solana)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>Last Updated: <span className="text-slate-300 font-mono tabular-nums">{lastUpdated}</span></span>
          <span aria-hidden="true">·</span>
          <span>Assets Loaded: <span className="text-slate-300 font-mono tabular-nums">{filteredMarkets.length}</span></span>
          <span aria-hidden="true">·</span>
          <button
            onClick={handleExportCsv}
            disabled={filteredMarkets.length === 0}
            className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer underline underline-offset-4 decoration-indigo-800/80 disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
      </div>

      {matrixView === 'heatmap' ? (
        <MarketHeatmap
          markets={filteredMarkets}
          currency={currency}
          currencySymbol={currSym}
          onSelectCoinForTool={onSelectCoinForTool}
        />
      ) : (
        /* High Density Data Grid */
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-medium border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4 text-right">Price ({currency.toUpperCase()})</th>
                <th className="py-3 px-4 text-right">24h Change</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">24h High</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">24h Low</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Market Cap</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">24h Volume</th>
                <th className="py-3 px-4 text-center">MCP Tool Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No cryptocurrency assets matching &quot;{searchTerm}&quot;
                  </td>
                </tr>
              ) : (
                filteredMarkets.map(coin => {
                  const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
                  return (
                    <tr
                      key={coin.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Asset Name and Symbol */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700">
                            {coin.symbol.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {coin.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {coin.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-semibold text-white tabular-nums">
                        {currSym}
                        {coin.current_price > 1
                          ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isPositive ? '+' : ''}
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* 24h High */}
                      <td className="py-3.5 px-4 text-right text-slate-400 hidden md:table-cell tabular-nums">
                        {currSym}{coin.high_24h?.toLocaleString() ?? '—'}
                      </td>

                      {/* 24h Low */}
                      <td className="py-3.5 px-4 text-right text-slate-400 hidden md:table-cell tabular-nums">
                        {currSym}{coin.low_24h?.toLocaleString() ?? '—'}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-right text-slate-300 hidden lg:table-cell tabular-nums">
                        {currSym}{(coin.market_cap / 1e9).toFixed(2)}B
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3.5 px-4 text-right text-slate-400 hidden sm:table-cell tabular-nums">
                        {currSym}{(coin.total_volume / 1e6).toFixed(1)}M
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={() => onSelectCoinForTool(coin.id, currency)}
                          className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect Tool</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
