"""
TradePulse AI - Confluence Decision Matrix
Enforces Multi-Factor Gating (Technicals + Volume + News Sentiment >= 80%)
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from typing import List, Optional
from pydantic import BaseModel
from .technicals import Candle, TechnicalIndicators
from ..nlp_sentiment.news_feed import NewsFeedManager


class ConfluenceSignal(BaseModel):
    pair: str
    direction: str  # "BUY", "SELL", or "HOLD"
    confluence_score: float  # 0.0 to 1.0 (requires >= 0.80)
    current_price: float
    recommended_stop_loss: float
    recommended_take_profit: float
    risk_reward_ratio: float
    confidence_percentage: float
    reasoning_tags: List[str]
    qualifies_for_execution: bool


class ConfluenceEngine:
    def __init__(self, news_manager: NewsFeedManager, min_confluence: float = 0.80):
        self.news_manager = news_manager
        self.min_confluence = min_confluence

    def evaluate(self, pair: str, candles: List[Candle]) -> ConfluenceSignal:
        if len(candles) < 30:
            return ConfluenceSignal(
                pair=pair, direction="HOLD", confluence_score=0.0,
                current_price=candles[-1].close if candles else 1.0850,
                recommended_stop_loss=0.0, recommended_take_profit=0.0,
                risk_reward_ratio=0.0, confidence_percentage=0.0,
                reasoning_tags=["Insufficient market candles"],
                qualifies_for_execution=False
            )

        closes = [c.close for c in candles]
        curr_price = closes[-1]

        # 1. Technical Analysis Factors
        ema20 = TechnicalIndicators.calculate_ema(closes, 20)
        ema50 = TechnicalIndicators.calculate_ema(closes, 50)
        rsi = TechnicalIndicators.calculate_rsi(closes, 14)
        vwap = TechnicalIndicators.calculate_vwap(candles[-30:])
        atr = TechnicalIndicators.calculate_atr(candles, 14)

        # 2. News Sentiment Factor (-1.0 to +1.0)
        # For EUR/USD: Base is EUR, Quote is USD. Bullish USD = Bearish EUR/USD.
        usd_sentiment = self.news_manager.get_currency_sentiment("USD")
        eur_sentiment = self.news_manager.get_currency_sentiment("EUR")

        bullish_points = 0.0
        bearish_points = 0.0
        tags = []

        # Technical Score Breakdown (Max 40 points)
        if ema20 and ema50:
            if ema20[-1] > ema50[-1] and curr_price > ema20[-1]:
                bullish_points += 15
                tags.append("EMA Alignment: Bullish Golden Cross")
            elif ema20[-1] < ema50[-1] and curr_price < ema20[-1]:
                bearish_points += 15
                tags.append("EMA Alignment: Bearish Death Cross")

        if rsi < 38:
            bullish_points += 15
            tags.append(f"RSI Momentum: Oversold Reversal ({rsi})")
        elif rsi > 62:
            bearish_points += 15
            tags.append(f"RSI Momentum: Overbought Exhaustion ({rsi})")
        else:
            tags.append(f"RSI Range: Neutral ({rsi})")

        if curr_price > vwap:
            bullish_points += 10
            tags.append("VWAP: Trading Above Institutional Average")
        else:
            bearish_points += 10
            tags.append("VWAP: Trading Below Institutional Average")

        # Volume Surge Factor (Max 25 points)
        avg_vol = sum(c.volume for c in candles[-20:]) / 20.0
        latest_vol = candles[-1].volume
        if latest_vol > avg_vol * 1.3:
            if curr_price > candles[-1].open:
                bullish_points += 25
                tags.append(f"Volume Surge: Institutional Buying (+{int((latest_vol/avg_vol - 1)*100)}%)")
            else:
                bearish_points += 25
                tags.append(f"Volume Surge: Institutional Selling (+{int((latest_vol/avg_vol - 1)*100)}%)")
        else:
            tags.append("Volume: Normal Retail Flow")

        # Macro News Sentiment Factor (Max 35 points)
        # Relative macro strength: EUR sentiment minus USD sentiment
        net_macro_pair = eur_sentiment - usd_sentiment
        if net_macro_pair > 0.20:
            bullish_points += 35
            tags.append(f"Macro Sentiment: Pro-Euro / Dovish USD (+{round(net_macro_pair, 2)})")
        elif net_macro_pair < -0.20:
            bearish_points += 35
            tags.append(f"Macro Sentiment: Hawkish Fed / Strong Dollar ({round(net_macro_pair, 2)})")
        else:
            tags.append(f"Macro Sentiment: Balanced ({round(net_macro_pair, 2)})")

        # Determine Winning Direction & Score
        if bullish_points > bearish_points:
            direction = "BUY"
            raw_score = bullish_points / 100.0
            sl_distance = max(atr * 1.5, 0.0015)  # min 15 pips
            tp_distance = sl_distance * 2.0       # 1:2 Risk to Reward
            stop_loss = round(curr_price - sl_distance, 5)
            take_profit = round(curr_price + tp_distance, 5)
        elif bearish_points > bullish_points:
            direction = "SELL"
            raw_score = bearish_points / 100.0
            sl_distance = max(atr * 1.5, 0.0015)
            tp_distance = sl_distance * 2.0
            stop_loss = round(curr_price + sl_distance, 5)
            take_profit = round(curr_price - tp_distance, 5)
        else:
            direction = "HOLD"
            raw_score = 0.50
            stop_loss = 0.0
            take_profit = 0.0

        confluence_score = round(raw_score, 2)
        qualifies = (direction != "HOLD") and (confluence_score >= self.min_confluence)

        return ConfluenceSignal(
            pair=pair,
            direction=direction if qualifies else "HOLD",
            confluence_score=confluence_score,
            current_price=round(curr_price, 5),
            recommended_stop_loss=stop_loss,
            recommended_take_profit=take_profit,
            risk_reward_ratio=2.0 if qualifies else 0.0,
            confidence_percentage=round(confluence_score * 100.0, 1),
            reasoning_tags=tags,
            qualifies_for_execution=qualifies
        )
