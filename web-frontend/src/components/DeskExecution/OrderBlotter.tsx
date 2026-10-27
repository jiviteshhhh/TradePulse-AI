import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { Position, AlgoOrder } from '../../types/terminal';
import { ShieldAlert, XCircle, CheckCircle, Clock, ExternalLink, Edit3, ArrowRight } from 'lucide-react';

export const OrderBlotter: React.FC = () => {
  const { positions, orders, closePosition, cancelOrder, updatePositionTpSl, trades } = useTerminal();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'fills'>('positions');
  const [editingTpSlId, setEditingTpSlId] = useState<string | null>(null);
  const [tempTp, setTempTp] = useState<string>('');
  const [tempSl, setTempSl] = useState<string>('');

  const openOrders = orders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED');

  const startEditTpSl = (pos: Position) => {
    setEditingTpSlId(pos.id);
    setTempTp(pos.tpPrice ? pos.tpPrice.toString() : '');
    setTempSl(pos.slPrice ? pos.slPrice.toString() : '');
  };

  const saveTpSl = (posId: string) => {
    updatePositionTpSl(
      posId,
      tempTp ? parseFloat(tempTp) : undefined,
      tempSl ? parseFloat(tempSl) : undefined
    );
    setEditingTpSlId(null);
  };

  return (
    <div className="bg-[#131A26] border border-[#263347] rounded-sm flex flex-col h-full select-none overflow-hidden">
      {/* Blotter Tab Navigation */}
      <div className="px-3 py-1.5 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1 font-['JetBrains_Mono'] text-xs font-semibold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-[#0B0F19] text-[#F8FAFC] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <span>OPEN POSITIONS</span>
            <span className="px-1.5 py-0.2 bg-[#1C2433] text-[#F59E0B] text-[10px] rounded-xs font-bold">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 font-['JetBrains_Mono'] text-xs font-semibold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#0B0F19] text-[#F8FAFC] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <span>ACTIVE ALGO ORDERS</span>
            <span className="px-1.5 py-0.2 bg-[#1C2433] text-[#06B6D4] text-[10px] rounded-xs font-bold">
              {openOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fills')}
            className={`px-3 py-1 font-['JetBrains_Mono'] text-xs font-semibold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fills'
                ? 'bg-[#0B0F19] text-[#F8FAFC] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <span>EXECUTION FILLS</span>
            <span className="px-1.5 py-0.2 bg-[#1C2433] text-[#94A3B8] text-[10px] rounded-xs font-bold">
              {trades.length}
            </span>
          </button>
        </div>

        <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B]">
          COLLATERAL: <span className="text-[#F8FAFC]">MULTI-ASSET CROSS</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {activeTab === 'positions' && (
          <div className="min-w-[850px]">
            {/* Table Header */}
            <div className="grid grid-cols-10 px-3 py-1.5 bg-[#0B0F19] border-b border-[#263347] text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B]">
              <span className="col-span-2">INSTRUMENT / SIDE</span>
              <span>SIZE</span>
              <span>ENTRY PRICE</span>
              <span>MARK PRICE</span>
              <span>LIQ. PRICE</span>
              <span>MARGIN RATIO</span>
              <span className="text-right">UNREALIZED PnL</span>
              <span className="text-center">TP / SL</span>
              <span className="text-right">ACTIONS</span>
            </div>

            {/* Position Rows */}
            {positions.length === 0 ? (
              <div className="p-8 text-center text-xs font-['JetBrains_Mono'] text-[#64748B]">
                No active positions. Execute an order in the ticket to open exposure.
              </div>
            ) : (
              positions.map((pos) => {
                const isLong = pos.side === 'long';
                const isEditing = editingTpSlId === pos.id;

                return (
                  <div
                    key={pos.id}
                    className={`grid grid-cols-10 px-3 py-2 items-center text-xs font-['JetBrains_Mono'] border-b border-[#1C2433] hover:bg-[#1C2433]/60 transition-colors ${
                      isLong ? 'border-l-3 border-l-[#10B981]' : 'border-l-3 border-l-[#EF4444]'
                    }`}
                  >
                    {/* Instrument & Side */}
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-bold text-[#F8FAFC]">{pos.symbol}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold uppercase ${
                          isLong
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                        }`}
                      >
                        {pos.side} {pos.leverage}x
                      </span>
                      <span className="text-[9px] text-[#64748B] hidden lg:inline">{pos.venue}</span>
                    </div>

                    {/* Size & Notional */}
                    <div>
                      <div className="font-semibold text-[#F8FAFC] tabular-nums">
                        {pos.size.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#64748B] tabular-nums">
                        ${pos.notionalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    {/* Entry Price */}
                    <div className="text-[#94A3B8] tabular-nums">
                      ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>

                    {/* Mark Price */}
                    <div className="text-[#F8FAFC] font-semibold tabular-nums">
                      ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>

                    {/* Liq Price */}
                    <div className="text-[#EF4444] tabular-nums">
                      ${pos.liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>

                    {/* Margin Ratio */}
                    <div>
                      <span
                        className={`font-semibold tabular-nums ${
                          pos.marginRatio > 0.15 ? 'text-[#EF4444]' : 'text-[#06B6D4]'
                        }`}
                      >
                        {(pos.marginRatio * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Unrealized PnL */}
                    <div className="text-right">
                      <div
                        className={`font-bold tabular-nums ${
                          pos.unrealizedPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}
                      >
                        {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`text-[10px] tabular-nums ${
                          pos.unrealizedPnlPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}
                      >
                        ({pos.unrealizedPnlPercent >= 0 ? '+' : ''}{pos.unrealizedPnlPercent}%)
                      </div>
                    </div>

                    {/* TP / SL */}
                    <div className="text-center text-[10px]">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 items-center">
                          <input
                            type="number"
                            placeholder="TP"
                            value={tempTp}
                            onChange={(e) => setTempTp(e.target.value)}
                            className="w-16 px-1 py-0.5 bg-[#0B0F19] border border-[#263347] text-[#10B981] text-[9px] rounded-xs"
                          />
                          <input
                            type="number"
                            placeholder="SL"
                            value={tempSl}
                            onChange={(e) => setTempSl(e.target.value)}
                            className="w-16 px-1 py-0.5 bg-[#0B0F19] border border-[#263347] text-[#EF4444] text-[9px] rounded-xs"
                          />
                          <button
                            onClick={() => saveTpSl(pos.id)}
                            className="text-[9px] text-[#F59E0B] hover:underline cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditTpSl(pos)}
                          className="hover:bg-[#1C2433] p-1 rounded-xs cursor-pointer group"
                        >
                          <div className="text-[#10B981]">TP: {pos.tpPrice ? `$${pos.tpPrice}` : 'None'}</div>
                          <div className="text-[#EF4444]">SL: {pos.slPrice ? `$${pos.slPrice}` : 'None'}</div>
                          <span className="text-[8px] text-[#64748B] group-hover:text-[#F59E0B]">Edit</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-2 py-1 bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/30 rounded-xs text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        title="Instant Market Close"
                      >
                        CLOSE MKT
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="min-w-[850px]">
            {/* Orders Header */}
            <div className="grid grid-cols-8 px-3 py-1.5 bg-[#0B0F19] border-b border-[#263347] text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B]">
              <span className="col-span-2">ORDER ID / ROUTE</span>
              <span>INSTRUMENT / SIDE</span>
              <span>TYPE</span>
              <span>SIZE / FILLED</span>
              <span>LIMIT PRICE</span>
              <span>STATUS</span>
              <span className="text-right">ACTIONS</span>
            </div>

            {orders.map((ord) => (
              <div
                key={ord.id}
                className="grid grid-cols-8 px-3 py-2 items-center text-xs font-['JetBrains_Mono'] border-b border-[#1C2433] hover:bg-[#1C2433]/60 transition-colors"
              >
                {/* ID & Route */}
                <div className="col-span-2">
                  <div className="font-bold text-[#F8FAFC]">{ord.clientOrderId}</div>
                  <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                    <span>{ord.timestamp}</span>
                    <span>·</span>
                    <span className="text-[#06B6D4]">{ord.venue}</span>
                  </div>
                </div>

                {/* Instrument / Side */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#F8FAFC]">{ord.symbol}</span>
                  <span
                    className={`text-[10px] px-1 rounded-xs font-bold uppercase ${
                      ord.side === 'buy' ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {ord.side}
                  </span>
                </div>

                {/* Type */}
                <div>
                  <span className="px-1.5 py-0.5 bg-[#1C2433] text-[#F59E0B] border border-[#F59E0B]/30 rounded-xs text-[10px] font-bold">
                    {ord.type}
                  </span>
                </div>

                {/* Size / Filled */}
                <div>
                  <span className="text-[#F8FAFC] font-semibold tabular-nums">{ord.size}</span>
                  <span className="text-[10px] text-[#64748B] block tabular-nums">
                    Filled: {ord.filledSize} ({((ord.filledSize / (ord.size || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>

                {/* Limit Price */}
                <div className="tabular-nums text-[#94A3B8]">
                  ${ord.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-xs font-bold uppercase ${
                      ord.status === 'FILLED'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : ord.status === 'PARTIALLY_FILLED'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        : ord.status === 'OPEN'
                        ? 'bg-[#06B6D4]/15 text-[#06B6D4]'
                        : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="text-right">
                  {ord.status === 'OPEN' || ord.status === 'PARTIALLY_FILLED' ? (
                    <button
                      onClick={() => cancelOrder(ord.id)}
                      className="px-2 py-1 bg-[#1C2433] hover:bg-[#EF4444] text-[#94A3B8] hover:text-white border border-[#263347] rounded-xs text-[10px] font-semibold uppercase transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#64748B]">RESOLVED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fills' && (
          <div className="min-w-[700px]">
            <div className="grid grid-cols-6 px-3 py-1.5 bg-[#0B0F19] border-b border-[#263347] text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B]">
              <span>TIME (UTC)</span>
              <span>FILL ID</span>
              <span>SIDE</span>
              <span>PRICE</span>
              <span>SIZE</span>
              <span className="text-right">VENUE / BLOCK</span>
            </div>

            {trades.map((tr) => (
              <div
                key={tr.id}
                className="grid grid-cols-6 px-3 py-1.5 items-center text-xs font-['JetBrains_Mono'] border-b border-[#1C2433] hover:bg-[#1C2433]/60 transition-colors"
              >
                <span className="text-[#64748B] text-[11px]">{tr.timestamp}</span>
                <span className="text-[#94A3B8] text-[11px]">{tr.id}</span>
                <span className={tr.side === 'buy' ? 'text-[#10B981] font-bold uppercase' : 'text-[#EF4444] font-bold uppercase'}>
                  {tr.side}
                </span>
                <span className="text-[#F8FAFC] font-semibold tabular-nums">
                  ${tr.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[#F8FAFC] tabular-nums">
                  {tr.size}
                </span>
                <div className="text-right flex items-center justify-end gap-1.5">
                  <span className="text-[#06B6D4] text-[10px]">{tr.venue}</span>
                  {tr.isBlockTrade && (
                    <span className="px-1 py-0.2 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 rounded-xs text-[9px] font-bold">
                      BLOCK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
