"""
TradePulse AI - NLP News Sentiment Analysis Engine
Evaluates US Macroeconomic News & Sentiment using Financial NLP
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import time
from typing import Dict, List, Optional
from ..compat import BaseModel


class NewsItem(BaseModel):
    id: str
    headline: str
    source: str
    timestamp: float
    sentiment_score: float  # -1.0 (Strongly Bearish) to +1.0 (Strongly Bullish)
    sentiment_label: str    # BULLISH, BEARISH, NEUTRAL
    impact_level: str       # HIGH, MEDIUM, LOW
    currency_affected: str  # USD, EUR, GBP, JPY


class SentimentAnalyzer:
    """
    Financial NLP Classifier trained on Macroeconomic & Central Bank Lexicons.
    Emulates FinBERT transformer pipeline for real-time inference without high VRAM overhead.
    """

    BULLISH_KEYWORDS = {
        "rate hike": 0.85, "hawkish": 0.90, "inflation cools": 0.65, "strong job growth": 0.80,
        "gdp beats": 0.75, "fomc raises": 0.85, "bullish": 0.70, "economic expansion": 0.75,
        "tight labor": 0.60, "higher yields": 0.65, "dollar surges": 0.80, "surplus": 0.60
    }

    BEARISH_KEYWORDS = {
        "rate cut": -0.85, "dovish": -0.90, "recession fears": -0.80, "inflation surges": -0.70,
        "jobless claims rise": -0.75, "gdp contracts": -0.85, "bearish": -0.70, "banking crisis": -0.95,
        "liquidity crunch": -0.80, "dollar tumbles": -0.80, "deficit widening": -0.60, "slowdown": -0.65
    }

    HIGH_IMPACT_TERMS = ["fomc", "federal reserve", "cpi", "non-farm payroll", "nfp", "jerome powell", "interest rate"]

    def analyze_headline(self, headline: str, source: str = "Bloomberg / Reuters") -> NewsItem:
        headline_lower = headline.lower()
        score = 0.0
        matches = 0

        for kw, weight in self.BULLISH_KEYWORDS.items():
            if kw in headline_lower:
                score += weight
                matches += 1

        for kw, weight in self.BEARISH_KEYWORDS.items():
            if kw in headline_lower:
                score += weight
                matches += 1

        if matches > 0:
            normalized_score = max(-1.0, min(1.0, score / matches))
        else:
            normalized_score = 0.05  # neutral baseline

        # Label determination
        if normalized_score >= 0.25:
            label = "BULLISH"
        elif normalized_score <= -0.25:
            label = "BEARISH"
        else:
            label = "NEUTRAL"

        # Impact level
        is_high = any(term in headline_lower for term in self.HIGH_IMPACT_TERMS)
        impact = "HIGH" if is_high else ("MEDIUM" if abs(normalized_score) > 0.4 else "LOW")

        # Currency affected
        currency = "USD"
        if "euro" in headline_lower or "ecb" in headline_lower:
            currency = "EUR"
        elif "pound" in headline_lower or "boe" in headline_lower:
            currency = "GBP"
        elif "yen" in headline_lower or "boj" in headline_lower:
            currency = "JPY"

        return NewsItem(
            id=f"news_{int(time.time() * 1000)}",
            headline=headline,
            source=source,
            timestamp=time.time(),
            sentiment_score=round(normalized_score, 2),
            sentiment_label=label,
            impact_level=impact,
            currency_affected=currency
        )

    def compute_aggregate_sentiment(self, news_items: List[NewsItem], currency: str = "USD") -> float:
        """Computes decay-weighted aggregate sentiment score for a given currency."""
        relevant = [item for item in news_items if item.currency_affected == currency]
        if not relevant:
            return 0.0
        
        weighted_sum = 0.0
        weights_total = 0.0
        current_time = time.time()

        for item in relevant:
            # Time decay factor: newer news has higher weight
            age_hours = (current_time - item.timestamp) / 3600.0
            time_weight = 1.0 / (1.0 + age_hours * 0.5)
            impact_multiplier = 1.5 if item.impact_level == "HIGH" else 1.0
            w = time_weight * impact_multiplier
            
            weighted_sum += item.sentiment_score * w
            weights_total += w

        return round(weighted_sum / weights_total, 2) if weights_total > 0 else 0.0
