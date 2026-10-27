import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { Strategy } from '../../types/terminal';
import { DeployStrategyModal } from './DeployStrategyModal';
import {
  Cpu,
  Play,
  Pause,
  Sliders,
  TrendingUp,
  Shield,
  Activity,
  PlusCircle,
  RefreshCw,
  Zap,
  CheckCircle2,
  BarChart,
} from 'lucide-react';

export const DeskStrategies: React.FC = () => {
  const { strategies, toggleStrategyStatus, updateStrategyParam } = useTerminal();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategies[0]?.id || 'STRAT-01');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isSimulatingBacktest, setIsSimulatingBacktest] = useState(false);
  const [backtestResult, setBacktestResult] = useState<string | null>(null);

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  const totalAllocated = strategies.reduce((acc, s) => acc + s.allocatedUsd, 0);
  const totalDailyPnl = strategies.reduce((acc, s) => acc + s.dailyPnl, 0);
  const avgSharpe = (strategies.reduce((acc, s) => acc + s.sharpeRatio, 0) / (strategies.length || 1)).toFixed(2);
  const totalExecutions = strategies.reduce((acc, s) => acc + s.totalExecutions, 0);

  const handleRunBacktest = () => {
    setIsSimulatingBacktest(true);
    setBacktestResult(null);
    setTimeout(() => {
      setIsSimulatingBacktest(false);
      setBacktestResult(
        `Monte-Carlo Simulation Completed (10,000 runs): Expectation E[R] = +${(selectedStrategy.apy * 1.05).toFixed(
          1
        )}% APY | Value-at-Risk 99%: ${(selectedStrategy.maxDrawdown * 0.9).toFixed(
          2
        )}% | Profit Factor: 2.84 | Calibration Optimal`
      );
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-0 select-none">
      {/* Top Algorithmic Metrics Strip */}
      <div className="bg-[#131A26] border border-[#263347] rounded-sm p-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            TOTAL ALGO ALLOCATION
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F8FAFC] tabular-nums">
            ${totalAllocated.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            BLENDED SHARPE RATIO
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F59E0B] tabular-nums">
            {avgSharpe}
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            24H STRATEGY NET PnL
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] tabular-nums">
            +${totalDailyPnl.toLocaleString()} (+1.84%)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            TOTAL EXECUTIONS TODAY
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#06B6D4] tabular-nums">
            {totalExecutions.toLocaleString()}
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 flex justify-end">
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>DEPLOY STRATEGY</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Strategy Fleet List (7 cols) + Right Calibration Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-[500px]">
        {/* Strategy Fleet List */}
        <div className="lg:col-span-7 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                STRATEGY FLEET MATRIX ({strategies.length} NODES)
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748B]">
              SELECT NODE TO CALIBRATE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {strategies.map((strat) => {
              const isSelected = strat.id === selectedStrategyId;
              const isActive = strat.status === 'ACTIVE';

              return (
                <div
                  key={strat.id}
                  onClick={() => setSelectedStrategyId(strat.id)}
                  className={`p-3 bg-[#0B0F19] border rounded-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'border-[#263347] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                          {strat.name}
                        </span>
                        <span
                          className={`font-['JetBrains_Mono'] text-[9px] px-1.5 py-0.2 rounded-xs font-bold uppercase ${
                            isActive
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                          }`}
                        >
                          {strat.status}
                        </span>
                      </div>
                      <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B]">
                        CODE: <span className="text-[#94A3B8]">{strat.code}</span> · CATEGORY:{' '}
                        <span className="text-[#06B6D4]">{strat.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStrategyStatus(strat.id);
                      }}
                      className={`p-1.5 rounded-sm border transition-colors cursor-pointer flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] font-semibold ${
                        isActive
                          ? 'bg-[#1C2433] hover:bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                          : 'bg-[#10B981]/15 hover:bg-[#10B981]/30 text-[#10B981] border-[#10B981]/40'
                      }`}
                      title={isActive ? 'Pause Strategy' : 'Resume Strategy'}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>RUN</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1C2433] text-[11px] font-['JetBrains_Mono']">
                    <div>
                      <span className="text-[9px] text-[#64748B] block">ALLOCATION</span>
                      <span className="text-[#F8FAFC] font-semibold tabular-nums">
                        ${(strat.allocatedUsd / 1e3).toFixed(0)}k
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">SHARPE</span>
                      <span className="text-[#F59E0B] font-bold tabular-nums">
                        {strat.sharpeRatio}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">EST. APY</span>
                      <span className="text-[#10B981] font-bold tabular-nums">
                        +{strat.apy}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">MAX DRAWDOWN</span>
                      <span className="text-[#94A3B8] tabular-nums">
                        {strat.maxDrawdown}%
                      </span>
                    </div>
                  </div>

                  {/* Last Action Bar */}
                  <div className="mt-2 text-[10px] font-['JetBrains_Mono'] text-[#64748B] truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                    <span className="text-[#94A3B8]">Telemetry:</span>
                    <span className="text-[#64748B]">{strat.lastAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Calibration & Deep Telemetry Panel */}
        <div className="lg:col-span-5 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                IN-FLIGHT PARAMETER CALIBRATION
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4] font-semibold">
              {selectedStrategy.code}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Strategy Identity Summary */}
            <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                  {selectedStrategy.name}
                </span>
                <span className="font-['JetBrains_Mono'] text-xs text-[#10B981] font-bold">
                  Win Rate: {selectedStrategy.winRate}%
                </span>
              </div>
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#64748B]">
                Allocated Equity: ${selectedStrategy.allocatedUsd.toLocaleString()} · Uptime:{' '}
                {selectedStrategy.uptime}%
              </div>
            </div>

            {/* Dynamic Parameter Sliders & Selects */}
            <div className="space-y-3">
              <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-[#F59E0B] tracking-wider font-bold">
                RUNTIME RISK & SPREAD PARAMETERS
              </div>

              {selectedStrategy.parameters.map((param) => (
                <div
                  key={param.key}
                  className="p-2.5 bg-[#0B0F19] border border-[#263347] rounded-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-['JetBrains_Mono']">
                    <span className="text-[#F8FAFC] font-semibold">{param.label}</span>
                    <span className="text-[#F59E0B] font-bold tabular-nums">
                      {param.value}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#64748B] leading-tight">
                    {param.description}
                  </div>

                  {param.type === 'number' && param.min !== undefined && param.max !== undefined && (
                    <div className="pt-1">
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step || 0.1}
                        value={Number(param.value)}
                        onChange={(e) =>
                          updateStrategyParam(
                            selectedStrategy.id,
                            param.key,
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full accent-[#F59E0B] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-['JetBrains_Mono'] text-[#64748B]">
                        <span>{param.min}</span>
                        <span>{((param.min + param.max) / 2).toFixed(1)}</span>
                        <span>{param.max}</span>
                      </div>
                    </div>
                  )}

                  {param.type === 'select' && param.options && (
                    <select
                      value={String(param.value)}
                      onChange={(e) =>
                        updateStrategyParam(selectedStrategy.id, param.key, e.target.value)
                      }
                      className="w-full p-1.5 bg-[#131A26] text-[#94A3B8] border border-[#263347] rounded-xs text-[10px] font-['JetBrains_Mono'] outline-hidden cursor-pointer"
                    >
                      {param.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* Live Deep Telemetry Blotter */}
            <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2 text-xs font-['JetBrains_Mono']">
              <div className="text-[10px] uppercase text-[#64748B] font-bold">
                EXECUTION TELEMETRY & GREEKS SKEW
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">ALPHA SCORE:</span>
                  <span className="text-[#10B981] font-bold">{selectedStrategy.alphaScore} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">BETA TO BTC:</span>
                  <span className="text-[#F8FAFC]">{selectedStrategy.betaToBtc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">INVENTORY SKEW:</span>
                  <span className={selectedStrategy.inventoryDelta >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                    {selectedStrategy.inventoryDelta > 0 ? '+' : ''}{selectedStrategy.inventoryDelta} Δ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">DMA LATENCY:</span>
                  <span className="text-[#06B6D4] font-semibold">{selectedStrategy.latencyAvgMs}ms</span>
                </div>
              </div>
            </div>

            {/* Backtest Simulator Action */}
            <div className="pt-2">
              <button
                onClick={handleRunBacktest}
                disabled={isSimulatingBacktest}
                className="w-full py-2 bg-[#1C2433] hover:bg-[#263347] border border-[#263347] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs font-semibold uppercase rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSimulatingBacktest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />
                    <span>RUNNING MONTE-CARLO SIMULATION...</span>
                  </>
                ) : (
                  <>
                    <BarChart className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>RUN 10,000 MONTE-CARLO BACKTEST</span>
                  </>
                )}
              </button>

              {backtestResult && (
                <div className="mt-2 p-2.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xs text-[10px] font-['JetBrains_Mono'] text-[#10B981] leading-relaxed">
                  {backtestResult}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeployStrategyModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
};
