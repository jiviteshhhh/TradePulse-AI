import React, { useState } from 'react';
import { useTerminal } from '../context/TerminalContext';
import { PaymentRail } from '../types/terminal';
import {
  CreditCard,
  Building2,
  QrCode,
  ArrowRightLeft,
  X,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Zap,
  Lock,
  ArrowDownCircle,
} from 'lucide-react';

export const PaymentGatewayModal: React.FC = () => {
  const { isPaymentModalOpen, closePaymentModal, initiatePaymentDeposit, transferCollateral, risk } = useTerminal();

  const [activeRail, setActiveRail] = useState<PaymentRail>('ONCHAIN_CRYPTO');

  // Crypto state
  const [cryptoAsset, setCryptoAsset] = useState<'USDC' | 'USDT' | 'BTC' | 'ETH'>('USDC');
  const [cryptoNetwork, setCryptoNetwork] = useState<string>('Ethereum (ERC-20)');
  const [cryptoAmount, setCryptoAmount] = useState<string>('100000');
  const [copied, setCopied] = useState(false);

  // Wire state
  const [wireAmount, setWireAmount] = useState<string>('250000');
  const [senderBank, setSenderBank] = useState<string>('Goldman Sachs Treasury');

  // Card state
  const [cardNumber, setCardNumber] = useState<string>('4716 •••• •••• 8842');
  const [cardHolder, setCardHolder] = useState<string>('NEXUS CAPITAL DESK LLC');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('942');
  const [cardAmount, setCardAmount] = useState<string>('50000');

  // Cross-venue transfer state
  const [fromVenue, setFromVenue] = useState<string>('Fireblocks MPC Vault');
  const [toVenue, setToVenue] = useState<string>('Binance VIP Subaccount #1');
  const [transferAmount, setTransferAmount] = useState<string>('150000');

  if (!isPaymentModalOpen) return null;

  const depositAddress =
    cryptoNetwork.includes('Solana')
      ? 'NXus9qX...8kL4pQ'
      : cryptoNetwork.includes('Tron')
      ? 'TQ7yX...3mP9wZ'
      : '0x71C941...A28B49E0';

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCryptoDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cryptoAmount) || 10000;
    const fiatValue = cryptoAsset === 'BTC' ? amount * 94820 : cryptoAsset === 'ETH' ? amount * 3415 : amount;

    initiatePaymentDeposit({
      rail: 'ONCHAIN_CRYPTO',
      asset: cryptoAsset,
      amount,
      fiatValueUsd: fiatValue,
      networkOrMethod: `${cryptoNetwork} / Fireblocks MPC Gateway`,
      txHashOrWireRef: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 8)}`,
      targetSubaccount: 'Master Margin Collateral',
      direction: 'DEPOSIT',
    });
  };

  const handleWireDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(wireAmount) || 50000;
    initiatePaymentDeposit({
      rail: 'INSTITUTIONAL_WIRE',
      asset: 'USD',
      amount,
      fiatValueUsd: amount,
      networkOrMethod: `Fedwire Instant (${senderBank} -> J.P. Morgan)`,
      txHashOrWireRef: `FEDW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900000 + 100000)}`,
      targetSubaccount: 'Master Margin Collateral',
      direction: 'DEPOSIT',
    });
  };

  const handleCardDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cardAmount) || 25000;
    initiatePaymentDeposit({
      rail: 'CORPORATE_CARD',
      asset: 'USD',
      amount,
      fiatValueUsd: amount,
      networkOrMethod: `Corporate Visa Infinite (${cardHolder})`,
      txHashOrWireRef: `CH_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      targetSubaccount: 'Direct Spot Liquidity',
      direction: 'DEPOSIT',
    });
  };

  const handleCrossVenueTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount) || 50000;
    transferCollateral(fromVenue, toVenue, 'USDC', amount);
    closePaymentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="relative w-full max-w-2xl bg-[#131A26] border border-[#263347] rounded-sm shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-[#F59E0B]/15 border border-[#F59E0B]/30 rounded-xs">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
            </span>
            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC] tracking-wide">
                INSTITUTIONAL PAYMENT GATEWAY & TREASURY
              </h2>
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4]">
                DIRECT CLEARING RAILS · ZERO-SLIPPAGE MARGIN FUNDING
              </p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="p-1 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#263347] rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Account Quick Status */}
        <div className="px-5 py-2.5 bg-[#0B0F19] border-b border-[#263347] flex items-center justify-between text-xs font-['JetBrains_Mono']">
          <div>
            <span className="text-[#64748B]">ACCOUNT EQUITY:</span>{' '}
            <span className="text-[#F8FAFC] font-semibold tabular-nums">
              ${risk.totalEquityUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[#64748B]">FREE MARGIN:</span>{' '}
            <span className="text-[#10B981] font-semibold tabular-nums">
              ${risk.freeMarginUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#06B6D4]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px]">TIER 1 SETTLEMENT</span>
          </div>
        </div>

        {/* Rail Switcher Tabs */}
        <div className="grid grid-cols-4 bg-[#0B0F19] border-b border-[#263347] text-xs font-['JetBrains_Mono']">
          <button
            onClick={() => setActiveRail('ONCHAIN_CRYPTO')}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] font-semibold ${
              activeRail === 'ONCHAIN_CRYPTO'
                ? 'bg-[#131A26] text-[#F59E0B] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>CRYPTO MPC</span>
          </button>

          <button
            onClick={() => setActiveRail('INSTITUTIONAL_WIRE')}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] font-semibold ${
              activeRail === 'INSTITUTIONAL_WIRE'
                ? 'bg-[#131A26] text-[#F59E0B] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>FEDWIRE / SEPA</span>
          </button>

          <button
            onClick={() => setActiveRail('CORPORATE_CARD')}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] font-semibold ${
              activeRail === 'CORPORATE_CARD'
                ? 'bg-[#131A26] text-[#F59E0B] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>CORPORATE CARD</span>
          </button>

          <button
            onClick={() => setActiveRail('CROSS_VENUE')}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px] font-semibold ${
              activeRail === 'CROSS_VENUE'
                ? 'bg-[#131A26] text-[#F59E0B] border-b-2 border-[#F59E0B]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>CROSS-VENUE</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 max-h-[460px] overflow-y-auto">
          {/* 1. On-Chain Crypto MPC Gateway */}
          {activeRail === 'ONCHAIN_CRYPTO' && (
            <form onSubmit={handleCryptoDeposit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                    Select Collateral Asset
                  </label>
                  <select
                    value={cryptoAsset}
                    onChange={(e) => setCryptoAsset(e.target.value as 'USDC' | 'USDT' | 'BTC' | 'ETH')}
                    className="w-full bg-[#0B0F19] text-[#F8FAFC] text-xs font-['JetBrains_Mono'] p-2 border border-[#263347] focus:border-[#F59E0B] rounded-xs outline-hidden cursor-pointer"
                  >
                    <option value="USDC">USDC (USD Coin - Staked Clearing)</option>
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="BTC">BTC (Bitcoin Native)</option>
                    <option value="ETH">ETH (Ethereum Native)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                    Select Blockchain Network
                  </label>
                  <select
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value)}
                    className="w-full bg-[#0B0F19] text-[#F8FAFC] text-xs font-['JetBrains_Mono'] p-2 border border-[#263347] focus:border-[#F59E0B] rounded-xs outline-hidden cursor-pointer"
                  >
                    <option value="Ethereum (ERC-20)">Ethereum (ERC-20) [12 Confirms]</option>
                    <option value="Arbitrum One (L2)">Arbitrum One (L2) [Instant Finality]</option>
                    <option value="Solana (SPL)">Solana (SPL) [400ms Sub-Second]</option>
                    <option value="Base (L2)">Base (Coinbase Prime L2)</option>
                    <option value="Tron (TRC-20)">Tron (TRC-20) [Low Gas]</option>
                  </select>
                </div>
              </div>

              {/* Deposit Address & Simulated QR Box */}
              <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm flex items-center gap-4">
                <div className="w-20 h-20 bg-[#1C2433] border border-[#263347] rounded-xs flex flex-col items-center justify-center p-1 shrink-0">
                  <div className="grid grid-cols-4 gap-0.5 w-14 h-14 bg-[#0B0F19] p-1 rounded-xs">
                    <div className="bg-[#F59E0B] rounded-xs" />
                    <div className="bg-[#F8FAFC] rounded-xs" />
                    <div className="bg-[#06B6D4] rounded-xs" />
                    <div className="bg-[#F59E0B] rounded-xs" />
                    <div className="bg-[#F8FAFC] rounded-xs" />
                    <div className="bg-[#10B981] rounded-xs" />
                    <div className="bg-[#F8FAFC] rounded-xs" />
                    <div className="bg-[#06B6D4] rounded-xs" />
                    <div className="bg-[#06B6D4] rounded-xs" />
                    <div className="bg-[#F59E0B] rounded-xs" />
                    <div className="bg-[#10B981] rounded-xs" />
                    <div className="bg-[#F8FAFC] rounded-xs" />
                  </div>
                  <span className="text-[8px] font-['JetBrains_Mono'] text-[#64748B] mt-0.5">SCAN QR</span>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-['JetBrains_Mono'] text-[#64748B] flex items-center justify-between">
                    <span>FIREBLOCKS MPC DEPOSIT ADDRESS:</span>
                    <span className="text-[#10B981]">VERIFIED COLD VAULT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-[#131A26] border border-[#263347] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs flex-1 truncate">
                      {depositAddress}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(depositAddress)}
                      className="px-2.5 py-1 bg-[#1C2433] hover:bg-[#263347] text-[#94A3B8] hover:text-[#F8FAFC] text-[10px] font-['JetBrains_Mono'] rounded-xs border border-[#263347] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copied ? <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                  <div className="text-[10px] font-['JetBrains_Mono'] text-[#64748B]">
                    Send only {cryptoAsset} on {cryptoNetwork}. Zero deposit fee.
                  </div>
                </div>
              </div>

              {/* Amount to fund & presets */}
              <div>
                <div className="flex justify-between text-[10px] font-['JetBrains_Mono'] text-[#64748B] mb-1">
                  <span>FUNDING AMOUNT ({cryptoAsset})</span>
                  <span>Institutional Min: 1,000 {cryptoAsset}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-sm rounded-xs outline-hidden tabular-nums"
                  />
                  <span className="absolute right-3 top-2 text-xs font-['JetBrains_Mono'] text-[#64748B]">
                    {cryptoAsset}
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2 font-['JetBrains_Mono'] text-[10px]">
                {['25000', '100000', '250000', '1000000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCryptoAmount(amt)}
                    className="py-1 bg-[#0B0F19] hover:bg-[#1C2433] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#263347] rounded-xs transition-colors cursor-pointer"
                  >
                    +${(parseInt(amt) / 1000).toLocaleString()}k
                  </button>
                ))}
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>CONFIRM & CREDIT COLLATERAL TO MARGIN POOL</span>
              </button>
            </form>
          )}

          {/* 2. Institutional Fedwire / SEPA */}
          {activeRail === 'INSTITUTIONAL_WIRE' && (
            <form onSubmit={handleWireDeposit} className="space-y-4">
              <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2 font-['JetBrains_Mono'] text-xs">
                <div className="text-[10px] uppercase text-[#F59E0B] font-bold">
                  BENEFICIARY BANKING INSTRUCTIONS (FEDWIRE / SWIFT)
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[#64748B] block text-[9px]">BENEFICIARY BANK</span>
                    <span className="text-[#F8FAFC] font-semibold">J.P. Morgan Chase N.A. (New York)</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9px]">FEDWIRE ROUTING ABA</span>
                    <span className="text-[#F8FAFC] font-semibold">021000021</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9px]">SWIFT / BIC CODE</span>
                    <span className="text-[#F8FAFC] font-semibold">CHASUS33</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9px]">ACCOUNT NUMBER</span>
                    <span className="text-[#F8FAFC] font-semibold">9840-2189-4102</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1C2433]">
                  <span className="text-[#64748B] block text-[9px]">MANDATORY MEMO / REFERENCE</span>
                  <div className="flex items-center justify-between bg-[#131A26] px-2 py-1 rounded-xs mt-0.5 border border-[#263347]">
                    <span className="text-[#10B981] font-bold">NX-INST-882194-MASTER</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('NX-INST-882194-MASTER')}
                      className="text-[9px] text-[#F59E0B] hover:underline cursor-pointer"
                    >
                      COPY MEMO
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                    Originating Treasury Institution
                  </label>
                  <input
                    type="text"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                    Wire Funding Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={wireAmount}
                    onChange={(e) => setWireAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden tabular-nums"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
              >
                <Building2 className="w-4 h-4" />
                <span>SUBMIT FEDWIRE RECEIPT & AUTO-CREDIT ACCOUNT</span>
              </button>
            </form>
          )}

          {/* 3. Corporate Card / Instant Clearing */}
          {activeRail === 'CORPORATE_CARD' && (
            <form onSubmit={handleCardDeposit} className="space-y-4">
              <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-['JetBrains_Mono']">
                  <span className="text-[#F8FAFC] font-semibold">CORPORATE DIRECT DEBIT & CLEARING</span>
                  <span className="text-[#06B6D4] text-[10px] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PCI-DSS LEVEL 1
                  </span>
                </div>

                <div>
                  <label className="block text-[9px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-0.5">
                    CARD NUMBER
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#131A26] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-0.5">
                      CARDHOLDER / ENTITY NAME
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131A26] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-0.5">
                        EXPIRY
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#131A26] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-0.5">
                        CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#131A26] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                  Deposit Amount (USD)
                </label>
                <input
                  type="number"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-sm rounded-xs outline-hidden tabular-nums"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
              >
                <CreditCard className="w-4 h-4" />
                <span>AUTHORIZE & INSTANT CREDIT (${parseFloat(cardAmount || '0').toLocaleString()})</span>
              </button>
            </form>
          )}

          {/* 4. Cross-Venue Off-Exchange Settlement */}
          {activeRail === 'CROSS_VENUE' && (
            <form onSubmit={handleCrossVenueTransfer} className="space-y-4">
              <div className="p-3 bg-[#0B0F19] border border-[#263347] rounded-sm space-y-2 text-xs font-['JetBrains_Mono']">
                <div className="text-[10px] text-[#06B6D4] font-bold uppercase">
                  COPPER CLEARLOOP / FIREBLOCKS OFF-EXCHANGE TELEPORT
                </div>
                <div className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Instantly move margin between exchange subaccounts and cold custody vaults without waiting for block confirmations or exchange withdrawal processing.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                    SOURCE SUBACCOUNT
                  </label>
                  <select
                    value={fromVenue}
                    onChange={(e) => setFromVenue(e.target.value)}
                    className="w-full bg-[#0B0F19] text-[#F8FAFC] text-xs font-['JetBrains_Mono'] p-2 border border-[#263347] rounded-xs outline-hidden cursor-pointer"
                  >
                    <option value="Fireblocks MPC Vault">Fireblocks MPC Cold Vault ($2.5M)</option>
                    <option value="Binance VIP Subaccount #1">Binance VIP Subaccount #1 ($1.7M)</option>
                    <option value="OKX Colocated Subaccount">OKX Colocated Subaccount ($800k)</option>
                    <option value="Deribit FIX Subaccount">Deribit FIX Subaccount ($650k)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                    DESTINATION SUBACCOUNT
                  </label>
                  <select
                    value={toVenue}
                    onChange={(e) => setToVenue(e.target.value)}
                    className="w-full bg-[#0B0F19] text-[#F8FAFC] text-xs font-['JetBrains_Mono'] p-2 border border-[#263347] rounded-xs outline-hidden cursor-pointer"
                  >
                    <option value="Binance VIP Subaccount #1">Binance VIP Subaccount #1</option>
                    <option value="OKX Colocated Subaccount">OKX Colocated Subaccount</option>
                    <option value="Deribit FIX Subaccount">Deribit FIX Subaccount</option>
                    <option value="Fireblocks MPC Vault">Fireblocks MPC Cold Vault</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase mb-1">
                  TRANSFER AMOUNT (USDC)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-sm rounded-xs outline-hidden tabular-nums"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>EXECUTE SUB-SECOND CROSS-VENUE TELEPORT</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
