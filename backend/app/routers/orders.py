"""
TradePulse AI - Orders & Execution Blotter Router
Handles Order Placement, Cancellations, Position Management & Bracket Orders
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import time
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from ..compat import BaseModel

router = APIRouter(prefix="/api/v1/orders", tags=["Orders & Blotter"])


class PlaceOrderRequest(BaseModel):
    symbol: str
    side: str  # "buy" or "sell"
    type: str  # "LIMIT", "MARKET", "TWAP", "VWAP", "ICEBERG", "SNIPER"
    size: float
    price: float
    leverage: int = 50
    timeInForce: str = "GTC"
    postOnly: bool = False
    reduceOnly: bool = False
    stopLoss: Optional[float] = None
    takeProfit: Optional[float] = None


class PositionTpSlUpdate(BaseModel):
    takeProfit: Optional[float] = None
    stopLoss: Optional[float] = None


# Blotter Orders Store
blotter_orders: List[Dict[str, Any]] = []


@router.get("/")
def get_orders() -> List[Dict[str, Any]]:
    return blotter_orders


@router.post("/")
def place_order(req: PlaceOrderRequest) -> Dict[str, Any]:
    from ..main import broker, circuit_breaker, current_prices

    # 1. Risk Check
    can_trade, reason = circuit_breaker.can_open_new_trade()
    if not can_trade:
        raise HTTPException(status_code=403, detail=f"Risk Rejection: {reason}")

    curr_price = current_prices.get(req.symbol, req.price if req.price > 0 else 1.0850)
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    timestamp_str = time.strftime("%H:%M:%S")

    # In paper execution desk, fill orders immediately at current market price or specified limit
    fill_price = curr_price if (req.price <= 0 or req.type.upper() == "MARKET" or abs(req.price - curr_price) > 0.05) else req.price
    status = "FILLED"
    direction = "BUY" if req.side.lower() == "buy" else "SELL"

    # Asset-specific Stop Loss & Take Profit defaults
    if "BTC" in req.symbol or "ETH" in req.symbol or "SOL" in req.symbol or "PERP" in req.symbol:
        sl_delta = fill_price * 0.015  # 1.5% SL
        tp_delta = fill_price * 0.030  # 3.0% TP
        round_decimals = 2
    elif "JPY" in req.symbol:
        sl_delta = 0.25  # 25 pips
        tp_delta = 0.50  # 50 pips
        round_decimals = 3
    else:
        sl_delta = 0.0020  # 20 pips
        tp_delta = 0.0040  # 40 pips
        round_decimals = 5

    sl = req.stopLoss or (fill_price - sl_delta if direction == "BUY" else fill_price + sl_delta)
    tp = req.takeProfit or (fill_price + tp_delta if direction == "BUY" else fill_price - tp_delta)

    pos = broker.execute_order(
        pair=req.symbol,
        direction=direction,
        lot_size=req.size,
        current_price=fill_price,
        stop_loss=round(sl, round_decimals),
        take_profit=round(tp, round_decimals)
    )

    order_record = {
        "id": order_id,
        "clientOrderId": f"CLI-{int(time.time()*1000)}",
        "symbol": req.symbol,
        "side": req.side.lower(),
        "type": req.type.upper(),
        "size": req.size,
        "filledSize": req.size,
        "price": fill_price,
        "avgFillPrice": fill_price,
        "status": status,
        "timestamp": timestamp_str,
        "venue": "OANDA / US-FOREX",
        "timeInForce": req.timeInForce,
        "slippageTolerancePercent": 0.05,
        "postOnly": req.postOnly,
        "reduceOnly": req.reduceOnly,
        "positionId": pos.id
    }
    blotter_orders.insert(0, order_record)

    return {
        "message": f"Order {order_id} {status}",
        "order": order_record
    }


@router.delete("/{order_id}")
def cancel_order(order_id: str):
    for o in blotter_orders:
        if o["id"] == order_id:
            if o["status"] == "OPEN":
                o["status"] = "CANCELED"
                return {"message": f"Order {order_id} canceled successfully", "order": o}
            else:
                raise HTTPException(status_code=400, detail=f"Order is already {o['status']}")
    raise HTTPException(status_code=404, detail="Order not found")


@router.post("/positions/{position_id}/close")
def close_position(position_id: str):
    from ..main import broker
    if position_id in broker.open_positions:
        pos = broker.open_positions[position_id]
        broker._close_trade(pos, "User Manual Close via Terminal Blotter", pos.current_price)
        return {"message": f"Position {position_id} closed at market price", "position": pos.dict()}
    raise HTTPException(status_code=404, detail="Position not found")


@router.post("/positions/{position_id}/tpsl")
def update_position_tpsl(position_id: str, req: PositionTpSlUpdate):
    from ..main import broker
    if position_id in broker.open_positions:
        pos = broker.open_positions[position_id]
        if req.takeProfit is not None:
            pos.take_profit = req.takeProfit
        if req.stopLoss is not None:
            pos.stop_loss = req.stopLoss
        return {"message": f"Position {position_id} TP/SL updated", "position": pos.dict()}
    raise HTTPException(status_code=404, detail="Position not found")
