"""
TradePulse AI - Market Data Router
Provides Live L2 OrderBook, Candlestick History, Tape Trades & Asset Quotes
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import time
import random
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query
from ..compat import BaseModel

router = APIRouter(prefix="/api/v1/market", tags=["Market Data"])


class AssetQuote(BaseModel):
    symbol: str
    baseAsset: str
    quoteAsset: str
    price: float
    change24h: float
    change24hPercent: float
    high24h: float
    low24h: float
    volume24h: float
    markPrice: float
    indexPrice: float
    fundingRate: float
    nextFundingMinutes: int
    tickSize: float
    minOrderSize: float


class OrderBookLevel(BaseModel):
    price: float
    size: float
    total: float
    depthPercent: float
    ordersCount: int


class OrderBookResponse(BaseModel):
    symbol: str
    bids: List[Dict[str, Any]]
    asks: List[Dict[str, Any]]
    spread: float
    spreadPercent: float
    midPrice: float
    bidDepthTotal: float
    askDepthTotal: float
    imbalanceRatio: float


def generate_live_orderbook(symbol: str, mid_price: float, tick_size: float = 0.0001) -> Dict[str, Any]:
    levels_count = 15
    bids = []
    asks = []
    cum_bid = 0.0
    cum_ask = 0.0

    for i in range(1, levels_count + 1):
        # Bids below mid
        p_bid = round(mid_price - (i * tick_size * random.uniform(0.8, 1.2)), 5 if tick_size < 0.01 else 2)
        s_bid = round(random.uniform(0.5, 4.5), 2)
        cum_bid += s_bid
        bids.append({
            "price": p_bid,
            "size": s_bid,
            "total": round(cum_bid, 2),
            "depthPercent": min(100.0, round((cum_bid / 50.0) * 100, 1)),
            "ordersCount": random.randint(1, 8)
        })

        # Asks above mid
        p_ask = round(mid_price + (i * tick_size * random.uniform(0.8, 1.2)), 5 if tick_size < 0.01 else 2)
        s_ask = round(random.uniform(0.5, 4.5), 2)
        cum_ask += s_ask
        asks.append({
            "price": p_ask,
            "size": s_ask,
            "total": round(cum_ask, 2),
            "depthPercent": min(100.0, round((cum_ask / 50.0) * 100, 1)),
            "ordersCount": random.randint(1, 8)
        })

    spread = round(asks[0]["price"] - bids[0]["price"], 5 if tick_size < 0.01 else 2)
    spread_pct = round((spread / mid_price) * 100, 4)
    imbalance = round((cum_bid - cum_ask) / (cum_bid + cum_ask), 2)

    return {
        "symbol": symbol,
        "bids": bids,
        "asks": asks,
        "spread": spread,
        "spreadPercent": spread_pct,
        "midPrice": round(mid_price, 5 if tick_size < 0.01 else 2),
        "bidDepthTotal": round(cum_bid, 2),
        "askDepthTotal": round(cum_ask, 2),
        "imbalanceRatio": imbalance
    }


@router.get("/assets")
def get_assets():
    from ..main import current_prices
    assets = [
        {
            "symbol": "EUR/USD",
            "baseAsset": "EUR",
            "quoteAsset": "USD",
            "price": current_prices.get("EUR/USD", 1.0850),
            "change24h": 0.0032,
            "change24hPercent": 0.30,
            "high24h": 1.0885,
            "low24h": 1.0830,
            "volume24h": 18450000000,
            "markPrice": current_prices.get("EUR/USD", 1.0850),
            "indexPrice": current_prices.get("EUR/USD", 1.0850),
            "fundingRate": 0.00005,
            "nextFundingMinutes": 60,
            "tickSize": 0.0001,
            "minOrderSize": 0.01
        },
        {
            "symbol": "GBP/USD",
            "baseAsset": "GBP",
            "quoteAsset": "USD",
            "price": current_prices.get("GBP/USD", 1.2980),
            "change24h": 0.0045,
            "change24hPercent": 0.35,
            "high24h": 1.3020,
            "low24h": 1.2940,
            "volume24h": 12400000000,
            "markPrice": current_prices.get("GBP/USD", 1.2980),
            "indexPrice": current_prices.get("GBP/USD", 1.2980),
            "fundingRate": 0.00005,
            "nextFundingMinutes": 60,
            "tickSize": 0.0001,
            "minOrderSize": 0.01
        },
        {
            "symbol": "USD/JPY",
            "baseAsset": "USD",
            "quoteAsset": "JPY",
            "price": current_prices.get("USD/JPY", 152.40),
            "change24h": -0.65,
            "change24hPercent": -0.42,
            "high24h": 153.20,
            "low24h": 151.90,
            "volume24h": 15900000000,
            "markPrice": current_prices.get("USD/JPY", 152.40),
            "indexPrice": current_prices.get("USD/JPY", 152.40),
            "fundingRate": -0.00002,
            "nextFundingMinutes": 60,
            "tickSize": 0.01,
            "minOrderSize": 0.01
        },
        {
            "symbol": "BTC-PERP",
            "baseAsset": "BTC",
            "quoteAsset": "USD",
            "price": 94820.5,
            "change24h": 2618.3,
            "change24hPercent": 2.84,
            "high24h": 96150.0,
            "low24h": 93410.0,
            "volume24h": 2841920000,
            "markPrice": 94822.1,
            "indexPrice": 94819.8,
            "fundingRate": 0.00012,
            "nextFundingMinutes": 184,
            "tickSize": 0.5,
            "minOrderSize": 0.001
        }
    ]
    return assets


@router.get("/orderbook")
def get_orderbook(symbol: str = "EUR/USD"):
    from ..main import current_prices
    mid = current_prices.get(symbol, 1.0850)
    tick = 0.0001 if "/" in symbol and "JPY" not in symbol else (0.01 if "JPY" in symbol else 0.5)
    return generate_live_orderbook(symbol, mid, tick)


@router.get("/candles")
def get_candles(symbol: str = "EUR/USD", timeframe: str = "15m", limit: int = 50):
    from ..main import candles_cache, current_prices
    candles = candles_cache.get(symbol)
    if not candles:
        # Generate initial series
        base = current_prices.get(symbol, 1.0850)
        from ..main import _seed_candles
        _seed_candles(symbol, base)
        candles = candles_cache.get(symbol, [])

    formatted = []
    for c in candles[-limit:]:
        formatted.append({
            "time": int(c.timestamp),
            "open": c.open,
            "high": c.high,
            "low": c.low,
            "close": c.close,
            "volume": c.volume
        })
    return formatted
