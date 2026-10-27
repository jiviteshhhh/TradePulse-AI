"""
Unit Tests for Confluence Decision Matrix
Authored by: Gatha Jain (@gathajain04-ui)
"""

import unittest
from app.strategy.confluence_engine import ConfluenceEngine
from app.strategy.technicals import Candle
from app.nlp_sentiment.news_feed import NewsFeedManager


class TestConfluenceEngine(unittest.TestCase):
    def setUp(self):
        self.news_manager = NewsFeedManager()
        self.engine = ConfluenceEngine(self.news_manager, min_confluence=0.80)

    def test_insufficient_candles(self):
        candles = [Candle(timestamp=1000, open=1.0850, high=1.0860, low=1.0840, close=1.0855, volume=1000)]
        signal = self.engine.evaluate("EUR/USD", candles)
        self.assertEqual(signal.direction, "HOLD")
        self.assertFalse(signal.qualifies_for_execution)

    def test_confluence_gate_enforcement(self):
        # 40 candles in sideways range
        candles = [
            Candle(timestamp=1000 + i * 900, open=1.0850, high=1.0860, low=1.0840, close=1.0852, volume=2000)
            for i in range(40)
        ]
        signal = self.engine.evaluate("EUR/USD", candles)
        # Without aligned confluence, signal should not qualify for execution
        self.assertLess(signal.confluence_score, 0.80)
        self.assertFalse(signal.qualifies_for_execution)

    def test_bullish_confluence_setup(self):
        # 50 candles trending strongly upward with volume surge
        candles = []
        base = 1.0800
        for i in range(50):
            base += 0.0003
            vol = 8000 if i > 45 else 2000
            candles.append(Candle(timestamp=1000 + i * 900, open=base - 0.0001, high=base + 0.0002, low=base - 0.0002, close=base, volume=vol))

        signal = self.engine.evaluate("EUR/USD", candles)
        self.assertIn(signal.direction, ["BUY", "HOLD"])
        if signal.direction == "BUY":
            self.assertGreater(signal.recommended_take_profit, signal.current_price)
            self.assertLess(signal.recommended_stop_loss, signal.current_price)


if __name__ == "__main__":
    unittest.main()
