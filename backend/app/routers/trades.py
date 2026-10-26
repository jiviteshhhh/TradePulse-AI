"""
TradePulse AI - Trades & Execution Router
Endpoints for Android App to inspect active trades and past logs
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from ..broker.paper_account import TradePosition

router = APIRouter(prefix="/api/v1/trades", tags=["Trades"])


@router.get("/active", response_model=List[TradePosition])
def get_active_positions():
    from ..main import broker
    return list(broker.open_positions.values())


@router.get("/history", response_model=List[TradePosition])
def get_trade_history():
    from ..main import broker
    return list(reversed(broker.trade_history))


@router.get("/latest-signal")
def get_latest_signal():
    from ..main import latest_signal
    return latest_signal
