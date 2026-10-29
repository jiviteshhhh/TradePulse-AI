"""
TradePulse AI - Telemetry & Risk Control Router
REST Endpoints for Android Client Configuration
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter(prefix="/api/v1", tags=["Telemetry & Risk"])


class MaxLossUpdateRequest(BaseModel):
    max_daily_loss: float


class KillSwitchRequest(BaseModel):
    confirmation: bool
    reason: str = "Triggered by User from Android Dashboard"


class AccountSyncRequest(BaseModel):
    email: str
    is_demo: bool = False
    custom_balance: float = 0.0


@router.post("/account/sync")
def sync_account_balance(req: AccountSyncRequest):
    from ..main import broker, circuit_breaker
    if req.is_demo:
        broker.balance = 10000.0
        circuit_breaker.starting_daily_balance = 10000.0
    else:
        # Real trader accounts default to $50,000.00 funded balance or custom balance
        target_balance = req.custom_balance if req.custom_balance > 0 else 50000.0
        broker.balance = target_balance
        circuit_breaker.starting_daily_balance = target_balance

    # Clear old circuit breaker halt if switching accounts
    circuit_breaker.reset_circuit_breaker()

    return {
        "status": "SUCCESS",
        "email": req.email,
        "is_demo": req.is_demo,
        "account_balance": broker.balance,
        "equity": broker.get_equity()
    }


@router.get("/status")
def get_system_status() -> Dict[str, Any]:
    from ..main import broker, circuit_breaker, confluence_engine, news_manager, current_prices, active_pair

    open_pnl = sum(p.floating_pnl for p in broker.open_positions.values())
    risk = circuit_breaker.evaluate_risk(broker.get_equity(), open_pnl)
    stats = broker.get_performance_stats()

    return {
        "status": "HALTED" if risk.is_halted else "RUNNING",
        "active_pair": active_pair,
        "current_price": current_prices.get(active_pair, 1.0850),
        "account_balance": broker.balance,
        "equity": broker.get_equity(),
        "unrealized_pnl": open_pnl,
        "open_trades_count": len(broker.open_positions),
        "circuit_breaker": risk.dict(),
        "performance": stats,
        "macro_sentiment_usd": news_manager.get_currency_sentiment("USD")
    }


@router.post("/risk/max-loss")
def update_max_daily_loss(req: MaxLossUpdateRequest):
    from ..main import circuit_breaker
    circuit_breaker.update_loss_limit(req.max_daily_loss)
    return {
        "message": f"Maximum daily loss cap updated to ${req.max_daily_loss}",
        "new_limit": req.max_daily_loss
    }


@router.post("/risk/kill-switch")
def emergency_kill_switch(req: KillSwitchRequest):
    from ..main import broker, circuit_breaker
    if not req.confirmation:
        raise HTTPException(status_code=400, detail="Confirmation must be True to engage Kill Switch")

    circuit_breaker.trigger_emergency_kill_switch(req.reason)
    broker.emergency_liquidate_all(reason=f"Emergency Kill Switch: {req.reason}")

    return {
        "status": "ENGAGED",
        "message": "EMERGENCY KILL SWITCH ACTIVATED. All positions liquidated. Trading halted.",
        "liquidated_at_equity": broker.get_equity()
    }


@router.post("/risk/reset")
def reset_circuit_breaker():
    from ..main import circuit_breaker
    circuit_breaker.reset_circuit_breaker()
    return {"message": "Circuit breaker reset. Normal AI evaluation resumed."}


@router.get("/news")
def get_live_news():
    from ..main import news_manager
    return news_manager.fetch_latest_news()
