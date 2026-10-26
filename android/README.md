# TradePulse AI - Android Client (Kotlin / Jetpack Compose)

**Lead Engineer:** Jivitesh ([@jiviteshhhh](https://github.com/jiviteshhhh))  
**Collaborator:** Gatha Jain ([@gathajain04-ui](https://github.com/gathajain04-ui))  
**Platform:** Android Studio (Kotlin, Jetpack Compose, Material Design 3)  

---

## 📱 Screens Generated with Stitch & Jetpack Compose
1. **Executive Trading Dashboard (`ui/screens/DashboardScreen.kt`):**
   - Live portfolio equity card, daily PnL indicator, and win rate badge.
   - Interactive candlestick chart and real-time EUR/USD tick visualizer.
   - Active AI Confluence Signal card with dynamic reasoning tags.
   - Emergency Kill Switch banner button.
2. **Risk Governance Settings (`ui/screens/RiskSettingsScreen.kt`):**
   - Slider for **Maximum Daily Loss Ceiling** ($50 to $500).
   - Drawdown capacity gauge (% of daily loss threshold reached).
   - Fixed % risk per trade and trailing stop toggle.
3. **AI News Sentiment Radar (`ui/screens/SentimentRadarScreen.kt`):**
   - Macro USD Sentiment dial (-1.0 to +1.0).
   - Real-time parsed financial news cards (Fed rate decisions, CPI prints, NFP jobs).
4. **Live Trades & Historical Audit (`ui/screens/TradeHistoryScreen.kt`):**
   - Real-time floating PnL on open positions.
   - Detailed trade logs with exit reasons and pip counters.

---

## 🔌 API & WebSocket Integration
Connects to Gatha's backend service:
- REST API Base URL: `http://10.0.2.2:8000/api/v1` (for Android Emulator)
- Live WebSocket Stream: `ws://10.0.2.2:8000/ws/telemetry`
