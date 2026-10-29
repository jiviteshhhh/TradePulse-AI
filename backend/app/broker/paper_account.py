"""
TradePulse AI - Broker & Paper Trading Execution Gateway
Simulates real-world execution (OANDA v20 / Alpaca API specifications)
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import time
import uuid
from typing import List, Dict, Optional
from ..compat import BaseModel


class TradePosition(BaseModel):
    id: str
    pair: str
    direction: str  # BUY or SELL
    lot_size: float
    entry_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    floating_pnl: float
    pips_gained: float
    open_time: float
    close_time: Optional[float] = None
    status: str  # OPEN or CLOSED
    close_reason: Optional[str] = None


class PaperBrokerGateway:
    def __init__(self, initial_balance: float = 10000.0):
        self.balance = initial_balance
        self.open_positions: Dict[str, TradePosition] = {}
        self.trade_history: List[TradePosition] = []

    def get_equity(self) -> float:
        unrealized = sum(pos.floating_pnl for pos in self.open_positions.values())
        return round(self.balance + unrealized, 2)

    def execute_order(
        self,
        pair: str,
        direction: str,
        lot_size: float,
        current_price: float,
        stop_loss: float,
        take_profit: float
    ) -> TradePosition:
        trade_id = f"TRD_{uuid.uuid4().hex[:8].upper()}"
        pos = TradePosition(
            id=trade_id,
            pair=pair,
            direction=direction,
            lot_size=lot_size,
            entry_price=current_price,
            current_price=current_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            floating_pnl=0.0,
            pips_gained=0.0,
            open_time=time.time(),
            status="OPEN"
        )
        self.open_positions[trade_id] = pos
        return pos

    def update_ticks(self, current_prices: Dict[str, float]) -> List[TradePosition]:
        """Updates open positions with current bid/ask and checks SL/TP triggers."""
        closed_trades = []

        for trade_id, pos in list(self.open_positions.items()):
            curr = current_prices.get(pos.pair, pos.current_price)
            pos.current_price = curr

            # Calculate PnL: Crypto, JPY pairs, and Standard Forex
            if "BTC" in pos.pair or "ETH" in pos.pair or "SOL" in pos.pair or "PERP" in pos.pair:
                price_delta = (curr - pos.entry_price) if pos.direction == "BUY" else (pos.entry_price - curr)
                dollar_pnl = price_delta * pos.lot_size
                pip_diff = (price_delta / (pos.entry_price or 1.0)) * 100.0
            elif "JPY" in pos.pair:
                pip_diff = (curr - pos.entry_price) / 0.01 if pos.direction == "BUY" else (pos.entry_price - curr) / 0.01
                dollar_pnl = pip_diff * (pos.lot_size * 9.5)
            else:
                # Standard Forex: 1 pip = 0.0001, standard lot (100k) EUR/USD 1 pip = $10
                pip_diff = (curr - pos.entry_price) / 0.0001 if pos.direction == "BUY" else (pos.entry_price - curr) / 0.0001
                dollar_pnl = pip_diff * (pos.lot_size * 10.0)

            pos.floating_pnl = round(dollar_pnl, 2)
            pos.pips_gained = round(pip_diff, 1)

            # Check Stop-Loss
            if (pos.direction == "BUY" and curr <= pos.stop_loss) or (pos.direction == "SELL" and curr >= pos.stop_loss):
                self._close_trade(pos, "STOP_LOSS_HIT", curr)
                closed_trades.append(pos)
            # Check Take-Profit
            elif (pos.direction == "BUY" and curr >= pos.take_profit) or (pos.direction == "SELL" and curr <= pos.take_profit):
                self._close_trade(pos, "TAKE_PROFIT_HIT", curr)
                closed_trades.append(pos)

        return closed_trades

    def emergency_liquidate_all(self, reason: str = "Circuit Breaker / Emergency Kill Switch"):
        """Instantly closes all open positions at market price."""
        for trade_id, pos in list(self.open_positions.items()):
            self._close_trade(pos, reason, pos.current_price)

    def _close_trade(self, pos: TradePosition, reason: str, exit_price: float):
        pos.status = "CLOSED"
        pos.close_time = time.time()
        pos.close_reason = reason
        self.balance += pos.floating_pnl
        self.trade_history.append(pos)
        del self.open_positions[pos.id]

    def get_performance_stats(self) -> Dict:
        total_trades = len(self.trade_history)
        if total_trades == 0:
            return {
                "total_trades": 0, "win_rate": 0.0, "total_pnl": 0.0,
                "profit_factor": 0.0, "confluence_efficiency": 85.0
            }
        wins = [t for t in self.trade_history if t.floating_pnl > 0]
        losses = [t for t in self.trade_history if t.floating_pnl <= 0]
        win_rate = (len(wins) / total_trades) * 100.0

        gross_profit = sum(t.floating_pnl for t in wins)
        gross_loss = abs(sum(t.floating_pnl for t in losses))
        profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else round(gross_profit, 2)

        return {
            "total_trades": total_trades,
            "win_rate": round(win_rate, 1),
            "total_pnl": round(sum(t.floating_pnl for t in self.trade_history), 2),
            "profit_factor": profit_factor,
            "confluence_efficiency": round(max(80.0, win_rate), 1)
        }
