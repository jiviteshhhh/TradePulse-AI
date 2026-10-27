import React, { useState, useEffect } from 'react';
import { useTerminal } from '../context/TerminalContext';
import { Server, Wifi, Activity, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const BottomStatusBar: React.FC = () => {
  const { latencyMs, isStreaming, notificationMessage, clearNotification } = useTerminal();
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').replace('Z', ' UTC');
      setUtcTime(iso);
    };
    updateTime();
    const interval = setInterval(updateTime, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative bg-[#131A26] border-t border-[#263347] px-3 py-1 text-[11px] font-['JetBrains_Mono'] select-none flex flex-wrap items-center justify-between gap-2 z-30">
      {/* Toast Notification Banner if present */}
      {notificationMessage && (
        <div
          className={`absolute bottom-8 right-4 px-3 py-1.5 rounded-sm border shadow-xl flex items-center gap-2 z-50 text-xs font-['JetBrains_Mono'] transition-all animate-bounce ${
            notificationMessage.type === 'success'
              ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
              : notificationMessage.type === 'danger'
              ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
              : 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4]'
          }`}
        >
          {notificationMessage.type === 'success' ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          <span>{notificationMessage.text}</span>
          <button
            onClick={clearNotification}
            className="ml-2 hover:opacity-80 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Left: Engine & Heartbeat */}
      <div className="flex items-center gap-3 text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isStreaming ? 'bg-[#10B981] shadow-[0_0_6px_#10B981]' : 'bg-[#EF4444]'
            }`}
          />
          <span className="text-[#F8FAFC] font-semibold">FEED ENGINE:</span>
          <span className={isStreaming ? 'text-[#10B981]' : 'text-[#EF4444]'}>
            {isStreaming ? 'NOMINAL' : 'PAUSED'}
          </span>
        </div>

        <span className="hidden sm:inline text-[#263347]">|</span>

        <div className="hidden sm:flex items-center gap-1">
          <span>COLO RTT:</span>
          <span className="text-[#06B6D4] font-semibold tabular-nums">{latencyMs}ms</span>
        </div>

        <span className="hidden md:inline text-[#263347]">|</span>

        <div className="hidden md:flex items-center gap-1">
          <span>FPGA DMA:</span>
          <span className="text-[#F59E0B] font-semibold">DIRECT_XILINX</span>
        </div>
      </div>

      {/* Center: Keyboard shortcuts */}
      <div className="hidden xl:flex items-center gap-3 text-[10px] text-[#64748B]">
        <span>
          <kbd className="px-1 py-0.2 bg-[#0B0F19] text-[#94A3B8] border border-[#263347] rounded-xs">1-6</kbd>{' '}
          DESKS
        </span>
        <span>
          <kbd className="px-1 py-0.2 bg-[#0B0F19] text-[#EF4444] border border-[#EF4444]/40 rounded-xs font-bold">K</kbd>{' '}
          KILL SWITCH
        </span>
        <span>
          <kbd className="px-1 py-0.2 bg-[#0B0F19] text-[#F59E0B] border border-[#263347] rounded-xs">⌘K</kbd>{' '}
          COMMANDS
        </span>
      </div>

      {/* Right: Realtime UTC Clock */}
      <div className="flex items-center gap-2 text-[#94A3B8]">
        <span className="tabular-nums text-[#F8FAFC] font-semibold">{utcTime}</span>
      </div>
    </footer>
  );
};
