import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Asset,
  OrderBook,
  TapeTrade,
  AlgoOrder,
  Position,
  Strategy,
  RiskMetrics,
  ColoNode,
  SystemLog,
  DeskId,
  OrderType,
  OrderSide,
  TimeInForce,
  Candle,
  PaymentTransaction,
  CustodyBalance,
} from '../types/terminal';
import {
  INITIAL_ASSETS,
  generateOrderBook,
  generateInitialCandles,
  INITIAL_TRADES,
  INITIAL_POSITIONS,
  INITIAL_ORDERS,
  INITIAL_STRATEGIES,
  INITIAL_RISK,
  INITIAL_COLO_NODES,
  INITIAL_LOGS,
  INITIAL_PAYMENTS,
  INITIAL_CUSTODY_BALANCES,
} from '../mock/terminalData';
import { backendApi } from '../services/backendApi';

interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  size: number;
  price: number;
  venue?: string;
  timeInForce?: TimeInForce;
  slippageTolerancePercent?: number;
  postOnly?: boolean;
  reduceOnly?: boolean;
  notes?: string;
}

interface TerminalContextValue {
  activeDesk: DeskId;
  setActiveDesk: (desk: DeskId) => void;
  selectedAsset: Asset;
  setSelectedAssetSymbol: (symbol: string) => void;
  assets: Asset[];
  orderBook: OrderBook;
  candles: Candle[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  trades: TapeTrade[];
  positions: Position[];
  orders: AlgoOrder[];
  strategies: Strategy[];
  risk: RiskMetrics;
  coloNodes: ColoNode[];
  logs: SystemLog[];
  isStreaming: boolean;
  toggleStreaming: () => void;
  latencyMs: number;
  isKillSwitchModalOpen: boolean;
  openKillSwitchModal: () => void;
  closeKillSwitchModal: () => void;
  executeEmergencyKill: (mode: 'FULL_FLATTEN' | 'CANCEL_ORDERS' | 'HALT_ALGO') => void;
  killSwitchArmed: boolean;
  placeOrder: (params: PlaceOrderParams) => void;
  cancelOrder: (orderId: string) => void;
  closePosition: (positionId: string) => void;
  updatePositionTpSl: (positionId: string, tp?: number, sl?: number) => void;
  toggleStrategyStatus: (strategyId: string) => void;
  updateStrategyParam: (strategyId: string, key: string, value: number | string) => void;
  deployNewStrategy: (strat: Partial<Strategy>) => void;
  selectedPrice: number | null;
  setSelectedPrice: (price: number | null) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationMessage: { text: string; type: 'success' | 'danger' | 'info' } | null;
  clearNotification: () => void;
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  payments: PaymentTransaction[];
  custodyBalances: CustodyBalance[];
  initiatePaymentDeposit: (tx: Omit<PaymentTransaction, 'id' | 'timestamp' | 'status' | 'confirmations' | 'requiredConfirmations'>) => void;
  transferCollateral: (fromLocation: string, toLocation: string, asset: string, amount: number) => void;
  viewMode: 'docked' | 'scrollable';
  toggleViewMode: () => void;
}

const TerminalContext = createContext<TerminalContextValue | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDesk, setActiveDesk] = useState<DeskId>('execution');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('BTC-PERP');
  const [timeframe, setTimeframe] = useState<string>('1m');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(1.24);
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = useState<boolean>(false);
  const [killSwitchArmed, setKillSwitchArmed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<{
    text: string;
    type: 'success' | 'danger' | 'info';
  } | null>(null);

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.symbol === selectedAssetSymbol) || assets[0];
  }, [assets, selectedAssetSymbol]);

  const [orderBook, setOrderBook] = useState<OrderBook>(() =>
    generateOrderBook(selectedAsset.price, selectedAsset.tickSize)
  );

  const [candles, setCandles] = useState<Candle[]>(() =>
    generateInitialCandles(selectedAsset.price)
  );

  const [trades, setTrades] = useState<TapeTrade[]>(INITIAL_TRADES);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<AlgoOrder[]>(INITIAL_ORDERS);
  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);
  const [risk, setRisk] = useState<RiskMetrics>(INITIAL_RISK);
  const [coloNodes, setColoNodes] = useState<ColoNode[]>(INITIAL_COLO_NODES);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [custodyBalances, setCustodyBalances] = useState<CustodyBalance[]>(INITIAL_CUSTODY_BALANCES);
  const [viewMode, setViewMode] = useState<'docked' | 'scrollable'>('scrollable');

  // Play micro beep for order/fill if sound enabled
  const playBeep = useCallback((freq = 880, duration = 0.05) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext unavailable or blocked by policy
    }
  }, [soundEnabled]);

  const showNotification = useCallback((text: string, type: 'success' | 'danger' | 'info') => {
    setNotificationMessage({ text, type });
    setTimeout(() => {
      setNotificationMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  const clearNotification = useCallback(() => setNotificationMessage(null), []);

  // Update orderbook and candles when switching asset
  useEffect(() => {
    const currentAsset = assets.find((a) => a.symbol === selectedAssetSymbol) || assets[0];
    setOrderBook(generateOrderBook(currentAsset.price, currentAsset.tickSize));
    setCandles(generateInitialCandles(currentAsset.price));
  }, [selectedAssetSymbol]);

  // Real-time synchronization with TradePulse AI Python Backend
  useEffect(() => {
    const unsubscribe = backendApi.onTelemetry((telemetry) => {
      // 1. Update Asset Price for Active Forex Pair
      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.symbol === telemetry.pair) {
            const newPrice = telemetry.current_price;
            return {
              ...asset,
              price: newPrice,
              markPrice: newPrice,
            };
          }
          return asset;
        })
      );

      // 2. Synchronize Risk & Circuit Breaker status
      setRisk((prev) => ({
        ...prev,
        totalEquityUsd: telemetry.account_equity,
        circuitBreakerStatus: telemetry.circuit_breaker.is_halted ? 'TRIGGERED' : 'NORMAL',
        dailyDrawdownPercent: telemetry.circuit_breaker.loss_capacity_used_pct,
        activePositionsCount: telemetry.open_trades_count,
      }));

      // 3. Synchronize Open Positions
      if (telemetry.open_positions && telemetry.open_positions.length > 0) {
        const mappedPositions: Position[] = telemetry.open_positions.map((p) => ({
          id: p.id,
          symbol: p.pair,
          side: (p.direction.toLowerCase() === 'buy' ? 'long' : 'short'),
          size: p.lot_size,
          notionalUsd: Number((p.lot_size * 100000 * p.current_price).toFixed(2)),
          entryPrice: p.entry_price,
          markPrice: p.current_price,
          liqPrice: p.direction === 'BUY' ? p.entry_price * 0.95 : p.entry_price * 1.05,
          marginRatio: 0.02,
          unrealizedPnl: p.floating_pnl,
          unrealizedPnlPercent: Number(((p.pips_gained / 100) * 100).toFixed(2)),
          realizedPnl: 0,
          leverage: 50,
          tpPrice: p.take_profit,
          slPrice: p.stop_loss,
          venue: 'OANDA / US-FOREX',
          openedAt: 'Live',
        }));
        setPositions(mappedPositions);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time market tick simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // 1. Slightly drift selected asset price
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.symbol !== selectedAssetSymbol) {
            // small drift for non-selected
            const microDelta = (Math.random() - 0.5) * (asset.price * 0.0003);
            return {
              ...asset,
              price: Number((asset.price + microDelta).toFixed(asset.tickSize < 0.01 ? 3 : 2)),
            };
          }

          const volatilityFactor = asset.symbol === 'SUI-PERP' ? 0.0012 : 0.0004;
          const delta = (Math.random() - 0.495) * (asset.price * volatilityFactor);
          const newPrice = Number((asset.price + delta).toFixed(asset.tickSize < 0.01 ? 3 : 2));
          const change = Number((newPrice - (asset.high24h + asset.low24h) / 2).toFixed(2));
          const changePercent = Number(((change / asset.low24h) * 100).toFixed(2));

          return {
            ...asset,
            price: newPrice,
            change24h: change,
            change24hPercent: changePercent,
            markPrice: Number((newPrice + (Math.random() - 0.5) * asset.tickSize).toFixed(2)),
          };
        })
      );

      // 2. Refresh OrderBook
      setOrderBook((prev) => {
        const currentMid = selectedAsset.price;
        return generateOrderBook(currentMid, selectedAsset.tickSize);
      });

      // 3. Append to Tape Trades
      const isBuy = Math.random() > 0.48;
      const tradeSize = Number(
        (Math.random() > 0.9 ? Math.random() * 8 + 3 : Math.random() * 1.5 + 0.05).toFixed(3)
      );
      const isBlock = tradeSize * selectedAsset.price > 200000;
      const venueNames = ['Binance-L2', 'Coinbase-Prime', 'Bybit-Colo', 'OKX-VIP', 'Deribit-FIX'];
      const chosenVenue = venueNames[Math.floor(Math.random() * venueNames.length)];

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

      const newTrade: TapeTrade = {
        id: `TRD-${Math.floor(Math.random() * 900000 + 100000)}`,
        timestamp: timeStr,
        price: selectedAsset.price,
        size: tradeSize,
        valueUsd: Number((tradeSize * selectedAsset.price).toFixed(2)),
        side: isBuy ? 'buy' : 'sell',
        isBlockTrade: isBlock,
        venue: chosenVenue,
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 40)]);

      // 4. Update the latest Candle
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const last = { ...prevCandles[prevCandles.length - 1] };
        const price = selectedAsset.price;
        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
        last.close = price;
        last.volume += Math.floor(Math.random() * 3 + 1);
        last.vwap = Number(((last.high + last.low + last.close) / 3).toFixed(2));
        return [...prevCandles.slice(0, -1), last];
      });

      // 5. Update Colo Latencies micro-fluctuation
      setLatencyMs((prev) => {
        const jitter = (Math.random() - 0.5) * 0.15;
        return Number(Math.max(0.65, Math.min(2.8, prev + jitter)).toFixed(2));
      });

      // 6. Update open positions mark price and unrealized PnL
      setPositions((prev) =>
        prev.map((pos) => {
          if (pos.symbol === selectedAssetSymbol) {
            const markPrice = selectedAsset.price;
            const diff = pos.side === 'long' ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
            const unrealizedPnl = Number((diff * pos.size).toFixed(2));
            const unrealizedPnlPercent = Number(
              ((unrealizedPnl / (pos.entryPrice * pos.size)) * 100).toFixed(2)
            );
            return {
              ...pos,
              markPrice,
              unrealizedPnl,
              unrealizedPnlPercent,
            };
          }
          return pos;
        })
      );
    }, 600);

    return () => clearInterval(interval);
  }, [isStreaming, selectedAssetSymbol, selectedAsset.price, selectedAsset.tickSize]);

  // Place interactive algorithmic order
  const placeOrder = useCallback(
    (params: PlaceOrderParams) => {
      const id = `ORD-${Math.floor(Math.random() * 90000 + 10000)}`;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Dispatch order to Python backend execution router
      backendApi.placeOrder(params);

      const newOrder: AlgoOrder = {
        id,
        clientOrderId: `${params.type}-${params.symbol.slice(0, 3)}-${Math.floor(Math.random() * 999)}`,
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        size: params.size,
        filledSize: params.type === 'MARKET' ? params.size : 0,
        price: params.price,
        avgFillPrice: params.type === 'MARKET' ? params.price : 0,
        status: params.type === 'MARKET' ? 'FILLED' : 'OPEN',
        timestamp: timeStr,
        venue: params.venue || 'Smart Router (SOR)',
        timeInForce: params.timeInForce || 'GTC',
        slippageTolerancePercent: params.slippageTolerancePercent || 0.05,
        postOnly: !!params.postOnly,
        reduceOnly: !!params.reduceOnly,
        notes: params.notes || `Dispatched via ${params.type} institutional route`,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // If Market order, instantly adjust position or create position
      if (params.type === 'MARKET') {
        const notional = Number((params.size * params.price).toFixed(2));
        const posSide = params.side === 'buy' ? 'long' : 'short';

        setPositions((prev) => {
          const existing = prev.find((p) => p.symbol === params.symbol);
          if (existing) {
            // merge
            const newSize = posSide === existing.side ? existing.size + params.size : Math.max(0.01, Math.abs(existing.size - params.size));
            return prev.map((p) =>
              p.id === existing.id
                ? {
                    ...p,
                    size: Number(newSize.toFixed(3)),
                    notionalUsd: Number((newSize * params.price).toFixed(2)),
                  }
                : p
            );
          } else {
            const newPos: Position = {
              id: `POS-${Math.floor(Math.random() * 900 + 100)}`,
              symbol: params.symbol,
              side: posSide,
              size: params.size,
              notionalUsd: notional,
              entryPrice: params.price,
              markPrice: params.price,
              liqPrice: Number((posSide === 'long' ? params.price * 0.82 : params.price * 1.18).toFixed(2)),
              marginRatio: 0.1,
              unrealizedPnl: 0,
              unrealizedPnlPercent: 0,
              realizedPnl: 0,
              leverage: 5,
              venue: params.venue || 'SOR-Execution',
              openedAt: `${now.toISOString().slice(0, 10)} ${timeStr}`,
            };
            return [newPos, ...prev];
          }
        });

        // Add execution log
        const logItem: SystemLog = {
          id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
          timestamp: timeStr,
          level: 'EXEC',
          subsystem: 'ROUTER_SOR',
          message: `Executed ${params.side.toUpperCase()} ${params.size} ${params.symbol} @ ${params.price} [FILL_100%]`,
        };
        setLogs((prev) => [logItem, ...prev.slice(0, 50)]);

        showNotification(
          `Market order filled: ${params.side.toUpperCase()} ${params.size} ${params.symbol} @ $${params.price.toLocaleString()}`,
          'success'
        );
        playBeep(1046, 0.08);
      } else {
        const logItem: SystemLog = {
          id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
          timestamp: timeStr,
          level: 'INFO',
          subsystem: 'ALGO_GATE',
          message: `Submitted ${params.type} ${params.side.toUpperCase()} ${params.size} ${params.symbol} @ ${params.price}`,
        };
        setLogs((prev) => [logItem, ...prev.slice(0, 50)]);

        showNotification(
          `Submitted ${params.type} order: ${params.side.toUpperCase()} ${params.size} ${params.symbol}`,
          'info'
        );
        playBeep(880, 0.05);
      }
    },
    [playBeep, showNotification]
  );

  // Cancel order
  const cancelOrder = useCallback((orderId: string) => {
    backendApi.cancelOrder(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELED' } : o))
    );
    showNotification(`Order ${orderId} canceled`, 'info');
  }, [showNotification]);

  // Close position
  const closePosition = useCallback((positionId: string) => {
    backendApi.closePosition(positionId);
    setPositions((prev) => {
      const target = prev.find((p) => p.id === positionId);
      if (target) {
        showNotification(
          `Closed position: ${target.side.toUpperCase()} ${target.size} ${target.symbol} (Realized PnL: $${target.unrealizedPnl.toLocaleString()})`,
          target.unrealizedPnl >= 0 ? 'success' : 'danger'
        );
      }
      return prev.filter((p) => p.id !== positionId);
    });
  }, [showNotification]);

  // Update TP/SL
  const updatePositionTpSl = useCallback((positionId: string, tp?: number, sl?: number) => {
    backendApi.updatePositionTpSl(positionId, tp, sl);
    setPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, tpPrice: tp, slPrice: sl } : p))
    );
    showNotification(`Updated Take Profit / Stop Loss thresholds`, 'info');
  }, [showNotification]);

  // Toggle strategy active/pause
  const toggleStrategyStatus = useCallback((strategyId: string) => {
    backendApi.toggleStrategy(strategyId);
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === strategyId) {
          const nextStatus = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          return {
            ...s,
            status: nextStatus,
            lastAction: `Status transitioned to ${nextStatus} by operator`,
          };
        }
        return s;
      })
    );
  }, []);

  // Update strategy parameter
  const updateStrategyParam = useCallback((strategyId: string, key: string, value: number | string) => {
    backendApi.updateStrategyParam(strategyId, key, value);
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === strategyId) {
          return {
            ...s,
            parameters: s.parameters.map((p) => (p.key === key ? { ...p, value } : p)),
            lastAction: `Parameter ${key} calibrated to ${value}`,
          };
        }
        return s;
      })
    );
    showNotification(`Calibrated parameter: ${key} = ${value}`, 'info');
  }, [showNotification]);

  // Deploy new strategy
  const deployNewStrategy = useCallback((strat: Partial<Strategy>) => {
    const id = `STRAT-0${strategies.length + 1}`;
    const newStrategy: Strategy = {
      id,
      name: strat.name || 'Custom Algorithmic Node',
      code: strat.code || `ALGO-NODE-${strategies.length + 1}`,
      category: strat.category || 'Arbitrage',
      status: 'ACTIVE',
      uptime: 100.0,
      allocatedUsd: strat.allocatedUsd || 500000,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      totalPnl: 0,
      apy: strat.apy || 32.5,
      sharpeRatio: strat.sharpeRatio || 3.1,
      maxDrawdown: 1.2,
      winRate: 78.0,
      ordersPerSec: 5.0,
      totalExecutions: 0,
      alphaScore: 92.0,
      betaToBtc: 0.05,
      inventoryDelta: 0.0,
      latencyAvgMs: 1.5,
      lastAction: 'Strategy container deployed and warm',
      parameters: strat.parameters || [
        {
          key: 'executionBandBps',
          label: 'Execution Band (bps)',
          value: 2.0,
          type: 'number',
          min: 0.5,
          max: 10,
          step: 0.1,
          description: 'Trigger tolerance band',
        },
      ],
    };

    setStrategies((prev) => [...prev, newStrategy]);
    showNotification(`Deployed new strategy container: ${newStrategy.name}`, 'success');
  }, [strategies.length, showNotification]);

  // Emergency Kill Switch
  const executeEmergencyKill = useCallback(
    (mode: 'FULL_FLATTEN' | 'CANCEL_ORDERS' | 'HALT_ALGO') => {
      // Trigger Python Backend and Android Native Circuit Breaker
      backendApi.triggerKillSwitch(`Emergency Kill Trigger: ${mode}`);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')}`;

      if (mode === 'FULL_FLATTEN') {
        // Cancel all orders, flatten all positions, halt all algorithms
        setOrders((prev) => prev.map((o) => ({ ...o, status: 'CANCELED' })));
        setPositions([]);
        setStrategies((prev) => prev.map((s) => ({ ...s, status: 'HALTED', lastAction: 'HALTED BY EMERGENCY KILL SWITCH' })));
        setKillSwitchArmed(true);
        setRisk((prev) => ({
          ...prev,
          circuitBreakerStatus: 'TRIGGERED',
          usedMarginUsd: 0,
          marginUtilizationPercent: 0,
          portfolioDeltaUsd: 0,
          effectiveLeverage: 0,
          activePositionsCount: 0,
        }));

        const logItem: SystemLog = {
          id: `KILL-${Date.now()}`,
          timestamp: timeStr,
          level: 'RISK_ALERT',
          subsystem: 'CIRCUIT_BREAKER',
          message: 'EMERGENCY KILL SWITCH TRIGGERED: All active orders canceled, 100% inventory flattened to USDC, all algorithmic daemons halted.',
        };
        setLogs((prev) => [logItem, ...prev]);

        showNotification('EMERGENCY KILL COMPLETE: All orders canceled & positions flattened', 'danger');
        playBeep(440, 0.4);
      } else if (mode === 'CANCEL_ORDERS') {
        setOrders((prev) => prev.map((o) => ({ ...o, status: 'CANCELED' })));
        showNotification('Emergency: All open blotter orders canceled', 'danger');
      } else if (mode === 'HALT_ALGO') {
        setStrategies((prev) => prev.map((s) => ({ ...s, status: 'PAUSED', lastAction: 'Emergency paused by operator' })));
        showNotification('Emergency: All quantitative algorithms paused', 'danger');
      }

      setIsKillSwitchModalOpen(false);
    },
    [playBeep, showNotification]
  );

  const openKillSwitchModal = useCallback(() => setIsKillSwitchModalOpen(true), []);
  const closeKillSwitchModal = useCallback(() => setIsKillSwitchModalOpen(false), []);
  const toggleStreaming = useCallback(() => setIsStreaming((prev) => !prev), []);

  const openPaymentModal = useCallback(() => setIsPaymentModalOpen(true), []);
  const closePaymentModal = useCallback(() => setIsPaymentModalOpen(false), []);
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'docked' ? 'scrollable' : 'docked'));
  }, []);

  const initiatePaymentDeposit = useCallback(
    (txData: Omit<PaymentTransaction, 'id' | 'timestamp' | 'status' | 'confirmations' | 'requiredConfirmations'>) => {
      const now = new Date();
      const timeStr = `${now.toISOString().slice(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const id = `PAY-${Math.floor(Math.random() * 90000 + 10000)}`;

      const newTx: PaymentTransaction = {
        ...txData,
        id,
        timestamp: timeStr,
        status: 'SETTLED',
        confirmations: txData.rail === 'ONCHAIN_CRYPTO' ? 12 : 1,
        requiredConfirmations: txData.rail === 'ONCHAIN_CRYPTO' ? 12 : 1,
      };

      setPayments((prev) => [newTx, ...prev]);

      // Credit equity & free margin
      setRisk((prev) => {
        const newTotal = prev.totalEquityUsd + txData.fiatValueUsd;
        const newFree = prev.freeMarginUsd + txData.fiatValueUsd;
        return {
          ...prev,
          totalEquityUsd: newTotal,
          freeMarginUsd: newFree,
          marginUtilizationPercent: Number(((prev.usedMarginUsd / (newTotal || 1)) * 100).toFixed(2)),
        };
      });

      // Credit custody balance
      setCustodyBalances((prev) => {
        const existing = prev.find((b) => b.asset === txData.asset);
        if (existing) {
          return prev.map((b) =>
            b.asset === txData.asset
              ? {
                  ...b,
                  total: b.total + txData.amount,
                  free: b.free + txData.amount,
                  usdValue: b.usdValue + txData.fiatValueUsd,
                }
              : b
          );
        }
        return [
          ...prev,
          {
            asset: txData.asset,
            total: txData.amount,
            free: txData.amount,
            lockedInOrders: 0,
            usdValue: txData.fiatValueUsd,
            custodyLocation: 'Fireblocks MPC',
          },
        ];
      });

      const logItem: SystemLog = {
        id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
        timestamp: timeStr.slice(11),
        level: 'INFO',
        subsystem: 'TREASURY_GATEWAY',
        message: `Payment gateway settlement credited: +$${txData.fiatValueUsd.toLocaleString()} (${txData.amount} ${txData.asset}) via ${txData.networkOrMethod}`,
      };
      setLogs((prev) => [logItem, ...prev]);

      showNotification(
        `Payment Cleared: +$${txData.fiatValueUsd.toLocaleString()} credited to margin account!`,
        'success'
      );
      playBeep(1046, 0.12);
      setIsPaymentModalOpen(false);
    },
    [playBeep, showNotification]
  );

  const transferCollateral = useCallback(
    (fromLocation: string, toLocation: string, asset: string, amount: number) => {
      const now = new Date();
      const timeStr = `${now.toISOString().slice(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const id = `XFER-${Math.floor(Math.random() * 90000 + 10000)}`;

      const newTx: PaymentTransaction = {
        id,
        rail: 'CROSS_VENUE',
        asset,
        amount,
        fiatValueUsd: amount,
        status: 'SETTLED',
        timestamp: timeStr,
        networkOrMethod: `${fromLocation} -> ${toLocation}`,
        txHashOrWireRef: `CLR-XFER-${Math.floor(Math.random() * 900000 + 100000)}`,
        targetSubaccount: toLocation,
        confirmations: 1,
        requiredConfirmations: 1,
        direction: 'INTERNAL_TRANSFER',
      };

      setPayments((prev) => [newTx, ...prev]);
      showNotification(`Transferred ${amount} ${asset} from ${fromLocation} to ${toLocation}`, 'info');
    },
    [showNotification]
  );

  // Keyboard shortcut listener:
  // 1-6: switch desk
  // K: open Kill switch modal
  // Cmd/Ctrl + K: open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === '1') setActiveDesk('execution');
      if (e.key === '2') setActiveDesk('strategies');
      if (e.key === '3') setActiveDesk('orderflow');
      if (e.key === '4') setActiveDesk('risk');
      if (e.key === '5') setActiveDesk('diagnostics');
      if (e.key === '6') setActiveDesk('treasury');

      if (e.key.toLowerCase() === 'k' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openKillSwitchModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openKillSwitchModal]);

  return (
    <TerminalContext.Provider
      value={{
        activeDesk,
        setActiveDesk,
        selectedAsset,
        setSelectedAssetSymbol,
        assets,
        orderBook,
        candles,
        timeframe,
        setTimeframe,
        trades,
        positions,
        orders,
        strategies,
        risk,
        coloNodes,
        logs,
        isStreaming,
        toggleStreaming,
        latencyMs,
        isKillSwitchModalOpen,
        openKillSwitchModal,
        closeKillSwitchModal,
        executeEmergencyKill,
        killSwitchArmed,
        placeOrder,
        cancelOrder,
        closePosition,
        updatePositionTpSl,
        toggleStrategyStatus,
        updateStrategyParam,
        deployNewStrategy,
        selectedPrice,
        setSelectedPrice,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        soundEnabled,
        setSoundEnabled,
        notificationMessage,
        clearNotification,
        isPaymentModalOpen,
        openPaymentModal,
        closePaymentModal,
        payments,
        custodyBalances,
        initiatePaymentDeposit,
        transferCollateral,
        viewMode,
        toggleViewMode,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
