"""
TradePulse AI - Technical Indicators & Quantitative Calculus
Calculates EMA, RSI, VWAP, and ATR for US Forex Sessions
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from typing import List, Dict, Tuple
from pydantic import BaseModel


class Candle(BaseModel):
    timestamp: float
    open: float
    high: float
    low: float
    close: float
    volume: float


class TechnicalIndicators:
    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> List[float]:
        if len(prices) < period:
            return []
        multiplier = 2.0 / (period + 1.0)
        # Seed with SMA
        ema = [sum(prices[:period]) / period]
        for price in prices[period:]:
            ema.append((price - ema[-1]) * multiplier + ema[-1])
        return ema

    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> float:
        if len(prices) <= period:
            return 50.0  # Neutral fallback

        gains = []
        losses = []
        for i in range(1, len(prices)):
            diff = prices[i] - prices[i - 1]
            if diff >= 0:
                gains.append(diff)
                losses.append(0.0)
            else:
                gains.append(0.0)
                losses.append(abs(diff))

        if len(gains) < period:
            return 50.0

        avg_gain = sum(gains[:period]) / period
        avg_loss = sum(losses[:period]) / period

        for i in range(period, len(gains)):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return round(100.0 - (100.0 / (1.0 + rs)), 2)

    @staticmethod
    def calculate_vwap(candles: List[Candle]) -> float:
        if not candles:
            return 0.0
        cum_volume_price = sum(((c.high + c.low + c.close) / 3.0) * c.volume for c in candles)
        cum_volume = sum(c.volume for c in candles)
        return round(cum_volume_price / cum_volume, 5) if cum_volume > 0 else candles[-1].close

    @staticmethod
    def calculate_atr(candles: List[Candle], period: int = 14) -> float:
        """Computes Average True Range for volatility-based dynamic stop loss."""
        if len(candles) < 2:
            return 0.0010  # default 10 pips

        true_ranges = []
        for i in range(1, len(candles)):
            c_curr = candles[i]
            c_prev = candles[i - 1]
            tr = max(
                c_curr.high - c_curr.low,
                abs(c_curr.high - c_prev.close),
                abs(c_curr.low - c_prev.close)
            )
            true_ranges.append(tr)

        if len(true_ranges) < period:
            return round(sum(true_ranges) / len(true_ranges), 5)

        atr = sum(true_ranges[:period]) / period
        for tr in true_ranges[period:]:
            atr = (atr * (period - 1) + tr) / period
        return round(atr, 5)
