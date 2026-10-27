import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../context/TerminalContext';
import { Search, ArrowRight, ShieldAlert, Cpu, BarChart2, Zap, Terminal, CreditCard, Building2 } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveDesk,
    setSelectedAssetSymbol,
    assets,
    openKillSwitchModal,
    soundEnabled,
    setSoundEnabled,
    toggleStreaming,
    openPaymentModal,
  } = useTerminal();

  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    category: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'desk-exec',
      title: 'Jump to Execution & Blotter [Desk 1]',
      category: 'Desks',
      icon: <BarChart2 className="w-4 h-4 text-[#F59E0B]" />,
      action: () => setActiveDesk('execution'),
    },
    {
      id: 'desk-strat',
      title: 'Jump to Quantitative Strategies Fleet [Desk 2]',
      category: 'Desks',
      icon: <Cpu className="w-4 h-4 text-[#06B6D4]" />,
      action: () => setActiveDesk('strategies'),
    },
    {
      id: 'desk-flow',
      title: 'Jump to Order Flow & Microstructure [Desk 3]',
      category: 'Desks',
      icon: <Zap className="w-4 h-4 text-[#10B981]" />,
      action: () => setActiveDesk('orderflow'),
    },
    {
      id: 'desk-risk',
      title: 'Jump to Risk Matrix & Stress Testing [Desk 4]',
      category: 'Desks',
      icon: <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />,
      action: () => setActiveDesk('risk'),
    },
    {
      id: 'desk-diag',
      title: 'Jump to Colocation & System Telemetry [Desk 5]',
      category: 'Desks',
      icon: <Terminal className="w-4 h-4 text-[#94A3B8]" />,
      action: () => setActiveDesk('diagnostics'),
    },
    {
      id: 'desk-treasury',
      title: 'Jump to Treasury & Settlement Desk [Desk 6]',
      category: 'Desks',
      icon: <Building2 className="w-4 h-4 text-[#F59E0B]" />,
      action: () => setActiveDesk('treasury'),
    },
    // Payment Gateway
    {
      id: 'cmd-payment',
      title: 'OPEN PAYMENT GATEWAY (Deposit via Crypto MPC, Fedwire, Corporate Card)',
      category: 'Payment Gateway',
      icon: <CreditCard className="w-4 h-4 text-[#F59E0B]" />,
      action: () => openPaymentModal(),
    },
    // Instruments
    ...assets.map((a) => ({
      id: `asset-${a.symbol}`,
      title: `Switch active instrument to ${a.symbol} ($${a.price.toLocaleString()})`,
      category: 'Instruments',
      icon: <ArrowRight className="w-4 h-4 text-[#F59E0B]" />,
      action: () => setSelectedAssetSymbol(a.symbol),
    })),
    // Emergency & Controls
    {
      id: 'cmd-kill',
      title: 'ARM EMERGENCY KILL SWITCH (Full Portfolio Flatten)',
      category: 'Emergency Protocol',
      icon: <ShieldAlert className="w-4 h-4 text-[#EF4444]" />,
      action: () => openKillSwitchModal(),
    },
    {
      id: 'cmd-audio',
      title: soundEnabled ? 'Mute terminal audio feedback' : 'Unmute terminal acoustic feedback',
      category: 'Controls',
      icon: <Terminal className="w-4 h-4 text-[#94A3B8]" />,
      action: () => setSoundEnabled(!soundEnabled),
    },
    {
      id: 'cmd-stream',
      title: 'Toggle real-time streaming market tick engine',
      category: 'Controls',
      icon: <Zap className="w-4 h-4 text-[#06B6D4]" />,
      action: () => toggleStreaming(),
    },
  ];

  const filtered = allCommands.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-xs p-4"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#131A26] border border-[#263347] rounded shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#263347] bg-[#0B0F19]">
          <Search className="w-4 h-4 text-[#F59E0B] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to instrument (e.g. BTC, Risk, Kill, Desk)..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] font-['JetBrains_Mono'] outline-hidden"
          />
          <kbd className="text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 bg-[#1C2433] text-[#94A3B8] border border-[#263347] rounded-sm">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs font-['JetBrains_Mono'] text-[#64748B]">
              No command matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setCommandPaletteOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#1C2433] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1 bg-[#0B0F19] rounded-sm border border-[#263347] group-hover:border-[#F59E0B]/50 transition-colors">
                    {item.icon}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-xs text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
