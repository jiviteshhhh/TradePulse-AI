import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { Layers, ArrowUpDown } from 'lucide-react';

export const OrderBook: React.FC = () => {
  const { orderBook, selectedAsset, setSelectedPrice } = useTerminal();
  const [precision, setPrecision] = useState<string>('0.5');

  const { asks, bids, spread, spreadPercent, imbalanceRatio } = orderBook;

  // We show top 9 asks (reversed so lowest ask is at bottom near spread) and top 9 bids
  const displayAsks = [...asks].slice(0, 9).reverse();
  const displayBids = [...bids].slice(0, 9);

  return (
    <div className="bg-[#131A26] border border-[#263347] rounded-sm flex flex-col h-full select-none overflow-hidden">
      {/* Header bar */}
      <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
            ORDER BOOK (L2)
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4] px-1 bg-[#06B6D4]/10 rounded-xs">
            REALTIME
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-['JetBrains_Mono'] text-[#64748B]">TICK:</span>
          <select
            value={precision}
            onChange={(e) => setPrecision(e.target.value)}
            className="bg-[#0B0F19] text-[#94A3B8] text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 border border-[#263347] rounded-xs outline-hidden cursor-pointer"
          >
            <option value="0.1">0.1</option>
            <option value="0.5">0.5</option>
            <option value="1.0">1.0</option>
            <option value="5.0">5.0</option>
          </select>
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 px-3 py-1 bg-[#0B0F19] border-b border-[#263347] text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B]">
        <span>PRICE (USD)</span>
        <span className="text-right">SIZE ({selectedAsset.baseAsset})</span>
        <span className="text-right">TOTAL</span>
      </div>

      {/* Asks (Sells) */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden divide-y divide-[#1C2433]/30">
        {displayAsks.map((ask, idx) => (
          <div
            key={`ask-${idx}`}
            onClick={() => setSelectedPrice(ask.price)}
            className="relative grid grid-cols-3 px-3 py-0.5 text-[11px] font-['JetBrains_Mono'] hover:bg-[#1C2433] transition-colors cursor-pointer group"
          >
            {/* Depth visual bar */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#EF4444]/15 pointer-events-none transition-all duration-300"
              style={{ width: `${Math.min(100, ask.depthPercent)}%` }}
            />
            <span className="text-[#EF4444] font-semibold tabular-nums z-10">
              {ask.price.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
            </span>
            <span className="text-right text-[#F8FAFC] tabular-nums z-10">
              {ask.size.toFixed(3)}
            </span>
            <span className="text-right text-[#94A3B8] tabular-nums z-10">
              {ask.total.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      {/* Mid Market Spread Bar */}
      <div className="px-3 py-1.5 bg-[#0B0F19] border-y border-[#263347] flex items-center justify-between text-xs font-['JetBrains_Mono']">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold tabular-nums ${
              selectedAsset.change24h >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            ${selectedAsset.price.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
          </span>
          <span className="text-[10px] text-[#64748B]">
            Mark: ${selectedAsset.markPrice.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
          </span>
        </div>

        <div className="text-[10px] text-right">
          <span className="text-[#64748B]">SPREAD: </span>
          <span className="text-[#F8FAFC] font-semibold tabular-nums">
            ${spread.toFixed(2)} ({spreadPercent}%)
          </span>
        </div>
      </div>

      {/* Bids (Buys) */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden divide-y divide-[#1C2433]/30">
        {displayBids.map((bid, idx) => (
          <div
            key={`bid-${idx}`}
            onClick={() => setSelectedPrice(bid.price)}
            className="relative grid grid-cols-3 px-3 py-0.5 text-[11px] font-['JetBrains_Mono'] hover:bg-[#1C2433] transition-colors cursor-pointer group"
          >
            {/* Depth visual bar */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#10B981]/15 pointer-events-none transition-all duration-300"
              style={{ width: `${Math.min(100, bid.depthPercent)}%` }}
            />
            <span className="text-[#10B981] font-semibold tabular-nums z-10">
              {bid.price.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
            </span>
            <span className="text-right text-[#F8FAFC] tabular-nums z-10">
              {bid.size.toFixed(3)}
            </span>
            <span className="text-right text-[#94A3B8] tabular-nums z-10">
              {bid.total.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      {/* Microstructure Imbalance Meter */}
      <div className="px-3 py-1.5 bg-[#0B0F19] border-t border-[#263347] flex items-center justify-between text-[10px] font-['JetBrains_Mono']">
        <div className="flex items-center gap-1.5 w-full">
          <span className="text-[#10B981] font-semibold">
            {Math.round((0.5 + imbalanceRatio * 0.5) * 100)}%
          </span>
          <div className="flex-1 h-1.5 bg-[#1C2433] rounded-xs overflow-hidden flex">
            <div
              className="bg-[#10B981] h-full transition-all duration-300"
              style={{ width: `${Math.round((0.5 + imbalanceRatio * 0.5) * 100)}%` }}
            />
            <div
              className="bg-[#EF4444] h-full transition-all duration-300"
              style={{ width: `${100 - Math.round((0.5 + imbalanceRatio * 0.5) * 100)}%` }}
            />
          </div>
          <span className="text-[#EF4444] font-semibold">
            {100 - Math.round((0.5 + imbalanceRatio * 0.5) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
