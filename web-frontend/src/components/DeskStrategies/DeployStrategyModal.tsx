import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { Strategy } from '../../types/terminal';
import { Cpu, X, PlusCircle, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployStrategyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { deployNewStrategy } = useTerminal();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Strategy['category']>('Arbitrage');
  const [allocatedUsd, setAllocatedUsd] = useState('500000');
  const [targetApy, setTargetApy] = useState('35.0');
  const [targetSharpe, setTargetSharpe] = useState('3.2');
  const [executionRoute, setExecutionRoute] = useState('FPGA_DIRECT_DMA');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    deployNewStrategy({
      name,
      category,
      allocatedUsd: parseFloat(allocatedUsd) || 500000,
      apy: parseFloat(targetApy) || 30.0,
      sharpeRatio: parseFloat(targetSharpe) || 3.0,
      parameters: [
        {
          key: 'executionBandBps',
          label: 'Delta Trigger Band (bps)',
          value: 2.5,
          type: 'number',
          min: 0.5,
          max: 10,
          step: 0.1,
          description: 'Minimum delta spread before firing execution legs',
        },
        {
          key: 'maxInventoryCap',
          label: 'Max Inventory Skew ($)',
          value: 50000,
          type: 'number',
          min: 5000,
          max: 200000,
          step: 5000,
          description: 'Risk hard cap for open unhedged exposure',
        },
      ],
    });

    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#131A26] border border-[#F59E0B]/50 rounded shadow-[0_0_30px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                DEPLOY QUANTITATIVE STRATEGY CONTAINER
              </h2>
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#64748B]">
                PROVISION LOW-LATENCY AUTONOMOUS TRADING ENGINE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#263347] rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
              STRATEGY CONTAINER NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adaptive OFI Liquidity Scalper v2"
              className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] rounded-sm outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
                STRATEGY CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Strategy['category'])}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] rounded-sm outline-hidden cursor-pointer"
              >
                <option value="Arbitrage">Arbitrage (Cross-Exchange)</option>
                <option value="Market Making">Market Making (Avellaneda)</option>
                <option value="Momentum">Momentum (Order Flow Imbalance)</option>
                <option value="Volatility">Volatility (Surface Skew)</option>
                <option value="Liquidity Sweep">Liquidity Sweep (VWAP/Dark Pool)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
                CAPITAL ALLOCATION (USD)
              </label>
              <input
                type="number"
                value={allocatedUsd}
                onChange={(e) => setAllocatedUsd(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] rounded-sm outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
                TARGET APY (%)
              </label>
              <input
                type="number"
                value={targetApy}
                onChange={(e) => setTargetApy(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] rounded-sm outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
                TARGET SHARPE RATIO
              </label>
              <input
                type="number"
                step="0.1"
                value={targetSharpe}
                onChange={(e) => setTargetSharpe(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] rounded-sm outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
              EXECUTION PIPELINE ROUTE
            </label>
            <select
              value={executionRoute}
              onChange={(e) => setExecutionRoute(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] rounded-sm outline-hidden cursor-pointer"
            >
              <option value="FPGA_DIRECT_DMA">FPGA Direct DMA NIC (sub-microsecond)</option>
              <option value="KERNEL_BYPASS_DPDK">Kernel Bypass DPDK (1.1ms latency)</option>
              <option value="STANDARD_REST_FIX">Standard FIX Protocol 4.4 Session</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#263347] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#0B0F19] hover:bg-[#263347] text-[#94A3B8] font-['JetBrains_Mono'] text-xs font-semibold uppercase rounded-sm border border-[#263347] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded-sm transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>DEPLOY STRATEGY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
