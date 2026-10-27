import React, { useState } from 'react';
import { useTerminal } from '../context/TerminalContext';
import { AlertOctagon, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const KillSwitchModal: React.FC = () => {
  const { isKillSwitchModalOpen, closeKillSwitchModal, executeEmergencyKill, positions, orders } = useTerminal();
  const [selectedMode, setSelectedMode] = useState<'FULL_FLATTEN' | 'CANCEL_ORDERS' | 'HALT_ALGO'>('FULL_FLATTEN');
  const [confirmedText, setConfirmedText] = useState('');

  if (!isKillSwitchModalOpen) return null;

  const totalNotional = positions.reduce((acc, p) => acc + p.notionalUsd, 0);

  const handleExecute = () => {
    executeEmergencyKill(selectedMode);
    setConfirmedText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl bg-[#131A26] border-2 border-[#EF4444] rounded shadow-[0_0_40px_rgba(239,68,68,0.35)] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-[#EF4444]/20 rounded-sm">
              <AlertOctagon className="w-5 h-5 text-[#EF4444] animate-pulse" />
            </span>
            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-base text-[#F8FAFC] tracking-wide">
                EMERGENCY SYSTEM KILL SWITCH // LEVEL 3 INTERRUPT
              </h2>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#EF4444]">
                HARD CIRCUIT BREAKER INTERVENTION — PROTOCOL 99.4
              </p>
            </div>
          </div>
          <button
            onClick={closeKillSwitchModal}
            className="p-1 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#263347] rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Exposure Summary Banner */}
          <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm grid grid-cols-3 gap-2 text-center font-['JetBrains_Mono'] text-xs">
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">Open Positions</div>
              <div className="text-sm font-bold text-[#F8FAFC] tabular-nums">{positions.length} active</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">Notional at Risk</div>
              <div className="text-sm font-bold text-[#EF4444] tabular-nums">
                ${totalNotional.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">Resting Orders</div>
              <div className="text-sm font-bold text-[#F59E0B] tabular-nums">
                {orders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED').length} blotters
              </div>
            </div>
          </div>

          {/* Action Mode Selection */}
          <div className="space-y-2">
            <label className="block font-['JetBrains_Mono'] text-xs text-[#94A3B8] uppercase">
              Select Emergency Liquidation Scope:
            </label>

            <button
              onClick={() => setSelectedMode('FULL_FLATTEN')}
              className={`w-full p-3 text-left border rounded-sm transition-colors cursor-pointer flex items-start gap-3 ${
                selectedMode === 'FULL_FLATTEN'
                  ? 'bg-[#EF4444]/15 border-[#EF4444] text-[#F8FAFC]'
                  : 'bg-[#0B0F19] border-[#263347] text-[#94A3B8] hover:bg-[#1C2433]'
              }`}
            >
              <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${selectedMode === 'FULL_FLATTEN' ? 'text-[#EF4444]' : 'text-[#64748B]'}`} />
              <div>
                <div className="font-['JetBrains_Mono'] font-bold text-xs uppercase text-[#EF4444]">
                  [OPTION A] HARD FLATTEN & PURGE ALL (RECOMMENDED FOR CRISIS)
                </div>
                <div className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Cancels 100% of open resting orders across all connected exchanges, initiates aggressive market IOC fills to flatten every position to USDC/cash, and terminates all active algorithmic trading daemons.
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('CANCEL_ORDERS')}
              className={`w-full p-3 text-left border rounded-sm transition-colors cursor-pointer flex items-start gap-3 ${
                selectedMode === 'CANCEL_ORDERS'
                  ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F8FAFC]'
                  : 'bg-[#0B0F19] border-[#263347] text-[#94A3B8] hover:bg-[#1C2433]'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${selectedMode === 'CANCEL_ORDERS' ? 'text-[#F59E0B]' : 'text-[#64748B]'}`} />
              <div>
                <div className="font-['JetBrains_Mono'] font-bold text-xs uppercase text-[#F59E0B]">
                  [OPTION B] CANCEL RESTING BLOTTER ORDERS ONLY
                </div>
                <div className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Preserves existing inventory and directional positions. Immediately broadcasts mass FIX cancel-all commands to eliminate market exposure to adverse sweeps.
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('HALT_ALGO')}
              className={`w-full p-3 text-left border rounded-sm transition-colors cursor-pointer flex items-start gap-3 ${
                selectedMode === 'HALT_ALGO'
                  ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#F8FAFC]'
                  : 'bg-[#0B0F19] border-[#263347] text-[#94A3B8] hover:bg-[#1C2433]'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${selectedMode === 'HALT_ALGO' ? 'text-[#06B6D4]' : 'text-[#64748B]'}`} />
              <div>
                <div className="font-['JetBrains_Mono'] font-bold text-xs uppercase text-[#06B6D4]">
                  [OPTION C] HALT QUANTITATIVE ALGORITHMIC ENGINES
                </div>
                <div className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Leaves positions and resting quotes unchanged, but flips all 5 algorithmic strategy loops into PAUSED mode to halt autonomous rebalancing.
                </div>
              </div>
            </button>
          </div>

          {/* Safety Confirm Input */}
          <div className="pt-2">
            <div className="text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1.5">
              Type <span className="text-[#EF4444] font-bold">KILL</span> to unlock emergency override:
            </div>
            <input
              type="text"
              value={confirmedText}
              onChange={(e) => setConfirmedText(e.target.value.toUpperCase())}
              placeholder="KILL"
              className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#EF4444] text-[#F8FAFC] font-['JetBrains_Mono'] text-sm tracking-widest uppercase rounded-sm outline-hidden"
              autoFocus
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 bg-[#1C2433] border-t border-[#263347] flex items-center justify-between">
          <button
            onClick={closeKillSwitchModal}
            className="px-4 py-2 bg-[#0B0F19] hover:bg-[#263347] text-[#94A3B8] hover:text-[#F8FAFC] font-['JetBrains_Mono'] text-xs font-semibold uppercase rounded-sm border border-[#263347] transition-colors cursor-pointer"
          >
            Abort / Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={confirmedText !== 'KILL'}
            className={`px-5 py-2 font-['JetBrains_Mono'] text-xs font-bold uppercase rounded-sm transition-all cursor-pointer ${
              confirmedText === 'KILL'
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-[#263347] text-[#64748B] cursor-not-allowed'
            }`}
          >
            CONFIRM EMERGENCY EXECUTION
          </button>
        </div>
      </div>
    </div>
  );
};
