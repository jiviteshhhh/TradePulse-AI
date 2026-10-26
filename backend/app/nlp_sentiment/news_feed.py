"""
TradePulse AI - Real-Time Macro News Feed Ingestion
Simulates institutional news stream (Bloomberg, Reuters, ForexFactory)
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import random
import time
from typing import List
from .sentiment_analyzer import SentimentAnalyzer, NewsItem


class NewsFeedManager:
    SAMPLE_HEADLINES = [
        ("Federal Reserve indicates interest rates will stay higher for longer as inflation cools moderately", "Bloomberg", "USD"),
        ("US Non-Farm Payrolls surge past expectations adding 254K jobs, dollar surges", "Reuters", "USD"),
        ("ECB holds interest rates steady amid slowing Eurozone industrial output", "Financial Times", "EUR"),
        ("US CPI prints at 2.4% year-over-year, bolstering expectations of dovish rate trajectory", "ForexLive", "USD"),
        ("Bank of England signals cautious easing stance amid persistent services inflation", "Reuters", "GBP"),
        ("Bank of Japan raises benchmark rate to 0.25%, Yen rallies against greenback", "Nikkei", "JPY"),
        ("Jerome Powell speech emphasizes data-dependency; market volatility increases", "Bloomberg", "USD"),
        ("US Initial Jobless Claims drop to 218K reflecting resilient labor conditions", "MarketWatch", "USD"),
        ("Eurozone PMI contracts further into recessionary territory", "CNBC", "EUR"),
        ("Crude oil stability eases US inflation expectations, strengthening risk appetite", "Wall Street Journal", "USD"),
    ]

    def __init__(self):
        self.analyzer = SentimentAnalyzer()
        self.feed_history: List[NewsItem] = []
        self._seed_initial_feed()

    def _seed_initial_feed(self):
        base_time = time.time() - 3600 * 4
        for headline, source, _ in self.SAMPLE_HEADLINES[:6]:
            item = self.analyzer.analyze_headline(headline, source)
            item.timestamp = base_time + random.randint(300, 3600)
            self.feed_history.append(item)

    def fetch_latest_news(self) -> List[NewsItem]:
        # Occasionally generate a new breaking headline
        if random.random() < 0.35:
            headline, source, _ = random.choice(self.SAMPLE_HEADLINES)
            new_item = self.analyzer.analyze_headline(headline, source)
            self.feed_history.insert(0, new_item)
            if len(self.feed_history) > 30:
                self.feed_history.pop()

        return sorted(self.feed_history, key=lambda x: x.timestamp, reverse=True)

    def get_currency_sentiment(self, currency: str = "USD") -> float:
        return self.analyzer.compute_aggregate_sentiment(self.feed_history, currency)
