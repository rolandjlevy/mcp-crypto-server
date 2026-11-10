import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Flame, Layers, LayoutGrid, Info } from 'lucide-react';
import { CryptoMarketItem } from '../types';

interface MarketHeatmapProps {
  markets: CryptoMarketItem[];
  currency: string;
  currencySymbol: string;
  onSelectCoinForTool: (coinId: string, currency: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  markets,
  currency,
  currencySymbol,
  onSelectCoinForTool,
}) => {
  const [layoutMode, setLayoutMode] = useState<'weighted' | 'grid'>('weighted');
  const [filterMode, setFilterMode] = useState<'all' | 'gainers' | 'losers' | 'volatile'>('all');
  const [hoveredCoin, setHoveredCoin] = useState<CryptoMarketItem | null>(null);

  // Take top 50
  const top50 = markets.slice(0, 50);

  // Performance calculations
  const gainersCount = top50.filter(c => (c.price_change_percentage_24h || 0) > 0).length;
  const losersCount = top50.filter(c => (c.price_change_percentage_24h || 0) < 0).length;
  const avgChange = top50.length
    ? top50.reduce((acc, c) => acc + (c.price_change_percentage_24h || 0), 0) / top50.length
    : 0;

  // Filtered dataset
  const displayCoins = top50.filter(c => {
    const chg = c.price_change_percentage_24h || 0;
    if (filterMode === 'gainers') return chg > 0;
    if (filterMode === 'losers') return chg < 0;
    if (filterMode === 'volatile') return Math.abs(chg) >= 5;
    return true;
  });

  // Color intensity calculation (Green to Red)
  const getIntensityStyle = (change: number) => {
    if (change >= 12) {
      return {
        bg: 'bg-emerald-600',
        border: 'border-emerald-400/50',
        text: 'text-white',
        badge: 'bg-emerald-800/80 text-emerald-100',
      };
    }
    if (change >= 6) {
      return {
        bg: 'bg-emerald-700',
        border: 'border-emerald-500/40',
        text: 'text-white',
        badge: 'bg-emerald-900/80 text-emerald-100',
      };
    }
    if (change >= 2) {
      return {
        bg: 'bg-emerald-800/90',
        border: 'border-emerald-600/40',
        text: 'text-emerald-50',
        badge: 'bg-emerald-950/80 text-emerald-200',
      };
    }
    if (change > 0) {
      return {
        bg: 'bg-emerald-950/80',
        border: 'border-emerald-700/30',
        text: 'text-emerald-100',
        badge: 'bg-emerald-950 text-emerald-300',
      };
    }
    if (change === 0) {
      return {
        bg: 'bg-slate-800',
        border: 'border-slate-700/40',
        text: 'text-slate-200',
        badge: 'bg-slate-900 text-slate-300',
      };
    }
    if (change > -2) {
      return {
        bg: 'bg-rose-950/80',
        border: 'border-rose-800/30',
        text: 'text-rose-100',
        badge: 'bg-rose-950 text-rose-300',
      };
    }
    if (change > -6) {
      return {
        bg: 'bg-rose-900/90',
        border: 'border-rose-700/40',
        text: 'text-rose-50',
        badge: 'bg-rose-950/80 text-rose-200',
      };
    }
    if (change > -12) {
      return {
        bg: 'bg-rose-700',
        border: 'border-rose-500/50',
        text: 'text-white',
        badge: 'bg-rose-900/80 text-rose-100',
      };
    }
    return {
      bg: 'bg-rose-600',
      border: 'border-rose-400/60',
      text: 'text-white',
      badge: 'bg-rose-800/80 text-rose-100',
    };
  };

  // Helper for formatting prices
  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (p >= 1) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 0.001) return p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return p.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  };

  // Helper to determine size classes in weighted layout
  const getWeightedColSpan = (index: number) => {
    if (layoutMode === 'grid') return 'col-span-1 min-h-[96px]';
    // Top 2 (BTC, ETH)
    if (index === 0) return 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[160px] row-span-2';
    if (index === 1) return 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[160px] row-span-2';
    // Ranks 3 to 6 (SOL, BNB, XRP, DOGE)
    if (index >= 2 && index <= 5) return 'col-span-6 sm:col-span-3 lg:col-span-2 min-h-[120px]';
    // Ranks 7 to 14
    if (index >= 6 && index <= 13) return 'col-span-6 sm:col-span-3 lg:col-span-2 min-h-[105px]';
    // Ranks 15 to 50
    return 'col-span-4 sm:col-span-2 lg:col-span-1 min-h-[92px]';
  };

  return (
    <div className="space-y-6">
      {/* Heatmap Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        {/* Left: Summary Metrics */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Top 50 Market Heatmap</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">
            Gainers: <span className="font-semibold text-emerald-400 tabular-nums">{gainersCount}</span>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">
            Losers: <span className="font-semibold text-rose-400 tabular-nums">{losersCount}</span>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">
            Avg 24h:{' '}
            <span
              className={`font-semibold tabular-nums ${
                avgChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {avgChange >= 0 ? '+' : ''}
              {avgChange.toFixed(2)}%
            </span>
          </span>
        </div>

        {/* Right: Layout & Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Performance Filter */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All (50)
            </button>
            <button
              onClick={() => setFilterMode('gainers')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterMode === 'gainers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setFilterMode('losers')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterMode === 'losers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Losers
            </button>
            <button
              onClick={() => setFilterMode('volatile')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterMode === 'volatile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Assets with |24h change| >= 5%"
            >
              &gt; ±5%
            </button>
          </div>

          {/* Sizing Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setLayoutMode('weighted')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                layoutMode === 'weighted' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tile size weighted by market cap hierarchy"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Weighted</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                layoutMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Uniform grid view for all tokens"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Color Intensity Scale Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Click any block to inspect and invoke tool calls in the MCP Playground</span>
        </div>

        {/* Visual Heatmap Color Gradient Bar */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="text-rose-400 font-semibold">-12%</span>
          <div className="flex items-center h-2.5 rounded overflow-hidden w-36 sm:w-44 border border-slate-800">
            <div className="flex-1 h-full bg-rose-600" title="<= -12%" />
            <div className="flex-1 h-full bg-rose-700" title="-6% to -12%" />
            <div className="flex-1 h-full bg-rose-900" title="-2% to -6%" />
            <div className="flex-1 h-full bg-slate-800" title="~0% Neutral" />
            <div className="flex-1 h-full bg-emerald-900" title="+2% to +6%" />
            <div className="flex-1 h-full bg-emerald-700" title="+6% to +12%" />
            <div className="flex-1 h-full bg-emerald-600" title=">= +12%" />
          </div>
          <span className="text-emerald-400 font-semibold">+12%</span>
        </div>
      </div>

      {/* The Heatmap Grid */}
      <div className="relative">
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2'
              : 'grid grid-cols-12 gap-2 auto-rows-max'
          }
        >
          {displayCoins.map((coin, index) => {
            const chg = coin.price_change_percentage_24h || 0;
            const style = getIntensityStyle(chg);
            const isPositive = chg >= 0;
            const colSpan = getWeightedColSpan(index);
            const isLarge = layoutMode === 'weighted' && (index === 0 || index === 1);

            return (
              <div
                key={coin.id}
                onClick={() => onSelectCoinForTool(coin.id, currency)}
                onMouseEnter={() => setHoveredCoin(coin)}
                onMouseLeave={() => setHoveredCoin(null)}
                className={`${colSpan} ${style.bg} ${style.border} border rounded-lg p-2.5 flex flex-col justify-between transition-all duration-150 hover:scale-[1.02] hover:z-20 hover:shadow-lg cursor-pointer group select-none relative overflow-hidden`}
              >
                {/* Top: Symbol & Rank */}
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold font-mono ${isLarge ? 'text-lg sm:text-xl' : 'text-sm'} text-white tracking-tight`}>
                        {coin.symbol.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-white/60 font-mono">
                        #{index + 1}
                      </span>
                    </div>
                    {isLarge && (
                      <div className="text-xs text-white/80 font-medium truncate max-w-[140px] mt-0.5">
                        {coin.name}
                      </div>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                  </div>
                </div>

                {/* Center / Bottom: Price & Change */}
                <div className="mt-2">
                  <div className={`font-mono tabular-nums font-semibold text-white ${isLarge ? 'text-base sm:text-lg' : 'text-xs'}`}>
                    {currencySymbol}{formatPrice(coin.current_price)}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-[11px] font-bold text-white tabular-nums drop-shadow-sm">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-emerald-200 shrink-0" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-200 shrink-0" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {chg.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Market Cap for larger tiles */}
                {isLarge && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-white/70 flex items-center justify-between font-mono tabular-nums">
                    <span>MCap:</span>
                    <span>{currencySymbol}{(coin.market_cap / 1e9).toFixed(1)}B</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Hover Detail Card overlay */}
        {hoveredCoin && (
          <div className="fixed bottom-6 right-6 z-50 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-xs w-full text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400 border border-slate-700">
                  {hoveredCoin.symbol.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{hoveredCoin.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{hoveredCoin.id}</div>
                </div>
              </div>
              <div
                className={`font-mono font-bold text-xs ${
                  (hoveredCoin.price_change_percentage_24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(hoveredCoin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                {hoveredCoin.price_change_percentage_24h?.toFixed(2)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block">Price</span>
                <span className="text-white font-semibold">
                  {currencySymbol}{formatPrice(hoveredCoin.current_price)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Market Cap</span>
                <span className="text-slate-300">
                  {currencySymbol}{(hoveredCoin.market_cap / 1e9).toFixed(2)}B
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">24h High</span>
                <span className="text-slate-300">
                  {hoveredCoin.high_24h ? `${currencySymbol}${formatPrice(hoveredCoin.high_24h)}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">24h Low</span>
                <span className="text-slate-300">
                  {hoveredCoin.low_24h ? `${currencySymbol}${formatPrice(hoveredCoin.low_24h)}` : '—'}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-indigo-400 font-sans pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span>Click to inspect MCP tool</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
