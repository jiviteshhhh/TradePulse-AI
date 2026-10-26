# TradePulse AI - Backend Engine

**Developer:** Gatha Jain ([@gathajain04-ui](https://github.com/gathajain04-ui))  
**Collaborator:** Jivitesh ([@jiviteshhhh](https://github.com/jiviteshhhh))  
**Domain:** Quantitative Algorithmic Trading & Financial NLP  

---

## 🎯 Architecture & Features
1. **Financial NLP Sentiment Engine (`app/nlp_sentiment/`):**
   - Ingests real-time financial headlines (FOMC, CPI, NFP, interest rate decisions).
   - Generates decay-weighted currency sentiment from -1.0 (Bearish) to +1.0 (Bullish).
2. **Quantitative Technical Matrix (`app/strategy/`):**
   - Computes EMA (20/50/200), RSI (14), VWAP, and ATR.
   - Evaluates multi-factor confluence score ($0.0$ to $1.0$).
   - Enforces the **$\ge 80\%$ Confluence Gate** before signaling an entry.
3. **Risk Governance & Circuit Breaker (`app/risk_engine/`):**
   - Enforces a hard **Maximum Daily Loss Ceiling** (default $150.0).
   - Dynamic lot sizing based on 1.5% capital risk and ATR stop distance.
   - Emergency Kill Switch integration with instantaneous market liquidation.
4. **Broker & Paper Execution (`app/broker/`):**
   - High-fidelity broker simulation tracking ticks, spread, floating PnL, Stop-Loss, and Take-Profit.
5. **Real-Time WebSocket & REST API (`app/routers/`):**
   - Broadcasts live ticks and portfolio telemetry to Jivitesh's Android app over `ws://host:8000/ws/telemetry`.

---

## 🚀 Running the Backend
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Documentation: `http://localhost:8000/docs`
- Live Telemetry WebSocket: `ws://localhost:8000/ws/telemetry`
