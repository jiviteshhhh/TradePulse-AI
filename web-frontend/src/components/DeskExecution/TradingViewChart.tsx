import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { Maximize2, Minimize2, Eye, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Candle } from '../../types/terminal';

export const TradingViewChart: React.FC = () => {
  const { selectedAsset, candles, timeframe, setTimeframe, selectedPrice, setSelectedPrice } = useTerminal();

  const [showVwap, setShowVwap] = useState(true);
  const [showEma, setShowEma] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(650);
  const [chartHeight, setChartHeight] = useState(380);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth);
        setChartHeight(Math.max(340, containerRef.current.clientHeight - 40));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const timeframes = ['1s', '1m', '5m', '15m', '1h', '4h', '1D'];

  // Calculate scales and coordinates
  const { minPrice, maxPrice, maxVolume, priceRange, candleWidth, candlesWithCoords } = useMemo(() => {
    if (candles.length === 0) {
      return { minPrice: 0, maxPrice: 1, maxVolume: 1, priceRange: 1, candleWidth: 8, candlesWithCoords: [] };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const padding = (max - min) * 0.08 || 1;
    const finalMin = min - padding;
    const finalMax = max + padding;
    const range = finalMax - finalMin;

    const availableWidth = chartWidth - 75; // reserve 75px for right price axis
    const availableHeight = chartHeight - 45; // reserve 45px for bottom volume/time
    const cWidth = Math.max(3, availableWidth / candles.length - 2);

    // Compute 20-period EMA
    const k = 2 / (20 + 1);
    let ema = candles[0].close;

    const withCoords = candles.map((c, i) => {
      ema = c.close * k + ema * (1 - k);
      const x = i * (cWidth + 2) + 10;
      const openY = availableHeight - ((c.open - finalMin) / range) * availableHeight;
      const closeY = availableHeight - ((c.close - finalMin) / range) * availableHeight;
      const highY = availableHeight - ((c.high - finalMin) / range) * availableHeight;
      const lowY = availableHeight - ((c.low - finalMin) / range) * availableHeight;
      const vwapY = c.vwap ? availableHeight - ((c.vwap - finalMin) / range) * availableHeight : undefined;
      const emaY = availableHeight - ((ema - finalMin) / range) * availableHeight;
      const volHeight = (c.volume / (maxVol || 1)) * 38;

      return {
        ...c,
        x,
        openY,
        closeY,
        highY,
        lowY,
        vwapY,
        emaY,
        volHeight,
        isBullish: c.close >= c.open,
      };
    });

    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      maxVolume: maxVol,
      priceRange: range,
      candleWidth: cWidth,
      candlesWithCoords: withCoords,
    };
  }, [candles, chartWidth, chartHeight]);

  // Price axis grid levels (5 ticks)
  const priceGridTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * (5 - i)) / 5;
      const y = (i / 5) * (chartHeight - 45);
      ticks.push({ price, y });
    }
    return ticks;
  }, [minPrice, priceRange, chartHeight]);

  const activeDisplayCandle = hoveredCandle || candles[candles.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setHoverX(mouseX);
    setHoverY(mouseY);

    // find closest candle
    const index = Math.floor((mouseX - 10) / (candleWidth + 2));
    if (index >= 0 && index < candlesWithCoords.length) {
      setHoveredCandle(candlesWithCoords[index]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setHoverX(null);
    setHoverY(null);
  };

  const currentPriceY =
    chartHeight - 45 - ((selectedAsset.price - minPrice) / (priceRange || 1)) * (chartHeight - 45);

  return (
    <div className="bg-[#131A26] border border-[#263347] rounded-sm flex flex-col h-full overflow-hidden">
      {/* Chart Top Control Bar */}
      <div className="px-3 py-2 bg-[#1C2433] border-b border-[#263347] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Ticker & Candle stats */}
        <div className="flex items-center gap-3">
          <span className="font-['Space_Grotesk'] font-bold text-sm text-[#F8FAFC]">
            {selectedAsset.symbol}
          </span>

          {activeDisplayCandle && (
            <div className="hidden sm:flex items-center gap-2.5 font-['JetBrains_Mono'] text-[11px] text-[#94A3B8]">
              <span>
                O: <span className="text-[#F8FAFC]">{activeDisplayCandle.open.toFixed(2)}</span>
              </span>
              <span>
                H: <span className="text-[#10B981]">{activeDisplayCandle.high.toFixed(2)}</span>
              </span>
              <span>
                L: <span className="text-[#EF4444]">{activeDisplayCandle.low.toFixed(2)}</span>
              </span>
              <span>
                C:{' '}
                <span
                  className={
                    activeDisplayCandle.close >= activeDisplayCandle.open ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }
                >
                  {activeDisplayCandle.close.toFixed(2)}
                </span>
              </span>
              <span>
                VOL: <span className="text-[#F59E0B]">{activeDisplayCandle.volume}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Timeframes & Indicator toggles */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#0B0F19] p-0.5 rounded-sm border border-[#263347]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] font-medium rounded-xs transition-colors cursor-pointer ${
                  timeframe === tf ? 'bg-[#F59E0B] text-[#0B0F19] font-bold' : 'text-[#64748B] hover:text-[#F8FAFC]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] rounded-sm border transition-colors cursor-pointer ${
              showVwap
                ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B] font-semibold'
                : 'bg-[#0B0F19] border-[#263347] text-[#64748B]'
            }`}
          >
            VWAP
          </button>
          <button
            onClick={() => setShowEma(!showEma)}
            className={`px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] rounded-sm border transition-colors cursor-pointer ${
              showEma
                ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#06B6D4] font-semibold'
                : 'bg-[#0B0F19] border-[#263347] text-[#64748B]'
            }`}
          >
            EMA 20
          </button>
        </div>
      </div>

      {/* SVG Candlestick Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full bg-[#0B0F19] overflow-hidden select-none">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            if (hoveredCandle) {
              setSelectedPrice(hoveredCandle.close);
            }
          }}
        >
          <defs>
            <linearGradient id="volBuyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="volSellGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {priceGridTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={0}
                y1={tick.y}
                x2={chartWidth - 75}
                y2={tick.y}
                stroke="#263347"
                strokeWidth={0.8}
                strokeDasharray="2,3"
              />
              <text
                x={chartWidth - 70}
                y={tick.y + 3.5}
                fill="#64748B"
                fontSize={10}
                fontFamily="JetBrains Mono"
              >
                ${tick.price.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
              </text>
            </g>
          ))}

          {/* Volume bars separator line */}
          <line
            x1={0}
            y1={chartHeight - 45}
            x2={chartWidth - 75}
            y2={chartHeight - 45}
            stroke="#263347"
            strokeWidth={1}
          />

          {/* Volume Bars */}
          {candlesWithCoords.map((c, i) => (
            <rect
              key={`vol-${i}`}
              x={c.x}
              y={chartHeight - 45 - c.volHeight}
              width={candleWidth}
              height={c.volHeight}
              fill={c.isBullish ? 'url(#volBuyGrad)' : 'url(#volSellGrad)'}
            />
          ))}

          {/* VWAP Line */}
          {showVwap && (
            <polyline
              fill="none"
              stroke="#F59E0B"
              strokeWidth={1.4}
              strokeDasharray="4,2"
              points={candlesWithCoords
                .filter((c) => c.vwapY !== undefined)
                .map((c) => `${c.x + candleWidth / 2},${c.vwapY}`)
                .join(' ')}
            />
          )}

          {/* EMA 20 Line */}
          {showEma && (
            <polyline
              fill="none"
              stroke="#06B6D4"
              strokeWidth={1.5}
              points={candlesWithCoords
                .map((c) => `${c.x + candleWidth / 2},${c.emaY}`)
                .join(' ')}
            />
          )}

          {/* Candlesticks (Wick + Body) */}
          {candlesWithCoords.map((c, i) => {
            const bodyY = Math.min(c.openY, c.closeY);
            const bodyHeight = Math.max(2, Math.abs(c.closeY - c.openY));
            const color = c.isBullish ? '#10B981' : '#EF4444';

            return (
              <g key={`candle-${i}`}>
                {/* Wick */}
                <line
                  x1={c.x + candleWidth / 2}
                  y1={c.highY}
                  x2={c.x + candleWidth / 2}
                  y2={c.lowY}
                  stroke={color}
                  strokeWidth={1.1}
                />
                {/* Body */}
                <rect
                  x={c.x}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={c.isBullish ? '#10B981' : '#EF4444'}
                  stroke={color}
                  strokeWidth={0.5}
                  rx={0.5}
                />
              </g>
            );
          })}

          {/* Current Live Price Horizontal Marker Line */}
          <line
            x1={0}
            y1={currentPriceY}
            x2={chartWidth - 75}
            y2={currentPriceY}
            stroke="#F59E0B"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          {/* Live Price Tag on right axis */}
          <g transform={`translate(${chartWidth - 75}, ${currentPriceY - 9})`}>
            <rect width={74} height={18} fill="#F59E0B" rx={1} />
            <text
              x={37}
              y={12.5}
              fill="#0B0F19"
              fontSize={10}
              fontWeight="bold"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              ${selectedAsset.price.toFixed(selectedAsset.tickSize < 0.01 ? 3 : 2)}
            </text>
          </g>

          {/* Crosshair when hovering */}
          {hoverX !== null && hoverY !== null && (
            <g>
              <line
                x1={hoverX}
                y1={0}
                x2={hoverX}
                y2={chartHeight - 45}
                stroke="#94A3B8"
                strokeWidth={0.8}
                strokeDasharray="2,2"
              />
              <line
                x1={0}
                y1={hoverY}
                x2={chartWidth - 75}
                y2={hoverY}
                stroke="#94A3B8"
                strokeWidth={0.8}
                strokeDasharray="2,2"
              />
            </g>
          )}
        </svg>

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-['JetBrains_Mono'] text-[#64748B] pointer-events-none">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#F59E0B]" /> VWAP
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#06B6D4]" /> EMA 20
          </span>
          <span>Click candle to copy price into order ticket</span>
        </div>
      </div>
    </div>
  );
};
