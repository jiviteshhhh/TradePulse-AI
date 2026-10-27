"""
TradePulse AI - Algorithmic Strategies Router
Manages Quantitative Bots, Confluence Parameters & Execution Engines
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from ..compat import BaseModel

router = APIRouter(prefix="/api/v1/strategies", tags=["Strategies Desk"])


class StrategyParamUpdate(BaseModel):
    key: str
    value: Any


class NewStrategyDeploy(BaseModel):
    name: str
    category: str
    allocatedUsd: float
    parameters: Optional[List[Dict[str, Any]]] = None


STRATEGIES_DB: List[Dict[str, Any]] = [
    {
        "id": "strat-finbert-forex",
        "name": "FinBERT Macro Confluence Bot",
        "code": "FINBERT-CONF-80",
        "category": "Momentum",
        "status": "ACTIVE",
        "uptime": 99.8,
        "allocatedUsd": 50000,
        "dailyPnl": 312.40,
        "dailyPnlPercent": 3.14,
        "totalPnl": 18450.0,
        "apy": 52.4,
        "sharpeRatio": 2.74,
        "maxDrawdown": 3.8,
        "winRate": 84.2,
        "ordersPerSec": 0.5,
        "totalExecutions": 248,
        "alphaScore": 9.6,
        "betaToBtc": 0.02,
        "inventoryDelta": 0.15,
        "latencyAvgMs": 1.12,
        "lastAction": "Confluence Gate Passed: BUY EUR/USD @ 1.0850 (Score: 88%)",
        "parameters": [
            {
                "key": "min_confluence_score",
                "label": "Minimum Confluence Gate",
                "value": 0.80,
                "type": "number",
                "min": 0.70,
                "max": 0.95,
                "step": 0.05,
                "description": "Threshold confidence required before entering position (default >= 80%)"
            },
            {
                "key": "risk_per_trade_pct",
                "label": "Risk Per Trade (%)",
                "value": 1.5,
                "type": "number",
                "min": 0.5,
                "max": 3.0,
                "step": 0.5,
                "description": "Percentage of capital risked per individual trade"
            },
            {
                "key": "max_daily_loss",
                "label": "Circuit Breaker Daily Loss ($)",
                "value": 150.0,
                "type": "number",
                "min": 50.0,
                "max": 500.0,
                "step": 25.0,
                "description": "Hard cutoff threshold to freeze trading upon breach"
            },
            {
                "key": "trailing_stop_enabled",
                "label": "Dynamic ATR Trailing Stop",
                "value": True,
                "type": "boolean",
                "description": "Automatically moves stop loss to breakeven after 1x ATR gain"
            }
        ]
    },
    {
        "id": "strat-us-stat-arb",
        "name": "US Forex Statistical Arbitrage",
        "code": "STAT-ARB-USD",
        "category": "Arbitrage",
        "status": "ACTIVE",
        "uptime": 99.9,
        "allocatedUsd": 35000,
        "dailyPnl": 142.10,
        "dailyPnlPercent": 1.25,
        "totalPnl": 11200.0,
        "apy": 38.2,
        "sharpeRatio": 3.12,
        "maxDrawdown": 2.1,
        "winRate": 88.5,
        "ordersPerSec": 1.2,
        "totalExecutions": 612,
        "alphaScore": 8.9,
        "betaToBtc": 0.01,
        "inventoryDelta": -0.05,
        "latencyAvgMs": 0.98,
        "lastAction": "Co-integration Spread Rebalanced: EUR/USD vs GBP/USD",
        "parameters": [
            {
                "key": "zscore_entry",
                "label": "Z-Score Divergence Threshold",
                "value": 2.2,
                "type": "number",
                "min": 1.5,
                "max": 3.0,
                "step": 0.1,
                "description": "Standard deviations required to trigger pair mean-reversion"
            }
        ]
    },
    {
        "id": "strat-vwap-liquidity",
        "name": "Institutional VWAP Liquidity Sweep",
        "code": "VWAP-SWEEP",
        "category": "Liquidity Sweep",
        "status": "PAUSED",
        "uptime": 98.4,
        "allocatedUsd": 25000,
        "dailyPnl": 85.00,
        "dailyPnlPercent": 0.92,
        "totalPnl": 7650.0,
        "apy": 29.5,
        "sharpeRatio": 2.18,
        "maxDrawdown": 4.5,
        "winRate": 79.4,
        "ordersPerSec": 0.3,
        "totalExecutions": 94,
        "alphaScore": 7.8,
        "betaToBtc": 0.04,
        "inventoryDelta": 0.0,
        "latencyAvgMs": 1.45,
        "lastAction": "Paused pending London-NY Session Overlap",
        "parameters": [
            {
                "key": "liquidity_band_pct",
                "label": "Band Distance (%)",
                "value": 0.15,
                "type": "number",
                "min": 0.05,
                "max": 0.5,
                "step": 0.05,
                "description": "Offset from VWAP line for order slicing"
            }
        ]
    }
]


@router.get("/")
def get_strategies():
    return STRATEGIES_DB


@router.post("/{strategy_id}/toggle")
def toggle_strategy(strategy_id: str):
    for s in STRATEGIES_DB:
        if s["id"] == strategy_id:
            s["status"] = "PAUSED" if s["status"] == "ACTIVE" else "ACTIVE"
            s["lastAction"] = f"Manual status change: {s['status']}"
            return {"message": f"Strategy {strategy_id} is now {s['status']}", "strategy": s}
    raise HTTPException(status_code=404, detail="Strategy not found")


@router.post("/{strategy_id}/params")
def update_strategy_param(strategy_id: str, req: StrategyParamUpdate):
    for s in STRATEGIES_DB:
        if s["id"] == strategy_id:
            for p in s.get("parameters", []):
                if p["key"] == req.key:
                    p["value"] = req.value
                    s["lastAction"] = f"Parameter updated: {req.key} = {req.value}"
                    # If updating confluence score on main bot, update backend engine too
                    if strategy_id == "strat-finbert-forex" and req.key == "min_confluence_score":
                        from ..main import confluence_engine
                        confluence_engine.min_confluence = float(req.value)
                    elif strategy_id == "strat-finbert-forex" and req.key == "max_daily_loss":
                        from ..main import circuit_breaker
                        circuit_breaker.update_loss_limit(float(req.value))

                    return {"message": f"Updated {req.key} to {req.value}", "strategy": s}
    raise HTTPException(status_code=404, detail="Strategy or Parameter key not found")


@router.post("/")
def deploy_strategy(req: NewStrategyDeploy):
    new_strat = {
        "id": f"strat-{len(STRATEGIES_DB) + 1}",
        "name": req.name,
        "code": f"CUSTOM-{len(STRATEGIES_DB) + 1}",
        "category": req.category,
        "status": "ACTIVE",
        "uptime": 100.0,
        "allocatedUsd": req.allocatedUsd,
        "dailyPnl": 0.0,
        "dailyPnlPercent": 0.0,
        "totalPnl": 0.0,
        "apy": 35.0,
        "sharpeRatio": 2.2,
        "maxDrawdown": 2.5,
        "winRate": 80.0,
        "ordersPerSec": 0.2,
        "totalExecutions": 0,
        "alphaScore": 8.0,
        "betaToBtc": 0.02,
        "inventoryDelta": 0.0,
        "latencyAvgMs": 1.2,
        "lastAction": "Newly deployed to institutional execution cluster",
        "parameters": req.parameters or []
    }
    STRATEGIES_DB.append(new_strat)
    return {"message": "New strategy deployed", "strategy": new_strat}
