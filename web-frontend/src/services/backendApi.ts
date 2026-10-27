/**
 * TradePulse AI - Backend Bridge Service
 * Connects the Institutional Algorithmic Terminal to Gatha's FastAPI Backend
 * & Android Studio Kotlin Bridge
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
  open_positions: Array<{
    id: string;
    pair: string;
    direction: string;
    lot_size: number;
    entry_price: number;
    current_price: number;
    stop_loss: number;
    take_profit: number;
    floating_pnl: number;
    pips_gained: number;
    status: string;
  }>;
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
      console.log(`[TradePulse AI] Connecting to Backend WebSocket: ${url}`);
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
          // ignore keepalive
        }
      };

      this.ws.onclose = () => {
        console.warn('[TradePulse AI] Backend WebSocket disconnected. Reconnecting in 3s...');
        if (!this.reconnectInterval) {
          this.reconnectInterval = setInterval(() => this.connectWebSocket(), 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[TradePulse AI] WebSocket error (Backend offline or starting up):', err);
      };
    } catch (err) {
      console.warn('[TradePulse AI] Could not initialize WebSocket:', err);
    }
  }

  public onTelemetry(callback: (data: BackendTelemetry) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public async triggerKillSwitch(reason: string = 'User Clicked Emergency Kill Switch') {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.onKillSwitchTriggered) {
      (window as any).AndroidBridge.onKillSwitchTriggered(reason);
    }

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/risk/kill-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: true, reason }),
      });
      return await res.json();
    } catch (err) {
      console.warn('[TradePulse AI] Failed to POST kill-switch to backend:', err);
      return null;
    }
  }

  public async updateMaxDailyLoss(maxDailyLoss: number) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/risk/max-loss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_daily_loss: maxDailyLoss }),
      });
      return await res.json();
    } catch (err) {
      console.warn('[TradePulse AI] Failed to update max loss:', err);
      return null;
    }
  }

  public async fetchSystemStatus() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/status`);
      return await res.json();
    } catch (err) {
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
