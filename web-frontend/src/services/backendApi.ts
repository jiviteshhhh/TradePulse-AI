/**
 * TradePulse AI - Full-Featured Institutional Backend Client
 * Connects the Algorithmic Terminal to Gatha's Python/FastAPI Backend & Android Bridge
 * Maintained by: Gatha Jain (@gathajain04-ui) & Jivitesh (@jiviteshhhh)
 */

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

const getWsUrl = () => {
  if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
    return 'ws://10.0.2.2:8000/ws/telemetry';
  }
  return 'ws://localhost:8000/ws/telemetry';
};

export interface BackendTelemetry {
  type: string;
  timestamp: number;
  pair: string;
  current_price: number;
  account_equity: number;
  account_balance: number;
  unrealized_pnl: number;
  open_trades_count: number;
  open_positions: Array<any>;
  circuit_breaker: {
    circuit_breaker_active: boolean;
    is_halted: boolean;
    halt_reason: string;
    starting_daily_balance: number;
    current_equity: number;
    total_daily_loss: number;
    max_daily_loss_limit: number;
    loss_capacity_used_pct: number;
    emergency_kill_switch_engaged: boolean;
  };
  risk_metrics?: any;
  orderbook?: any;
  signal: {
    pair: string;
    direction: string;
    confluence_score: number;
    confidence_percentage: number;
    reasoning_tags: string[];
    qualifies_for_execution: boolean;
  };
  sentiment_usd: number;
}

export class BackendApiService {
  private ws: WebSocket | null = null;
  private listeners: ((data: BackendTelemetry) => void)[] = [];
  private reconnectInterval: any = null;

  constructor() {
    this.connectWebSocket();
  }

  public connectWebSocket() {
    try {
      const url = getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[TradePulse AI] WebSocket connected to Python Backend');
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TELEMETRY_UPDATE') {
            this.listeners.forEach((cb) => cb(payload));
          }
        } catch (e) {
          // ignore
        }
      };

      this.ws.onclose = () => {
        if (!this.reconnectInterval) {
          this.reconnectInterval = setInterval(() => this.connectWebSocket(), 3000);
        }
      };

      this.ws.onerror = () => {
        // quiet fallback
      };
    } catch (err) {
      // quiet fallback
    }
  }

  public onTelemetry(callback: (data: BackendTelemetry) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public sendWsCommand(action: string, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, ...payload }));
    }
  }

  // --- Order Blotter & Execution ---
  public async placeOrder(orderParams: any) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderParams),
      });
      return await res.json();
    } catch (e) {
      console.warn('[TradePulse AI] Could not place order via backend:', e);
      return null;
    }
  }

  public async cancelOrder(orderId: string) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/orders/${orderId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  public async closePosition(positionId: string) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/orders/positions/${positionId}/close`, {
        method: 'POST',
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  public async updatePositionTpSl(positionId: string, tp?: number, sl?: number) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/orders/positions/${positionId}/tpsl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takeProfit: tp, stopLoss: sl }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // --- Quantitative Strategies ---
  public async fetchStrategies() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/strategies/`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  public async toggleStrategy(strategyId: string) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/strategies/${strategyId}/toggle`, {
        method: 'POST',
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  public async updateStrategyParam(strategyId: string, key: string, value: any) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/strategies/${strategyId}/params`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // --- Risk Governance & Kill Switch ---
  public async triggerKillSwitch(reason: string = 'User Clicked Emergency Kill Switch') {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.onKillSwitchTriggered) {
      (window as any).AndroidBridge.onKillSwitchTriggered(reason);
    }

    this.sendWsCommand('KILL_SWITCH', { mode: 'FULL_FLATTEN', reason });

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/risk/kill-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: true, reason }),
      });
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  public async updateMaxDailyLoss(maxDailyLoss: number) {
    this.sendWsCommand('UPDATE_MAX_LOSS', { max_daily_loss: maxDailyLoss });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/risk/max-loss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_daily_loss: maxDailyLoss }),
      });
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  // --- Diagnostics ---
  public async fetchColoNodes() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/diagnostics/colo-nodes`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  public async fetchLogs() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/diagnostics/logs`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // --- Market Data ---
  public async fetchOrderBook(symbol: string) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/market/orderbook?symbol=${encodeURIComponent(symbol)}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  public async fetchCandles(symbol: string, timeframe: string = '15m') {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/market/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
