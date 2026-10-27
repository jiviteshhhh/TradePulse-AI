/**
 * Institutional Algorithmic Terminal Data Types
 */

export type DeskId = 'execution' | 'strategies' | 'orderflow' | 'risk' | 'diagnostics' | 'treasury';

export type PaymentRail = 'ONCHAIN_CRYPTO' | 'INSTITUTIONAL_WIRE' | 'CORPORATE_CARD' | 'CROSS_VENUE';
export type PaymentStatus = 'PENDING' | 'CONFIRMING' | 'CLEARED' | 'SETTLED' | 'REJECTED';

export interface PaymentTransaction {
  id: string;
  rail: PaymentRail;
  asset: string;
  amount: number;
  fiatValueUsd: number;
  status: PaymentStatus;
  timestamp: string;
  networkOrMethod: string;
  txHashOrWireRef: string;
  targetSubaccount: string;
  confirmations: number;
  requiredConfirmations: number;
  direction: 'DEPOSIT' | 'WITHDRAWAL' | 'INTERNAL_TRANSFER';
}

export interface CustodyBalance {
  asset: string;
  total: number;
  free: number;
  lockedInOrders: number;
  usdValue: number;
  custodyLocation: 'Fireblocks MPC' | 'Copper ClearLoop' | 'Exchange Cold Vault' | 'J.P. Morgan Treasury';
}

export interface Asset {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  markPrice: number;
  indexPrice: number;
  fundingRate: number; // e.g. 0.0001 = 0.01%
  nextFundingMinutes: number;
  tickSize: number;
  minOrderSize: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  depthPercent: number;
  ordersCount: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
  midPrice: number;
  bidDepthTotal: number;
  askDepthTotal: number;
  imbalanceRatio: number; // -1 to 1 (negative = ask heavy, positive = bid heavy)
}

export interface TapeTrade {
  id: string;
  timestamp: string;
  price: number;
  size: number;
  valueUsd: number;
  side: 'buy' | 'sell';
  isBlockTrade: boolean;
  venue: string;
}

export type OrderType = 'LIMIT' | 'MARKET' | 'TWAP' | 'VWAP' | 'ICEBERG' | 'SNIPER' | 'PEG';
export type OrderSide = 'buy' | 'sell';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'POST_ONLY';
export type OrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED';

export interface AlgoOrder {
  id: string;
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  size: number;
  filledSize: number;
  price: number;
  avgFillPrice: number;
  status: OrderStatus;
  timestamp: string;
  venue: string;
  timeInForce: TimeInForce;
  slippageTolerancePercent: number;
  postOnly: boolean;
  reduceOnly: boolean;
  notes?: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  notionalUsd: number;
  entryPrice: number;
  markPrice: number;
  liqPrice: number;
  marginRatio: number; // e.g. 0.12 (12%)
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  leverage: number;
  tpPrice?: number;
  slPrice?: number;
  venue: string;
  openedAt: string;
}

export interface StrategyParameter {
  key: string;
  label: string;
  value: number | string;
  type: 'number' | 'text' | 'boolean' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  description: string;
}

export interface Strategy {
  id: string;
  name: string;
  code: string;
  category: 'Arbitrage' | 'Market Making' | 'Momentum' | 'Volatility' | 'Liquidity Sweep';
  status: 'ACTIVE' | 'PAUSED' | 'HALTED';
  uptime: number; // e.g. 99.8%
  allocatedUsd: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  totalPnl: number;
  apy: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  ordersPerSec: number;
  totalExecutions: number;
  alphaScore: number;
  betaToBtc: number;
  inventoryDelta: number;
  latencyAvgMs: number;
  lastAction: string;
  parameters: StrategyParameter[];
}

export interface RiskMetrics {
  totalEquityUsd: number;
  freeMarginUsd: number;
  usedMarginUsd: number;
  marginUtilizationPercent: number;
  var99_1dUsd: number;
  var99_1dPercent: number;
  cvar99_1dUsd: number; // Expected Shortfall
  portfolioDeltaUsd: number;
  portfolioGamma: number;
  portfolioVega: number;
  portfolioThetaPerDay: number;
  effectiveLeverage: number;
  circuitBreakerStatus: 'NORMAL' | 'TRIGGERED' | 'ARMED';
  activePositionsCount: number;
  dailyDrawdownPercent: number;
}

export interface ColoNode {
  id: string;
  name: string;
  city: string;
  region: string;
  ip: string;
  coloCode: string; // TY3, NY4, LD4, FR2, SG1
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  fixStatus: 'LOGGED_IN' | 'CONNECTING' | 'DISCONNECTED';
  fpgaEnabled: boolean;
  status: 'OPTIMAL' | 'DEGRADED' | 'DISRUPTED';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'EXEC' | 'RISK_ALERT' | 'ERROR';
  subsystem: string;
  message: string;
}

export interface VenueQuote {
  venue: string;
  bid: number;
  ask: number;
  spread: number;
  latencyMs: number;
  fillRatePercent: number;
  routedVolumeShare: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}
