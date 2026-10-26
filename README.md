# TradePulse AI - Autonomous Forex Trading System (Android / Kotlin)

[![Android](https://img.shields.io/badge/Platform-Android%20%7C%20Kotlin-brightgreen?logo=android)](https://developer.android.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/Course-Mobile%20App%20Development-blue)]()

---

## 👥 Project Team & Responsibilities
| Member | Role | Primary Focus Area | GitHub |
| :--- | :--- | :--- | :--- |
| **Jivitesh** | **Frontend Lead** | Android Native App (Kotlin, Jetpack Compose, Stitch UI, WebSockets) | [@jiviteshhhh](https://github.com/jiviteshhhh) |
| **Gatha Jain** | **Backend Lead** | AI Trading Engine, FinBERT NLP Sentiment, Circuit Breaker Risk Guard | [@gathajain04-ui](https://github.com/gathajain04-ui) |

---

## 💡 Overview
**TradePulse AI** is an intelligent automated forex trading suite designed for the US currency session (EUR/USD, GBP/USD, USD/JPY). It pairs a native Android application built in Kotlin with an algorithmic multi-factor backend engine.

### Key Pillars:
1. **Multi-Factor Confluence (+80% Precision Gate):** Executes trades strictly when technical indicators (EMA, RSI, VWAP, ATR) and NLP news sentiment align with $\ge 80\%$ confidence.
2. **Autonomous Circuit Breaker:** Protects capital by halting all trading and liquidating open positions if the user's configured **Maximum Daily Loss Ceiling** is reached.
3. **One-Tap Emergency Kill Switch:** Allows the user to remotely freeze trading and close all open positions instantly from their mobile device.
4. **Real-Time Telemetry:** Live WebSockets transmit real-time PnL, price ticks, and AI reasoning tags directly to the Android app.

---

## 📁 Repository Structure
```
tradepulse-ai/
├── backend/            # Gatha Jain's AI & Algorithmic Trading Microservice
│   ├── app/
│   │   ├── nlp_sentiment/   # Macroeconomic news scraper & FinBERT classifier
│   │   ├── strategy/        # EMA/RSI/ATR math & 80% Confluence Matrix
│   │   ├── risk_engine/     # Max Daily Loss Circuit Breaker & Position Sizing
│   │   ├── broker/          # High-fidelity paper execution gateway
│   │   └── routers/         # REST & WebSocket telemetry endpoints
│   ├── requirements.txt
│   └── README.md
├── android/            # Jivitesh's Jetpack Compose Mobile Application
│   └── README.md       # Android Studio setup, Compose screens & data models
└── README.md
```
