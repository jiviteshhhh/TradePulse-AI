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

    # If MARKET order or LIMIT at market price, execute into broker positions immediately
    is_market = req.type.upper() == "MARKET" or abs(req.price - curr_price) < 0.0002

    status = "FILLED" if is_market else "OPEN"
    fill_price = curr_price if is_market else 0.0

    order_record = {
        "id": order_id,
        "clientOrderId": f"CLI-{int(time.time()*1000)}",
        "symbol": req.symbol,
        "side": req.side.lower(),
        "type": req.type.upper(),
        "size": req.size,
        "filledSize": req.size if is_market else 0.0,
        "price": req.price if req.price > 0 else curr_price,
        "avgFillPrice": fill_price,
        "status": status,
        "timestamp": timestamp_str,
        "venue": "OANDA / US-FOREX",
        "timeInForce": req.timeInForce,
        "slippageTolerancePercent": 0.05,
        "postOnly": req.postOnly,
        "reduceOnly": req.reduceOnly
    }
    blotter_orders.insert(0, order_record)

    # If executed, open in broker position tracker
    if is_market:
        direction = "BUY" if req.side.lower() == "buy" else "SELL"
        sl = req.stopLoss or (curr_price - 0.0020 if direction == "BUY" else curr_price + 0.0020)
        tp = req.takeProfit or (curr_price + 0.0040 if direction == "BUY" else curr_price - 0.0040)
        pos = broker.execute_order(
            pair=req.symbol,
            direction=direction,
            lot_size=req.size,
            current_price=curr_price,
            stop_loss=sl,
            take_profit=tp
        )
        order_record["positionId"] = pos.id

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
