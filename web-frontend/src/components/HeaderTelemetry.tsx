import React, { useState } from 'react';
import { useTerminal } from '../context/TerminalContext';
import { DeskId } from '../types/terminal';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Command,
  ShieldAlert,
  Server,
  Zap,
  CreditCard,
  ArrowUpDown,
} from 'lucide-react';

export const HeaderTelemetry: React.FC = () => {
  const {
    activeDesk,
    setActiveDesk,
    selectedAsset,
    setSelectedAssetSymbol,
    assets,
    isStreaming,
    toggleStreaming,
    latencyMs,
    openKillSwitchModal,
    killSwitchArmed,
    setCommandPaletteOpen,
    soundEnabled,
    setSoundEnabled,
    risk,
    openPaymentModal,
    viewMode,
    toggleViewMode,
  } = useTerminal();

  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);

  const desks: { id: DeskId; label: string; shortcut: string }[] = [
    { id: 'execution', label: 'EXECUTION & BLOTTER', shortcut: '1' },
    { id: 'strategies', label: 'QUANT STRATEGIES', shortcut: '2' },
    { id: 'orderflow', label: 'ORDER FLOW & MICROSTRUCTURE', shortcut: '3' },
    { id: 'risk', label: 'RISK MATRIX & STRESS TEST', shortcut: '4' },
    { id: 'diagnostics', label: 'COLOCATION & TELEMETRY', shortcut: '5' },
    { id: 'treasury', label: 'TREASURY & SETTLEMENT', shortcut: '6' },
  ];

  return (
    <header className="bg-[#131A26] border-b border-[#263347] select-none sticky top-0 z-40">
      {/* Top telemetry bar */}
      <div className="px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#263347]/60 text-xs">
        {/* Left: Brand & Instrument dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-[#263347]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
            <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#F8FAFC]">
              NEXUS<span className="text-[#F59E0B] mx-1">/</span>ALGO
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] tracking-wider uppercase">
              INSTITUTIONAL v4.2
            </span>
          </div>

          {/* Instrument Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAssetDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2.5 py-1 bg-[#0B0F19] hover:bg-[#1C2433] border border-[#263347] rounded-sm transition-colors cursor-pointer text-left"
            >
              <span className="font-['JetBrains_Mono'] font-bold text-sm text-[#F8FAFC]">
                {selectedAsset.symbol}
              </span>
              <span
                className={`font-['JetBrains_Mono'] text-xs font-semibold tabular-nums ${
                  selectedAsset.change24h >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`font-['JetBrains_Mono'] text-[11px] tabular-nums ${
                  selectedAsset.change24hPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {selectedAsset.change24hPercent >= 0 ? '+' : ''}
                {selectedAsset.change24hPercent}%
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {assetDropdownOpen && (
              <div
                className="absolute left-0 mt-1 w-72 bg-[#1C2433] border border-[#263347] rounded-sm shadow-2xl z-50 py-1"
                onMouseLeave={() => setAssetDropdownOpen(false)}
              >
                <div className="px-3 py-1 font-['JetBrains_Mono'] text-[10px] uppercase text-[#64748B] border-b border-[#263347]">
                  Active Instruments
                </div>
                {assets.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      setSelectedAssetSymbol(item.symbol);
                      setAssetDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-[#263347] transition-colors cursor-pointer ${
                      item.symbol === selectedAsset.symbol ? 'bg-[#263347]/70 border-l-2 border-[#F59E0B]' : ''
                    }`}
                  >
                    <div>
                      <div className="font-['JetBrains_Mono'] font-semibold text-xs text-[#F8FAFC]">
                        {item.symbol}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Vol: ${(item.volume24h / 1e6).toFixed(1)}M
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-['JetBrains_Mono'] text-xs text-[#F8FAFC] tabular-nums">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: item.tickSize < 0.01 ? 3 : 2 })}
                      </div>
                      <div
                        className={`font-['JetBrains_Mono'] text-[10px] tabular-nums ${
                          item.change24hPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}
                      >
                        {item.change24hPercent >= 0 ? '+' : ''}
                        {item.change24hPercent}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats for selected asset */}
          <div className="hidden xl:flex items-center gap-4 text-[11px] font-['JetBrains_Mono'] text-[#94A3B8]">
            <div>
              <span className="text-[#64748B]">24H HIGH:</span>{' '}
              <span className="text-[#F8FAFC] tabular-nums">${selectedAsset.high24h.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#64748B]">24H LOW:</span>{' '}
              <span className="text-[#F8FAFC] tabular-nums">${selectedAsset.low24h.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#64748B]">24H VOL:</span>{' '}
              <span className="text-[#F8FAFC] tabular-nums">${(selectedAsset.volume24h / 1e9).toFixed(2)}B</span>
            </div>
            <div>
              <span className="text-[#64748B]">FUNDING (8H):</span>{' '}
              <span className={selectedAsset.fundingRate >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                {(selectedAsset.fundingRate * 100).toFixed(4)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Chips, Account Health & Emergency Kill Switch */}
        <div className="flex items-center gap-2.5">
          {/* WebSocket stream status tag */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#06B6D4]/10 border border-[#06B6D4]/25 text-[#06B6D4] font-['JetBrains_Mono'] text-[11px] rounded-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStreaming ? 'bg-[#06B6D4] shadow-[0_0_6px_#06B6D4] animate-pulse-subtle' : 'bg-[#EF4444]'
              }`}
            />
            <span>{isStreaming ? 'L2 STREAM' : 'STREAM PAUSED'}</span>
            <span className="text-[#64748B]">|</span>
            <span className="tabular-nums font-semibold">{latencyMs}ms</span>
          </div>

          {/* FIX Engine tag */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-[#1C2433] border border-[#263347] font-['JetBrains_Mono'] text-[11px] text-[#94A3B8] rounded-sm">
            <Server className="w-3 h-3 text-[#10B981]" />
            <span>FIX 4.4:</span>
            <span className="text-[#10B981] font-semibold">TY3_CONN</span>
          </div>

          {/* Account Equity summary */}
          <div className="hidden md:flex items-center gap-3 px-2 py-0.5 bg-[#0B0F19] border border-[#263347] rounded-sm font-['JetBrains_Mono'] text-[11px]">
            <div>
              <span className="text-[#64748B]">EQUITY:</span>{' '}
              <span className="text-[#F8FAFC] font-semibold tabular-nums">
                ${risk.totalEquityUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#64748B]">24H PnL:</span>{' '}
              <span className="text-[#10B981] font-semibold tabular-nums">+$142,390 (+3.47%)</span>
            </div>
            <div>
              <span className="text-[#64748B]">MARGIN:</span>{' '}
              <span
                className={`font-semibold tabular-nums ${
                  risk.marginUtilizationPercent > 70 ? 'text-[#EF4444]' : 'text-[#06B6D4]'
                }`}
              >
                {risk.marginUtilizationPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Command Palette button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Open Command Palette (Ctrl+K)"
            className="flex items-center gap-1 px-2 py-1 bg-[#1C2433] hover:bg-[#263347] border border-[#263347] text-[#94A3B8] hover:text-[#F8FAFC] rounded-sm transition-colors cursor-pointer text-[11px] font-['JetBrains_Mono']"
          >
            <Command className="w-3 h-3 text-[#F59E0B]" />
            <span className="hidden sm:inline">CMD</span>
            <kbd className="px-1 py-0.2 bg-[#0B0F19] rounded text-[9px] text-[#64748B]">⌘K</kbd>
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Terminal Audio' : 'Enable Terminal Audio'}
            className="p-1 bg-[#1C2433] hover:bg-[#263347] border border-[#263347] text-[#94A3B8] hover:text-[#F8FAFC] rounded-sm transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#10B981]" /> : <VolumeX className="w-3.5 h-3.5 text-[#64748B]" />}
          </button>

          {/* Stream Play/Pause */}
          <button
            onClick={toggleStreaming}
            title={isStreaming ? 'Pause Real-Time Simulation' : 'Resume Real-Time Simulation'}
            className="p-1 bg-[#1C2433] hover:bg-[#263347] border border-[#263347] text-[#94A3B8] hover:text-[#F8FAFC] rounded-sm transition-colors cursor-pointer"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Play className="w-3.5 h-3.5 text-[#10B981]" />}
          </button>

          {/* View Mode Toggle: Scrollable vs Docked */}
          <button
            onClick={toggleViewMode}
            title={viewMode === 'scrollable' ? 'Current: Scrollable Page View (Click to lock to Docked 100vh View)' : 'Current: Docked View (Click to switch to Scrollable Page)'}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#1C2433] hover:bg-[#263347] border border-[#263347] text-[#94A3B8] hover:text-[#F8FAFC] rounded-sm transition-colors cursor-pointer text-[11px] font-['JetBrains_Mono']"
          >
            <ArrowUpDown className="w-3 h-3 text-[#06B6D4]" />
            <span className="hidden sm:inline">{viewMode === 'scrollable' ? 'SCROLL: ON' : 'DOCKED'}</span>
          </button>

          {/* PAYMENT GATEWAY / FUND MARGIN BUTTON */}
          <button
            onClick={openPaymentModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded-sm cursor-pointer transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] focus:ring-1 focus:ring-[#FBBF24]"
            title="Deposit Margin Collateral via Crypto MPC, Fedwire, or Card"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>DEPOSIT / GATEWAY</span>
          </button>

          {/* EMERGENCY SYSTEM KILL SWITCH */}
          <button
            onClick={openKillSwitchModal}
            className={`flex items-center gap-1.5 px-3 py-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-['JetBrains_Mono'] font-bold text-xs uppercase rounded-sm cursor-pointer transition-all ${
              killSwitchArmed ? 'ring-2 ring-[#EF4444] animate-pulse' : 'shadow-[0_0_12px_rgba(239,68,68,0.4)]'
            }`}
            title="Instant Cancel All Orders & Flatten Portfolio (Key: K)"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>KILL SWITCH</span>
            <kbd className="hidden sm:inline text-[9px] bg-[#991B1B] px-1 py-0.2 rounded font-normal opacity-90">K</kbd>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center px-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1">
          {desks.map((desk) => {
            const isActive = activeDesk === desk.id;
            return (
              <button
                key={desk.id}
                onClick={() => setActiveDesk(desk.id)}
                className={`relative px-4 py-2 font-['JetBrains_Mono'] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive ? 'text-[#F8FAFC] font-semibold' : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1C2433]/40'
                }`}
              >
                <span>{desk.label}</span>
                <span className={`text-[10px] px-1 rounded-sm ${isActive ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#0B0F19] text-[#64748B]'}`}>
                  {desk.shortcut}
                </span>

                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
