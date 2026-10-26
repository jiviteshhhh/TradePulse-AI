"""
TradePulse AI - Autonomous Forex Trading Backend Engine
Entry Point & Async Market Orchestration
Maintained by: Gatha Jain (@gathajain04-ui)
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
from .routers import telemetry, trades, websocket_stream
from .routers.websocket_stream import manager

app = FastAPI(
    title="TradePulse AI - Forex Trading Engine",
    description="Autonomous Multi-Factor US Forex Bot with Circuit Breaker Risk Governance",
    version="1.0.0"
)

# CORS enabled for Android Studio Emulator (10.0.2.2) and local WiFi devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
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
    "USD/CHF": 0.8650
}
candles_cache: Dict[str, List[Candle]] = {}
latest_signal: Dict = {}

# Attach Sub-Routers
app.include_router(telemetry.router)
app.include_router(trades.router)
app.include_router(websocket_stream.router)


def _seed_candles(pair: str, base_price: float):
    candles = []
    curr = base_price
    t = time.time() - 3600 * 10
    for _ in range(50):
        o = curr
        h = o + random.uniform(0.0003, 0.0012)
        l = o - random.uniform(0.0003, 0.0012)
        c = random.uniform(l, h)
        v = random.uniform(1500, 8500)
        curr = c
        candles.append(Candle(timestamp=t, open=round(o, 5), high=round(h, 5), low=round(l, 5), close=round(c, 5), volume=v))
        t += 900  # 15 min candles
    candles_cache[pair] = candles


async def market_simulation_and_trading_loop():
    """Background engine simulating real-time market ticks, confluence evaluation, and automated trade dispatch."""
    global latest_signal
    _seed_candles("EUR/USD", 1.0850)

    while True:
        try:
            # 1. Simulate tick movement on US Forex Session
            delta = random.choice([-0.0002, -0.0001, 0.0, 0.0001, 0.0002])
            current_prices["EUR/USD"] = round(current_prices["EUR/USD"] + delta, 5)

            # Update latest candle
            pair_candles = candles_cache.setdefault("EUR/USD", [])
            if pair_candles:
                pair_candles[-1].close = current_prices["EUR/USD"]
                pair_candles[-1].high = max(pair_candles[-1].high, current_prices["EUR/USD"])
                pair_candles[-1].low = min(pair_candles[-1].low, current_prices["EUR/USD"])
                pair_candles[-1].volume += random.uniform(20, 100)

            # 2. Broker updates: recalculate open position PnL & check stop-loss/take-profit
            broker.update_ticks(current_prices)

            # 3. Risk Engine Check: Evaluate daily loss vs. max limit
            open_pnl = sum(p.floating_pnl for p in broker.open_positions.values())
            risk_status = circuit_breaker.evaluate_risk(broker.get_equity(), open_pnl)

            # If circuit breaker tripped, instantly liquidate all positions
            if risk_status.is_halted and broker.open_positions:
                broker.emergency_liquidate_all(reason=risk_status.halt_reason)

            # 4. Evaluate Confluence Signal
            signal = confluence_engine.evaluate("EUR/USD", pair_candles)
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

            # 6. Broadcast telemetry packet via WebSocket to Android devices
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
                "signal": latest_signal,
                "sentiment_usd": news_manager.get_currency_sentiment("USD")
            }
            await manager.broadcast(telemetry_payload)

        except Exception as e:
            print(f"[Engine Error]: {e}")

        await asyncio.sleep(1.0)  # 1-second tick cadence


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(market_simulation_and_trading_loop())


@app.get("/")
def health_check():
    return {
        "service": "TradePulse AI Engine",
        "author": "Gatha Jain (@gathajain04-ui)",
        "collaborator": "Jivitesh (@jiviteshhhh)",
        "status": "ONLINE",
        "docs_url": "/docs"
    }
