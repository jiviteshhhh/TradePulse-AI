import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { ShieldAlert, AlertTriangle, Activity, Sliders, TrendingDown, CheckCircle2 } from 'lucide-react';

export const DeskRisk: React.FC = () => {
  const { risk, positions } = useTerminal();

  const [stressShockPercent, setStressShockPercent] = useState<number>(-15);
  const [selectedPreset, setSelectedPreset] = useState<string>('FLASH_CRASH');

  const presets = [
    {
      id: 'FLASH_CRASH',
      name: 'Black Swan Flash Crash (-20%)',
      percent: -20,
      description: 'Simulates instantaneous 20% drawdown across crypto perp markets',
    },
    {
      id: 'MILD_PULLBACK',
      name: 'Macro Liquidity Squeeze (-8%)',
      percent: -8,
      description: 'Standard aggressive pullback with moderate funding rate shift',
    },
    {
      id: 'SHORT_SQUEEZE',
      name: 'Aggressive Short Squeeze (+15%)',
      percent: 15,
      description: 'Sudden upside gap straining short hedge legs',
    },
    {
      id: 'EXTREME_TAIL',
      name: 'Systemic Cascading Tail Risk (-35%)',
      percent: -35,
      description: 'Extreme cascade triggering secondary liquidation cascades',
    },
  ];

  // Compute stress impact on current open positions
  const simulatedPositionImpacts = positions.map((pos) => {
    const isLong = pos.side === 'long';
    const priceShiftRatio = 1 + stressShockPercent / 100;
    const simulatedPrice = pos.markPrice * priceShiftRatio;
    const diff = isLong ? simulatedPrice - pos.entryPrice : pos.entryPrice - simulatedPrice;
    const simulatedPnl = diff * pos.size;
    const deltaChange = simulatedPnl - pos.unrealizedPnl;

    return {
      symbol: pos.symbol,
      side: pos.side,
      size: pos.size,
      currentPnl: pos.unrealizedPnl,
      simulatedPnl,
      deltaChange,
      marginCallBreached:
        isLong ? simulatedPrice <= pos.liqPrice : simulatedPrice >= pos.liqPrice,
    };
  });

  const totalStressDeltaChange = simulatedPositionImpacts.reduce((acc, p) => acc + p.deltaChange, 0);
  const simulatedPortfolioEquity = Math.max(0, risk.totalEquityUsd + totalStressDeltaChange);
  const simulatedMarginUtilization = (risk.usedMarginUsd / (simulatedPortfolioEquity || 1)) * 100;

  return (
    <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-0 select-none">
      {/* Top Risk Telemetry Strip */}
      <div className="bg-[#131A26] border border-[#263347] rounded-sm p-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            VALUE AT RISK (VaR 99% 1D)
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#EF4444] tabular-nums">
            ${risk.var99_1dUsd.toLocaleString()} ({risk.var99_1dPercent}%)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            EXPECTED SHORTFALL (CVaR)
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#EF4444] tabular-nums">
            ${risk.cvar99_1dUsd.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            PORTFOLIO DELTA EXPOSURE
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] tabular-nums">
            +${risk.portfolioDeltaUsd.toLocaleString()} Δ
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            EFFECTIVE LEVERAGE
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F59E0B] tabular-nums">
            {risk.effectiveLeverage}x (CONSERVATIVE)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            CIRCUIT BREAKER STATUS
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <span>NORMAL OPS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Stress Simulator (7 cols) + Right Greeks & Counterparty (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-[500px]">
        {/* Stress Testing Engine */}
        <div className="lg:col-span-7 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                MACRO PORTFOLIO STRESS TESTING SIMULATOR
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4]">
              MONTE-CARLO STRESS ENGINE
            </span>
          </div>

          <div className="p-3 space-y-4 flex-1 overflow-y-auto">
            {/* Stress Presets */}
            <div>
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B] font-bold mb-1.5">
                SELECT HISTORICAL CRISIS PRESET
              </div>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPreset(p.id);
                      setStressShockPercent(p.percent);
                    }}
                    className={`p-2.5 text-left rounded-sm border transition-all cursor-pointer ${
                      selectedPreset === p.id
                        ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F8FAFC]'
                        : 'bg-[#0B0F19] border-[#263347] text-[#94A3B8] hover:border-[#334155]'
                    }`}
                  >
                    <div className="font-['JetBrains_Mono'] font-bold text-xs">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-1 leading-snug">
                      {p.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2">
              <div className="flex items-center justify-between font-['JetBrains_Mono'] text-xs">
                <span className="text-[#94A3B8]">CUSTOM PRICE SHOCK SHIFT:</span>
                <span
                  className={`font-bold text-sm tabular-nums ${
                    stressShockPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {stressShockPercent >= 0 ? '+' : ''}{stressShockPercent}%
                </span>
              </div>
              <input
                type="range"
                min={-40}
                max={40}
                step={1}
                value={stressShockPercent}
                onChange={(e) => {
                  setSelectedPreset('CUSTOM');
                  setStressShockPercent(Number(e.target.value));
                }}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-['JetBrains_Mono'] text-[#64748B]">
                <span>-40% Crash</span>
                <span>-20%</span>
                <span>0% Baseline</span>
                <span>+20%</span>
                <span>+40% Surge</span>
              </div>
            </div>

            {/* Simulated Outcome Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono']">
              <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm">
                <div className="text-[10px] text-[#64748B] uppercase">SIMULATED NET PnL IMPACT</div>
                <div
                  className={`text-base font-bold tabular-nums mt-1 ${
                    totalStressDeltaChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {totalStressDeltaChange >= 0 ? '+' : ''}$
                  {totalStressDeltaChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">
                  Portfolio Equity: ${simulatedPortfolioEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm">
                <div className="text-[10px] text-[#64748B] uppercase">SIMULATED MARGIN UTILIZATION</div>
                <div
                  className={`text-base font-bold tabular-nums mt-1 ${
                    simulatedMarginUtilization > 85 ? 'text-[#EF4444]' : 'text-[#06B6D4]'
                  }`}
                >
                  {simulatedMarginUtilization.toFixed(1)}%
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">
                  {simulatedMarginUtilization > 85
                    ? 'CRITICAL MARGIN CALL TRIGGERED'
                    : 'Within Sovereign Safety Cushion'}
                </div>
              </div>
            </div>

            {/* Position Breakdowns Under Shock */}
            <div className="space-y-1">
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B] font-bold">
                POSITION RESILIENCE BLOTTER
              </div>
              <div className="border border-[#263347] rounded-xs divide-y divide-[#1C2433] overflow-hidden">
                {simulatedPositionImpacts.map((pos) => (
                  <div
                    key={pos.symbol}
                    className="p-2 bg-[#0B0F19] flex items-center justify-between text-xs font-['JetBrains_Mono']"
                  >
                    <div>
                      <span className="font-bold text-[#F8FAFC]">{pos.symbol}</span>
                      <span className="text-[10px] text-[#64748B] ml-2">
                        {pos.side.toUpperCase()} ({pos.size})
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div
                          className={`font-semibold tabular-nums ${
                            pos.deltaChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {pos.deltaChange >= 0 ? '+' : ''}$
                          {pos.deltaChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      {pos.marginCallBreached ? (
                        <span className="px-1.5 py-0.5 bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 text-[9px] font-bold rounded-xs">
                          LIQUIDATION BREACH
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-[#10B981]/15 text-[#10B981] text-[9px] font-bold rounded-xs">
                          SAFE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Portfolio Greeks & Counterparty Exposure */}
        <div className="lg:col-span-5 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                PORTFOLIO GREEKS & COUNTERPARTY RISK
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#F59E0B]">
              RISK MATRIX
            </span>
          </div>

          <div className="p-3 space-y-4 flex-1 overflow-y-auto">
            {/* Greeks Grid */}
            <div>
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B] font-bold mb-2">
                FIRST & SECOND ORDER GREEKS SKEW
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono']">
                <div className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs">
                  <div className="text-[10px] text-[#64748B]">PORTFOLIO DELTA (Δ)</div>
                  <div className="text-sm font-bold text-[#10B981] tabular-nums mt-0.5">
                    +${risk.portfolioDeltaUsd.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#64748B]">Moderate directional long tilt</div>
                </div>

                <div className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs">
                  <div className="text-[10px] text-[#64748B]">PORTFOLIO GAMMA (Γ)</div>
                  <div className="text-sm font-bold text-[#06B6D4] tabular-nums mt-0.5">
                    {risk.portfolioGamma} Δ/USD
                  </div>
                  <div className="text-[9px] text-[#64748B]">Convexity risk well hedged</div>
                </div>

                <div className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs">
                  <div className="text-[10px] text-[#64748B]">PORTFOLIO VEGA (ν)</div>
                  <div className="text-sm font-bold text-[#F59E0B] tabular-nums mt-0.5">
                    +${risk.portfolioVega} / 1% IV
                  </div>
                  <div className="text-[9px] text-[#64748B]">Positive volatility variance</div>
                </div>

                <div className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs">
                  <div className="text-[10px] text-[#64748B]">PORTFOLIO THETA (θ)</div>
                  <div className="text-sm font-bold text-[#EF4444] tabular-nums mt-0.5">
                    ${risk.portfolioThetaPerDay} / day
                  </div>
                  <div className="text-[9px] text-[#64748B]">Daily decay drag on gamma</div>
                </div>
              </div>
            </div>

            {/* Exchange Counterparty Risk */}
            <div>
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B] font-bold mb-2">
                EXCHANGE COUNTERPARTY ALLOCATION CAP
              </div>

              <div className="space-y-2 font-['JetBrains_Mono'] text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-[#F8FAFC]">Binance VIP L2 (42%)</span>
                    <span className="text-[#10B981] font-semibold">$1.78M / $2.0M Cap</span>
                  </div>
                  <div className="h-1.5 bg-[#0B0F19] border border-[#263347] rounded-xs overflow-hidden">
                    <div className="bg-[#10B981] h-full w-[89%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-[#F8FAFC]">Coinbase Prime (25%)</span>
                    <span className="text-[#06B6D4] font-semibold">$1.06M / $1.5M Cap</span>
                  </div>
                  <div className="h-1.5 bg-[#0B0F19] border border-[#263347] rounded-xs overflow-hidden">
                    <div className="bg-[#06B6D4] h-full w-[70%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-[#F8FAFC]">Bybit Direct (18%)</span>
                    <span className="text-[#F59E0B] font-semibold">$765k / $1.0M Cap</span>
                  </div>
                  <div className="h-1.5 bg-[#0B0F19] border border-[#263347] rounded-xs overflow-hidden">
                    <div className="bg-[#F59E0B] h-full w-[76%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-[#F8FAFC]">Deribit Institutional (15%)</span>
                    <span className="text-[#10B981] font-semibold">$637k / $1.0M Cap</span>
                  </div>
                  <div className="h-1.5 bg-[#0B0F19] border border-[#263347] rounded-xs overflow-hidden">
                    <div className="bg-[#10B981] h-full w-[63%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Officer Recommendation Note */}
            <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] leading-relaxed">
              <span className="text-[#F59E0B] font-bold">Risk Desk Advisory:</span> Multi-venue
              collateral ratio is within sovereign Tier 1 thresholds. Max single-venue concentration
              is locked at 45% ceiling. VaR 99% covers 100% of standard 3-sigma anomalies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
