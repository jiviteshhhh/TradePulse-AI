# TradePulse AI - Complete API & WebSocket Reference

**Lead Backend Architect:** Gatha Jain ([@gathajain04-ui](https://github.com/gathajain04-ui))  
**Collaborator:** Jivitesh ([@jiviteshhhh](https://github.com/jiviteshhhh))  
**Base URL:** `http://localhost:8000` (or `http://10.0.2.2:8000` for Android Emulator)  
**WebSocket URL:** `ws://localhost:8000/ws/telemetry`  

---

## 📡 REST API Endpoints

### 1. Market Data Router (`/api/v1/market`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/market/assets` | Returns all supported Forex & Crypto tickers with 24h metrics |
| `GET` | `/api/v1/market/orderbook?symbol=EUR/USD` | Returns real-time L2 order book (15 levels bid/ask depth) |
| `GET` | `/api/v1/market/candles?symbol=EUR/USD&timeframe=15m` | Returns OHLCV candlestick series for TradingView chart |

### 2. Orders & Execution Blotter Router (`/api/v1/orders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/orders/` | Lists all active and historical blotter orders |
| `POST` | `/api/v1/orders/` | Dispatches new order (Limit, Market, TWAP, VWAP, Iceberg) |
| `DELETE` | `/api/v1/orders/{order_id}` | Cancels an open blotter order |
| `POST` | `/api/v1/orders/positions/{id}/close` | Closes an open position at current market price |
| `POST` | `/api/v1/orders/positions/{id}/tpsl` | Updates Take-Profit and Stop-Loss brackets |

### 3. Quantitative Strategies Router (`/api/v1/strategies`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/strategies/` | Lists deployed algorithms with Sharpe, win rate, and APY |
| `POST` | `/api/v1/strategies/{id}/toggle` | Pauses or resumes an algorithm live from the terminal |
| `POST` | `/api/v1/strategies/{id}/params` | Calibrates parameters (e.g. min confluence score, risk %) |

### 4. Risk Governance & Telemetry Router (`/api/v1/risk` & `/api/v1/status`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/status` | Returns system health, net equity, PnL, and circuit breaker status |
| `POST` | `/api/v1/risk/kill-switch` | **One-Tap Emergency Kill Switch**: closes all positions and freezes bot |
| `POST` | `/api/v1/risk/max-loss` | Updates Maximum Daily Loss limit ($50 to $500) |
| `POST` | `/api/v1/risk/reset` | Resets circuit breaker after daily drawdown freeze |

### 5. Diagnostics Router (`/api/v1/diagnostics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/diagnostics/colo-nodes` | Returns latencies across Equinix cross-connects (NY4, LD4, TY3, FR2) |
| `GET` | `/api/v1/diagnostics/logs` | Real-time system execution and risk audit logs |

---

## ⚡ Real-Time WebSocket Protocol (`/ws/telemetry`)
* **Cadence:** 1.0 second broadcast interval.
* **Payload Structure:**
```json
{
  "type": "TELEMETRY_UPDATE",
  "timestamp": 1730078400.0,
  "pair": "EUR/USD",
  "current_price": 1.0852,
  "account_equity": 10312.40,
  "account_balance": 10000.0,
  "unrealized_pnl": 312.40,
  "open_trades_count": 1,
  "circuit_breaker": {
    "is_halted": false,
    "total_daily_loss": 0.0,
    "max_daily_loss_limit": 150.0,
    "loss_capacity_used_pct": 0.0
  },
  "signal": {
    "pair": "EUR/USD",
    "direction": "BUY",
    "confluence_score": 0.88,
    "confidence_percentage": 88.0,
    "qualifies_for_execution": true
  }
}
```
