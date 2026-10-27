"""
TradePulse AI - Institutional Algorithmic Backend Engine
Entry Point, Real-Time Market Simulation & WebSocket Telemetry
Maintained by: Gatha Jain (@gathajain04-ui)
Collaborator: Jivitesh (@jiviteshhhh)
"""

import asyncio
import random
import time
from typing import Dict, List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .nlp_sentiment.news_feed import NewsFeedManager
from .strategy.technicals import Candle
from .strategy.confluence_engine import ConfluenceEngine, ConfluenceSignal
from .risk_engine.circuit_breaker import CircuitBreakerEngine
from .risk_engine.position_sizer import PositionSizer
from .broker.paper_account import PaperBrokerGateway
from .routers import telemetry, trades, websocket_stream, market, orders, strategies, diagnostics
from .routers.websocket_stream import manager
from .routers.market import generate_live_orderbook
from .routers.strategies import STRATEGIES_DB

app = FastAPI(
    title="TradePulse AI - Institutional Algorithmic Trading Server",
    description="Backend engine powering the Institutional Algorithmic Terminal & Native Android Studio App",
    version="2.0.0"
)

# CORS enabled for all origins, local browser, Vite (5173), and Android Emulator (10.0.2.2)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Global Services
broker = PaperBrokerGateway(initial_balance=settings.starting_balance)
circuit_breaker = CircuitBreakerEngine(
    starting_balance=settings.starting_balance,
    max_daily_loss=settings.max_daily_loss_limit
)
news_manager = NewsFeedManager()
confluence_engine = ConfluenceEngine(news_manager, min_confluence=settings.min_confluence_score)

active_pair = settings.active_pair
current_prices: Dict[str, float] = {
    "EUR/USD": 1.0850,
    "GBP/USD": 1.2980,
    "USD/JPY": 152.40,
    "USD/CHF": 0.8650,
    "BTC-PERP": 94820.5,
    "ETH-PERP": 3415.8,
    "SOL-PERP": 184.45
}
candles_cache: Dict[str, List[Candle]] = {}
latest_signal: Dict = {}

# Attach Sub-Routers
app.include_router(telemetry.router)
app.include_router(trades.router)
app.include_router(websocket_stream.router)
app.include_router(market.router)
app.include_router(orders.router)
app.include_router(strategies.router)
app.include_router(diagnostics.router)


def _seed_candles(pair: str, base_price: float):
    candles = []
    curr = base_price
    t = time.time() - 3600 * 12
    for _ in range(60):
        o = curr
        delta = 0.0008 if "/" in pair and "JPY" not in pair else (0.5 if "JPY" in pair else 80.0)
        h = o + random.uniform(0.0001, delta)
        l = o - random.uniform(0.0001, delta)
        c = random.uniform(l, h)
        v = random.uniform(1500, 9500)
        curr = c
        candles.append(Candle(timestamp=t, open=round(o, 5 if delta < 1 else 2), high=round(h, 5 if delta < 1 else 2), low=round(l, 5 if delta < 1 else 2), close=round(c, 5 if delta < 1 else 2), volume=v))
        t += 900  # 15 min candles
    candles_cache[pair] = candles


async def market_simulation_and_trading_loop():
    """Background engine simulating real-time market ticks, confluence evaluation, and automated trade dispatch."""
    global latest_signal
    _seed_candles("EUR/USD", 1.0850)
    _seed_candles("GBP/USD", 1.2980)
    _seed_candles("USD/JPY", 152.40)
    _seed_candles("BTC-PERP", 94820.5)

    while True:
        try:
            # 1. Simulate tick movement on US Forex Session & Majors
            for pair in ["EUR/USD", "GBP/USD", "USD/JPY"]:
                tick_step = 0.0001 if "JPY" not in pair else 0.02
                delta = random.choice([-tick_step, -tick_step * 0.5, 0.0, tick_step * 0.5, tick_step])
                precision = 5 if "JPY" not in pair else 2
                current_prices[pair] = round(current_prices[pair] + delta, precision)

                pair_candles = candles_cache.setdefault(pair, [])
                if pair_candles:
                    pair_candles[-1].close = current_prices[pair]
                    pair_candles[-1].high = max(pair_candles[-1].high, current_prices[pair])
                    pair_candles[-1].low = min(pair_candles[-1].low, current_prices[pair])
                    pair_candles[-1].volume += random.uniform(15, 80)

            # Crypto tick drift
            current_prices["BTC-PERP"] = round(current_prices["BTC-PERP"] + random.uniform(-12.0, 12.0), 1)

            # 2. Broker updates: recalculate open positions PnL & check stop-loss/take-profit
            broker.update_ticks(current_prices)

            # 3. Risk Engine Check: Evaluate daily loss vs. max limit
            open_pnl = sum(p.floating_pnl for p in broker.open_positions.values())
            risk_status = circuit_breaker.evaluate_risk(broker.get_equity(), open_pnl)

            # If circuit breaker tripped, instantly liquidate all positions
            if risk_status.is_halted and broker.open_positions:
                broker.emergency_liquidate_all(reason=risk_status.halt_reason)

            # 4. Evaluate Confluence Signal on active pair (EUR/USD)
            signal = confluence_engine.evaluate("EUR/USD", candles_cache.get("EUR/USD", []))
            latest_signal = signal.dict()

            # 5. Automated Execution (if qualifies and risk permits)
            can_trade, reason = circuit_breaker.can_open_new_trade()
            if can_trade and signal.qualifies_for_execution and len(broker.open_positions) < settings.max_open_positions:
                # Dynamic Position Sizing based on ATR Stop
                lot_size, _ = PositionSizer.calculate_lot_size(
                    account_balance=broker.balance,
                    risk_pct=settings.risk_percentage_per_trade,
                    entry_price=signal.current_price,
                    stop_loss=signal.recommended_stop_loss,
                    pair="EUR/USD"
                )
                broker.execute_order(
                    pair=signal.pair,
                    direction=signal.direction,
                    lot_size=lot_size,
                    current_price=signal.current_price,
                    stop_loss=signal.recommended_stop_loss,
                    take_profit=signal.recommended_take_profit
                )

            # 6. Generate Live Orderbook for active pair
            live_ob = generate_live_orderbook("EUR/USD", current_prices["EUR/USD"], 0.0001)

            # 7. Compute Terminal-level Institutional Risk Metrics
            used_margin = sum(p.lot_size * 1000.0 for p in broker.open_positions.values())
            free_margin = max(0.0, broker.get_equity() - used_margin)
            margin_utilization = round((used_margin / (broker.get_equity() or 1.0)) * 100, 2)

            risk_metrics_payload = {
                "totalEquityUsd": broker.get_equity(),
                "freeMarginUsd": round(free_margin, 2),
                "usedMarginUsd": round(used_margin, 2),
                "marginUtilizationPercent": margin_utilization,
                "var99_1dUsd": round(broker.get_equity() * 0.018, 2),
                "var99_1dPercent": 1.80,
                "cvar99_1dUsd": round(broker.get_equity() * 0.024, 2),
                "portfolioDeltaUsd": round(sum(p.lot_size * 100000.0 for p in broker.open_positions.values() if p.direction == "BUY") - sum(p.lot_size * 100000.0 for p in broker.open_positions.values() if p.direction == "SELL"), 2),
                "portfolioGamma": 0.012,
                "portfolioVega": 14.5,
                "portfolioThetaPerDay": -22.4,
                "effectiveLeverage": round(used_margin / (broker.get_equity() or 1.0) * 10.0, 2),
                "circuitBreakerStatus": "TRIGGERED" if risk_status.is_halted else "NORMAL",
                "activePositionsCount": len(broker.open_positions),
                "dailyDrawdownPercent": risk_status.loss_capacity_used_pct
            }

            # 8. Broadcast comprehensive telemetry packet via WebSocket
            telemetry_payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": time.time(),
                "pair": "EUR/USD",
                "current_price": current_prices["EUR/USD"],
                "account_equity": broker.get_equity(),
                "account_balance": broker.balance,
                "unrealized_pnl": open_pnl,
                "open_trades_count": len(broker.open_positions),
                "open_positions": [p.dict() for p in broker.open_positions.values()],
                "circuit_breaker": risk_status.dict(),
                "risk_metrics": risk_metrics_payload,
                "signal": latest_signal,
                "orderbook": live_ob,
                "sentiment_usd": news_manager.get_currency_sentiment("USD")
            }
            await manager.broadcast(telemetry_payload)

        except Exception as e:
            print(f"[Market Loop Error]: {e}")

        await asyncio.sleep(1.0)  # 1-second cadence


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(market_simulation_and_trading_loop())


@app.get("/")
def health_check():
    return {
        "service": "TradePulse AI - Institutional Algorithmic Trading Server",
        "author": "Gatha Jain (@gathajain04-ui)",
        "collaborator": "Jivitesh (@jiviteshhhh)",
        "status": "ONLINE",
        "docs_url": "/docs",
        "websocket_url": "/ws/telemetry"
    }
