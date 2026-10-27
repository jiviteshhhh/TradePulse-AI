import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import {
  Building2,
  QrCode,
  CreditCard,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Lock,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from 'lucide-react';

export const DeskTreasury: React.FC = () => {
  const { custodyBalances, payments, openPaymentModal, risk } = useTerminal();
  const [filterRail, setFilterRail] = useState<string>('ALL');

  const filteredPayments =
    filterRail === 'ALL' ? payments : payments.filter((p) => p.rail === filterRail);

  const totalVaultValue = custodyBalances.reduce((acc, b) => acc + b.usdValue, 0);

  return (
    <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-0 select-none">
      {/* Top Treasury Strip */}
      <div className="bg-[#131A26] border border-[#263347] rounded-sm p-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            TOTAL CUSTODIAL COLLATERAL
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F8FAFC] tabular-nums">
            ${totalVaultValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            UNENCUMBERED FREE MARGIN
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#10B981] tabular-nums">
            ${risk.freeMarginUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            ACTIVE SETTLEMENT RAILS
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#06B6D4] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_6px_#06B6D4]" />
            <span>4 RAILS LIVE</span>
          </div>
        </div>

        <div>
          <div className="font-['JetBrains_Mono'] text-[10px] text-[#64748B] uppercase">
            IDLE COLLATERAL YIELD
          </div>
          <div className="font-['JetBrains_Mono'] font-bold text-base text-[#F59E0B] tabular-nums">
            4.85% APY (T-BILL REPO)
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 flex justify-end">
          <button
            onClick={openPaymentModal}
            className="w-full md:w-auto px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>DEPOSIT / FUND MARGIN</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Vault Balances (5 cols) + Right Payment Gateway Blotter (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-[500px]">
        {/* Left: Custody Balances & MPC Vaults */}
        <div className="lg:col-span-5 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                INSTITUTIONAL CUSTODY & VAULT BREAKDOWN
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4]">
              MULTI-PARTY COMPUTATION (MPC)
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {custodyBalances.map((item) => (
              <div
                key={item.asset}
                className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2 hover:border-[#334155] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
                      {item.asset}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#64748B] ml-2">
                      {item.custodyLocation}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-['JetBrains_Mono'] font-bold text-sm text-[#F8FAFC] tabular-nums">
                      ${item.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C2433] text-[10px] font-['JetBrains_Mono']">
                  <div>
                    <span className="text-[#64748B] block">TOTAL UNITS</span>
                    <span className="text-[#F8FAFC] font-semibold tabular-nums">{item.total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">FREE UNENCUMBERED</span>
                    <span className="text-[#10B981] font-semibold tabular-nums">{item.free.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">IN STRATEGIES</span>
                    <span className="text-[#F59E0B] font-semibold tabular-nums">
                      {item.lockedInOrders.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Treasury Security Card */}
            <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-1.5 text-xs font-['JetBrains_Mono']">
              <div className="flex items-center gap-2 text-[#10B981] font-bold text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                <span>2-OF-3 MPC QUORUM VAULT ACTIVE</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                All collateral is held in segregated institutional bankruptcy-remote trusts under Fireblocks MPC and
                Copper ClearLoop. Zero rehypothecation risk. Instant off-exchange reallocation.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Payment Gateway Transactions Blotter */}
        <div className="lg:col-span-7 bg-[#131A26] border border-[#263347] rounded-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
                PAYMENT GATEWAY SETTLEMENT BLOTTER
              </span>
            </div>

            {/* Rail Filters */}
            <div className="flex items-center gap-1 text-[10px] font-['JetBrains_Mono']">
              {['ALL', 'ONCHAIN_CRYPTO', 'INSTITUTIONAL_WIRE', 'CORPORATE_CARD', 'CROSS_VENUE'].map(
                (rail) => (
                  <button
                    key={rail}
                    onClick={() => setFilterRail(rail)}
                    className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      filterRail === rail
                        ? 'bg-[#F59E0B] text-[#0B0F19] font-bold'
                        : 'bg-[#0B0F19] text-[#64748B] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {rail === 'ONCHAIN_CRYPTO'
                      ? 'CRYPTO'
                      : rail === 'INSTITUTIONAL_WIRE'
                      ? 'WIRE'
                      : rail === 'CORPORATE_CARD'
                      ? 'CARD'
                      : rail === 'CROSS_VENUE'
                      ? 'CROSS-VENUE'
                      : 'ALL'}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-6 px-3 py-1.5 bg-[#0B0F19] border-b border-[#263347] text-[10px] font-['JetBrains_Mono'] uppercase text-[#64748B]">
            <span className="col-span-2">TRANSACTION ID / METHOD</span>
            <span>ASSET / AMOUNT</span>
            <span>USD VALUE</span>
            <span>STATUS</span>
            <span className="text-right">TIMESTAMP</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1C2433]">
            {filteredPayments.map((p) => {
              const isDeposit = p.direction === 'DEPOSIT';
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-6 px-3 py-2.5 items-center text-xs font-['JetBrains_Mono'] hover:bg-[#1C2433]/60 transition-colors"
                >
                  {/* ID & Method */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      {isDeposit ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
                      )}
                      <span className="font-bold text-[#F8FAFC]">{p.id}</span>
                      <span className="text-[9px] text-[#64748B] truncate">({p.txHashOrWireRef})</span>
                    </div>
                    <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">{p.networkOrMethod}</div>
                  </div>

                  {/* Asset & Amount */}
                  <div>
                    <span className="font-semibold text-[#F8FAFC] tabular-nums">
                      {p.amount.toLocaleString()} {p.asset}
                    </span>
                  </div>

                  {/* USD Value */}
                  <div>
                    <span className="text-[#10B981] font-bold tabular-nums">
                      +${p.fiatValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-xs font-bold uppercase ${
                        p.status === 'SETTLED'
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : p.status === 'CONFIRMING'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                          : 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right text-[10px] text-[#64748B] tabular-nums">
                    {p.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
