import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { Server, Activity, Terminal, Shield, Cpu, Wifi, CheckCircle2 } from 'lucide-react';

export const DeskDiagnostics: React.FC = () => {
  const { coloNodes, logs, latencyMs } = useTerminal();
  const [logFilter, setLogFilter] = useState<string>('ALL');

  const filteredLogs = logFilter === 'ALL'
    ? logs
    : logs.filter((l) => l.level === logFilter);

  return (
    <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-0 select-none">
      {/* Top Infrastructure Strip */}
      <div className="bg-[#131A26] border border-[#263347] rounded-sm p-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            PRIMARY COLO ROUTE
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#06B6D4] tabular-nums">
            TY3 [EQUINIX TOKYO]
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            LIVE FIBER RTT LATENCY
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] tabular-nums">
            {latencyMs}ms (JITTER 0.04ms)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            PACKET LOSS RATE
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] tabular-nums">
            0.000% (ZERO DROP)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            FPGA DIRECT DMA
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F59E0B] tabular-nums">
            ONLINE (XILINX U50)
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            FIX 4.4 SESSIONS
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <span>5/5 SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Colocation Nodes (6 cols) + Right Realtime Terminal Logs (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-[500px]">
        {/* Colocation Clusters Matrix */}
        <div className="lg:col-span-6 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                GLOBAL LOW-LATENCY COLOCATION MESH
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#10B981]">
              ALL NODES OPTIMAL
            </span>
          </div>

          <div className="p-2 space-y-2 flex-1 overflow-y-auto">
            {coloNodes.map((node) => (
              <div
                key={node.id}
                className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2 hover:border-[#334155] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                      {node.name}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] text-[9px] font-['JetBrains_Mono'] font-bold rounded-xs">
                      {node.coloCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#10B981]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>{node.latencyMs}ms</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] font-['JetBrains_Mono'] pt-2 border-t border-[#1C2433]">
                  <div>
                    <span className="text-[#64748B] block">LOCATION</span>
                    <span className="text-[#94A3B8]">{node.city}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">JITTER</span>
                    <span className="text-[#F8FAFC] tabular-nums">{node.jitterMs}ms</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">PACKET LOSS</span>
                    <span className="text-[#10B981] tabular-nums">{node.packetLossPercent}%</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">FPGA NIC</span>
                    <span className={node.fpgaEnabled ? 'text-[#F59E0B] font-semibold' : 'text-[#64748B]'}>
                      {node.fpgaEnabled ? 'ACTIVE' : 'STANDARD'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Subsystem Health Gauges */}
            <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2 font-['JetBrains_Mono'] text-xs">
              <div className="text-[10px] uppercase text-[#64748B] font-bold">
                CORE SYSTEM ENGINE HEALTH
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-[#131A26] border border-[#263347] rounded-xs">
                  <span className="text-[#64748B] text-[9px] block">JVM / V8 HEAP</span>
                  <span className="text-[#F8FAFC] font-semibold">48.2 MB / 512 MB</span>
                </div>
                <div className="p-2 bg-[#131A26] border border-[#263347] rounded-xs">
                  <span className="text-[#64748B] text-[9px] block">GC PAUSE DURATION</span>
                  <span className="text-[#10B981] font-semibold">0.18ms MAX</span>
                </div>
                <div className="p-2 bg-[#131A26] border border-[#263347] rounded-xs">
                  <span className="text-[#64748B] text-[9px] block">SOCKET DISPATCH</span>
                  <span className="text-[#06B6D4] font-semibold">482 msgs / sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Realtime Terminal Diagnostic Logs */}
        <div className="lg:col-span-6 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                SYSTEM AUDIT TRAIL & LOG STREAM
              </span>
            </div>

            <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[10px]">
              {['ALL', 'EXEC', 'RISK_ALERT', 'INFO'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                    logFilter === filter
                      ? 'bg-[#F59E0B] text-[#0B0F19] font-bold'
                      : 'bg-[#0B0F19] text-[#64748B] hover:text-[#F8FAFC]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0B0F19] p-3 overflow-y-auto space-y-2 font-['JetBrains_Mono'] text-xs">
            {filteredLogs.map((log) => {
              let badgeColor = 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30';
              if (log.level === 'EXEC') badgeColor = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
              if (log.level === 'RISK_ALERT' || log.level === 'ERROR')
                badgeColor = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';

              return (
                <div
                  key={log.id}
                  className="p-2 bg-[#131A26]/80 border border-[#263347]/80 rounded-xs flex items-start gap-2.5 text-[11px] leading-relaxed hover:border-[#334155] transition-colors"
                >
                  <span className="text-[#64748B] shrink-0">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-xs border text-[9px] font-bold uppercase shrink-0 ${badgeColor}`}
                  >
                    {log.level}
                  </span>
                  <span className="text-[#06B6D4] font-semibold shrink-0">[{log.subsystem}]</span>
                  <span className="text-[#F8FAFC] break-words flex-1">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
