import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { INITIAL_VENUE_QUOTES } from '../../mock/terminalData';
import { Zap, Activity, Layers, ArrowUpRight, ArrowDownRight, Server } from 'lucide-react';

export const DeskOrderFlow: React.FC = () => {
  const { trades, selectedAsset, orderBook, latencyMs } = useTerminal();
  const [filterBlockTradesOnly, setFilterBlockTradesOnly] = useState(false);

  const displayTrades = filterBlockTradesOnly
    ? trades.filter((t) => t.isBlockTrade)
    : trades;

  // Calculate Cumulative Volume Delta (CVD) for current tape
  let runningCvd = 0;
  const cvdPoints = [...trades].reverse().map((t, idx) => {
    const delta = t.side === 'buy' ? t.size : -t.size;
    runningCvd += delta;
    return {
      index: idx,
      cvd: Number(runningCvd.toFixed(2)),
      price: t.price,
      isBuy: t.side === 'buy',
    };
  });

  const minCvd = Math.min(...cvdPoints.map((p) => p.cvd), -5);
  const maxCvd = Math.max(...cvdPoints.map((p) => p.cvd), 5);
  const cvdRange = maxCvd - minCvd || 1;

  return (
    <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-0 select-none">
      {/* Top Telemetry Strip */}
      <div className="bg-[#131A26] border border-[#263347] rounded-sm p-3 grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            CUMULATIVE DELTA (CVD)
          </div>
          <div
            className={`font-['JetBrains_Mono'] font-bold text-base tabular-nums ${
              runningCvd >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            {runningCvd >= 0 ? '+' : ''}{runningCvd.toFixed(2)} {selectedAsset.baseAsset}
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            BOOK DEPTH IMBALANCE
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#06B6D4] tabular-nums">
            {(orderBook.imbalanceRatio * 100).toFixed(1)}% BID BIAS
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            EST. SLIPPAGE (10 BTC SWEEP)
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F59E0B] tabular-nums">
            0.0034% (0.34 bps)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            SOR ROUTING EFFICIENCY
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] tabular-nums">
            99.82% BEST BID/OFFER
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tape (4 cols) + Middle CVD & Liquidity (4 cols) + Right Multi-Venue Matrix (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-[500px]">
        {/* Real-time Time & Sales Tape */}
        <div className="lg:col-span-4 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                TIME & SALES TAPE
              </span>
            </div>

            <button
              onClick={() => setFilterBlockTradesOnly(!filterBlockTradesOnly)}
              className={`px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] rounded-xs border transition-colors cursor-pointer ${
                filterBlockTradesOnly
                  ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-bold'
                  : 'bg-[#0B0F19] border-[#263347] text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              BLOCKS ONLY
            </button>
          </div>

          <div className="grid grid-cols-4 px-3 py-1 bg-[#0B0F19] border-b border-[#263347] text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B]">
            <span>TIME</span>
            <span>PRICE</span>
            <span className="text-right">SIZE</span>
            <span className="text-right">VALUE / VENUE</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1C2433]/40">
            {displayTrades.map((t) => {
              const isBuy = t.side === 'buy';
              return (
                <div
                  key={t.id}
                  className={`grid grid-cols-4 px-3 py-1 text-xs font-['JetBrains_Mono'] hover:bg-[#1C2433] transition-colors ${
                    t.isBlockTrade ? 'bg-[#F59E0B]/5' : ''
                  }`}
                >
                  <span className="text-[#64748B] text-[11px]">{t.timestamp}</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isBuy ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    ${t.price.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
                  </span>
                  <span className="text-right text-[#F8FAFC] tabular-nums font-medium">
                    {t.size.toFixed(3)}
                  </span>
                  <div className="text-right">
                    <span className="text-[#94A3B8] text-[10px] tabular-nums">
                      ${(t.valueUsd / 1e3).toFixed(1)}k
                    </span>
                    {t.isBlockTrade && (
                      <span className="ml-1 px-1 py-0.2 bg-[#F59E0B]/20 text-[#F59E0B] rounded-xs text-[8px] font-bold">
                        BLK
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle: Cumulative Volume Delta & Depth Radar */}
        <div className="lg:col-span-4 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                CUMULATIVE VOLUME DELTA (CVD)
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#10B981]">
              DELTA AGGRESSION
            </span>
          </div>

          {/* SVG CVD Line Graph */}
          <div className="h-48 bg-[#0B0F19] p-2 border-b border-[#263347]">
            <svg className="w-full h-full">
              {/* Zero axis */}
              <line
                x1={0}
                y1={((maxCvd - 0) / cvdRange) * 160}
                x2={380}
                y2={((maxCvd - 0) / cvdRange) * 160}
                stroke="#263347"
                strokeWidth={1}
                strokeDasharray="2,2"
              />

              {/* CVD Polyline */}
              <polyline
                fill="none"
                stroke={runningCvd >= 0 ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                points={cvdPoints
                  .map((p, i) => {
                    const x = (i / (cvdPoints.length || 1)) * 360 + 10;
                    const y = 160 - ((p.cvd - minCvd) / cvdRange) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
            <div className="flex justify-between text-[9px] font-['JetBrains_Mono'] text-[#64748B] mt-1">
              <span>-40 ticks</span>
              <span>-20 ticks</span>
              <span>CURRENT (TICK 0)</span>
            </div>
          </div>

          {/* Liquidity Depth Distribution across tiers */}
          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B] font-bold">
              LIQUIDITY DEPTH DISTRIBUTION (±2% BANDS)
            </div>

            <div className="space-y-2.5 font-['JetBrains_Mono'] text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#64748B]">DEPTH ±0.25%</span>
                  <span className="text-[#F8FAFC] font-semibold">$1.84M bids / $1.42M asks</span>
                </div>
                <div className="h-1.5 bg-[#1C2433] rounded-xs flex overflow-hidden">
                  <div className="bg-[#10B981] h-full w-[56%]" />
                  <div className="bg-[#EF4444] h-full w-[44%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#64748B]">DEPTH ±0.50%</span>
                  <span className="text-[#F8FAFC] font-semibold">$4.91M bids / $3.85M asks</span>
                </div>
                <div className="h-1.5 bg-[#1C2433] rounded-xs flex overflow-hidden">
                  <div className="bg-[#10B981] h-full w-[58%]" />
                  <div className="bg-[#EF4444] h-full w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#64748B]">DEPTH ±1.00%</span>
                  <span className="text-[#F8FAFC] font-semibold">$12.4M bids / $9.80M asks</span>
                </div>
                <div className="h-1.5 bg-[#1C2433] rounded-xs flex overflow-hidden">
                  <div className="bg-[#10B981] h-full w-[62%]" />
                  <div className="bg-[#EF4444] h-full w-[38%]" />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs text-[10px] font-['JetBrains_Mono'] text-[#94A3B8]">
              <span className="text-[#F59E0B] font-bold">Order Flow Regime:</span> Institutional
              passive bid absorption detected at ${orderBook.bids[0]?.price.toLocaleString()}. Low
              downside slippage risk.
            </div>
          </div>
        </div>

        {/* Right: Multi-Venue Routing Matrix */}
        <div className="lg:col-span-4 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                SMART ORDER ROUTING (SOR)
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4]">
              CROSS-EXCHANGE MATRIX
            </span>
          </div>

          <div className="p-2 space-y-2 flex-1 overflow-y-auto">
            {INITIAL_VENUE_QUOTES.map((v) => (
              <div
                key={v.venue}
                className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs space-y-1.5 hover:border-[#334155] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] font-bold text-xs text-[#F8FAFC]">
                    {v.venue}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4] font-semibold">
                    {v.latencyMs}ms RTT
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-['JetBrains_Mono'] pt-1 border-t border-[#1C2433]">
                  <div>
                    <span className="text-[#64748B] block">BEST BID</span>
                    <span className="text-[#10B981] font-bold tabular-nums">
                      ${v.bid.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">BEST ASK</span>
                    <span className="text-[#EF4444] font-bold tabular-nums">
                      ${v.ask.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">SPREAD</span>
                    <span className="text-[#F8FAFC] tabular-nums">${v.spread.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-['JetBrains_Mono'] text-[#64748B] pt-0.5">
                  <span>Fill Rate: {v.fillRatePercent}%</span>
                  <span>Routed Share: {v.routedVolumeShare}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
