import React, { useState, useEffect } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { OrderType, OrderSide, TimeInForce } from '../../types/terminal';
import { Zap, Send, Sliders, ShieldCheck } from 'lucide-react';

export const OrderTicket: React.FC = () => {
  const { selectedAsset, placeOrder, selectedPrice, setSelectedPrice, risk } = useTerminal();

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [price, setPrice] = useState<string>(selectedAsset.price.toString());
  const [size, setSize] = useState<string>('0.5');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('GTC');
  const [postOnly, setPostOnly] = useState<boolean>(false);
  const [reduceOnly, setReduceOnly] = useState<boolean>(false);
  const [venue, setVenue] = useState<string>('Smart Router (SOR)');

  // Algo specific params
  const [twapMinutes, setTwapMinutes] = useState<number>(10);
  const [icebergVisible, setIcebergVisible] = useState<string>('0.1');

  // Update price when clicked in order book or when asset changes
  useEffect(() => {
    if (selectedPrice !== null) {
      setPrice(selectedPrice.toString());
      setSelectedPrice(null);
    } else {
      setPrice(selectedAsset.price.toString());
    }
  }, [selectedPrice, selectedAsset.price, setSelectedPrice]);

  const numPrice = parseFloat(price) || selectedAsset.price;
  const numSize = parseFloat(size) || 0;
  const notionalValue = numPrice * numSize;
  const estimatedFee = notionalValue * 0.0002; // 2 bps maker/taker institutional

  const handlePercentageClick = (pct: number) => {
    // calculate size based on free margin / leverage
    const available = risk.freeMarginUsd * 2; // e.g. 2x leverage budget
    const targetNotional = available * (pct / 100);
    const calculatedSize = targetNotional / (numPrice || 1);
    setSize(calculatedSize.toFixed(selectedAsset.tickSize < 0.01 ? 1 : 3));
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSize <= 0) return;

    let notes: string | undefined;
    if (orderType === 'TWAP') notes = `TWAP across ${twapMinutes} mins window`;
    if (orderType === 'ICEBERG') notes = `Iceberg visible chunk: ${icebergVisible} ${selectedAsset.baseAsset}`;
    if (orderType === 'SNIPER') notes = `Sub-millisecond liquidity sniper hook`;

    placeOrder({
      symbol: selectedAsset.symbol,
      side,
      type: orderType,
      size: numSize,
      price: orderType === 'MARKET' ? selectedAsset.price : numPrice,
      venue,
      timeInForce,
      postOnly,
      reduceOnly,
      notes,
    });
  };

  const orderTypes: OrderType[] = ['LIMIT', 'MARKET', 'TWAP', 'ICEBERG', 'SNIPER', 'PEG'];

  return (
    <div className="bg-[#131A26] border border-[#263347] rounded-sm flex flex-col h-full select-none overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#F8FAFC]">
            ALGO ORDER DISPATCH
          </span>
        </div>
        <span className="font-['JetBrains_Mono'] text-[10px] text-[#06B6D4] px-1.5 py-0.2 bg-[#06B6D4]/10 border border-[#06B6D4]/25 rounded-xs">
          DMA ACTIVE
        </span>
      </div>

      <form onSubmit={handleExecute} className="p-3 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Side Selector (BUY vs SELL) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0F19] border border-[#263347] rounded-sm">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`py-1.5 font-['JetBrains_Mono'] text-xs font-bold uppercase transition-all rounded-xs cursor-pointer ${
                side === 'buy'
                  ? 'bg-[#10B981] text-[#0B0F19] shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-[#64748B] hover:text-[#10B981]'
              }`}
            >
              BUY / LONG
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`py-1.5 font-['JetBrains_Mono'] text-xs font-bold uppercase transition-all rounded-xs cursor-pointer ${
                side === 'sell'
                  ? 'bg-[#EF4444] text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  : 'text-[#64748B] hover:text-[#EF4444]'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          {/* Order Type Selector */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {orderTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`px-2 py-1 text-[10px] font-['JetBrains_Mono'] uppercase rounded-xs transition-colors cursor-pointer shrink-0 ${
                  orderType === t
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B] font-bold'
                    : 'bg-[#0B0F19] text-[#64748B] border border-[#263347] hover:text-[#F8FAFC]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Price Field (disabled if Market) */}
          {orderType !== 'MARKET' && (
            <div>
              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
                <span>LIMIT PRICE (USD)</span>
                <button
                  type="button"
                  onClick={() => setPrice(selectedAsset.price.toString())}
                  className="text-[#F59E0B] hover:underline cursor-pointer"
                >
                  MID: ${selectedAsset.price.toFixed(2)}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden tabular-nums"
                />
                <span className="absolute right-2.5 top-1.5 text-[10px] font-['JetBrains_Mono'] text-[#64748B]">
                  USD
                </span>
              </div>
            </div>
          )}

          {/* Size Field */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] mb-1">
              <span>ORDER SIZE ({selectedAsset.baseAsset})</span>
              <span className="text-[#64748B]">
                Min: {selectedAsset.minOrderSize} {selectedAsset.baseAsset}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#0B0F19] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs rounded-xs outline-hidden tabular-nums"
              />
              <span className="absolute right-2.5 top-1.5 text-[10px] font-['JetBrains_Mono'] text-[#64748B]">
                {selectedAsset.baseAsset}
              </span>
            </div>
          </div>

          {/* Percentage quick buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentageClick(pct)}
                className="py-1 text-[10px] font-['JetBrains_Mono'] bg-[#0B0F19] hover:bg-[#1C2433] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#263347] rounded-xs transition-colors cursor-pointer"
              >
                {pct === 100 ? 'MAX' : `${pct}%`}
              </button>
            ))}
          </div>

          {/* Algo specifics: TWAP or Iceberg */}
          {orderType === 'TWAP' && (
            <div className="p-2 bg-[#0B0F19] border border-[#263347] rounded-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#F59E0B]">
                <span>TWAP EXECUTION WINDOW</span>
                <span>{twapMinutes} MINS</span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                value={twapMinutes}
                onChange={(e) => setTwapMinutes(Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-['JetBrains_Mono'] text-[#64748B]">
                <span>2m</span>
                <span>30m</span>
                <span>60m</span>
              </div>
            </div>
          )}

          {orderType === 'ICEBERG' && (
            <div className="p-2 bg-[#0B0F19] border border-[#263347] rounded-xs space-y-1">
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#F59E0B]">
                VISIBLE CHUNK SIZE ({selectedAsset.baseAsset})
              </span>
              <input
                type="number"
                step="any"
                value={icebergVisible}
                onChange={(e) => setIcebergVisible(e.target.value)}
                className="w-full px-2 py-1 bg-[#131A26] border border-[#263347] focus:border-[#F59E0B] text-[#F8FAFC] text-[11px] font-['JetBrains_Mono'] rounded-xs outline-hidden"
              />
            </div>
          )}

          {/* Time In Force & Venue */}
          <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono']">
            <div>
              <span className="text-[10px] text-[#64748B] block mb-0.5">TIME IN FORCE</span>
              <select
                value={timeInForce}
                onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
                className="w-full bg-[#0B0F19] text-[#94A3B8] text-[10px] p-1.5 border border-[#263347] rounded-xs outline-hidden cursor-pointer"
              >
                <option value="GTC">GTC (Good Till Cancel)</option>
                <option value="IOC">IOC (Immediate/Cancel)</option>
                <option value="FOK">FOK (Fill Or Kill)</option>
                <option value="POST_ONLY">POST ONLY</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] block mb-0.5">VENUE ROUTING</span>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#0B0F19] text-[#94A3B8] text-[10px] p-1.5 border border-[#263347] rounded-xs outline-hidden cursor-pointer"
              >
                <option value="Smart Router (SOR)">Smart Router (SOR)</option>
                <option value="Binance-L2">Binance VIP L2</option>
                <option value="Coinbase-Prime">Coinbase Prime FIX</option>
                <option value="Bybit-Colo">Bybit Direct Colo</option>
                <option value="OKX-VIP">OKX VIP Colo</option>
              </select>
            </div>
          </div>

          {/* Checkboxes: Post-Only / Reduce-Only */}
          <div className="flex items-center gap-4 text-[10px] font-['JetBrains_Mono'] text-[#94A3B8]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={postOnly}
                onChange={(e) => setPostOnly(e.target.checked)}
                className="accent-[#F59E0B] rounded-xs cursor-pointer"
              />
              <span>POST-ONLY</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={reduceOnly}
                onChange={(e) => setReduceOnly(e.target.checked)}
                className="accent-[#F59E0B] rounded-xs cursor-pointer"
              />
              <span>REDUCE-ONLY</span>
            </label>
          </div>
        </div>

        {/* Execution Summary & Primary Action Verb */}
        <div className="pt-2 border-t border-[#263347] space-y-2">
          <div className="flex justify-between text-[11px] font-['JetBrains_Mono'] text-[#94A3B8]">
            <span>ORDER NOTIONAL:</span>
            <span className="text-[#F8FAFC] font-semibold tabular-nums">
              ${notionalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-['JetBrains_Mono'] text-[#64748B]">
            <span>EST. MAKER/TAKER FEE:</span>
            <span className="tabular-nums">${estimatedFee.toFixed(2)}</span>
          </div>

          {/* Primary Action Button (Green for BUY, Red for SELL) */}
          <button
            type="submit"
            className={`w-full py-2.5 font-['JetBrains_Mono'] font-bold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] ${
              side === 'buy'
                ? 'bg-[#10B981] hover:bg-[#059669] text-[#0B0F19] shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                : 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_16px_rgba(239,68,68,0.35)]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              EXECUTE {side.toUpperCase()} ORDER [{orderType}]
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
