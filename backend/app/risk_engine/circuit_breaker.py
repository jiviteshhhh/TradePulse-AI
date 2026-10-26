"""
TradePulse AI - Risk Governance & Circuit Breaker Engine
Prevents Catastrophic Drawdown via Hard Maximum Daily Loss Cap & Emergency Kill Switch
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import time
from typing import Dict, Any, List, Tuple
from ..compat import BaseModel


class RiskStatus(BaseModel):
    circuit_breaker_active: bool
    is_halted: bool
    halt_reason: str
    starting_daily_balance: float
    current_equity: float
    daily_realized_pnl: float
    daily_unrealized_pnl: float
    total_daily_loss: float
    max_daily_loss_limit: float
    loss_capacity_used_pct: float
    emergency_kill_switch_engaged: bool


class CircuitBreakerEngine:
    def __init__(self, starting_balance: float = 10000.0, max_daily_loss: float = 150.0):
        self.starting_daily_balance = starting_balance
        self.max_daily_loss_limit = max_daily_loss
        self.daily_realized_pnl = 0.0
        self.is_halted = False
        self.halt_reason = ""
        self.emergency_kill_switch_engaged = False
        self.halt_timestamp: float = 0.0

    def update_loss_limit(self, new_limit: float):
        self.max_daily_loss_limit = max(10.0, new_limit)

    def trigger_emergency_kill_switch(self, reason: str = "Manual User Trigger via Android App"):
        self.emergency_kill_switch_engaged = True
        self.is_halted = True
        self.halt_reason = f"EMERGENCY KILL SWITCH: {reason}"
        self.halt_timestamp = time.time()

    def reset_circuit_breaker(self):
        """Allows manual administrative reset from Android client with explicit confirmation."""
        self.is_halted = False
        self.emergency_kill_switch_engaged = False
        self.halt_reason = ""

    def evaluate_risk(self, current_equity: float, open_positions_pnl: float) -> RiskStatus:
        net_daily_pnl = self.daily_realized_pnl + open_positions_pnl
        current_loss = abs(net_daily_pnl) if net_daily_pnl < 0 else 0.0

        capacity_used = min(100.0, (current_loss / self.max_daily_loss_limit) * 100.0) if self.max_daily_loss_limit > 0 else 0.0

        # Automatic Circuit Breaker Check
        if current_loss >= self.max_daily_loss_limit and not self.is_halted:
            self.is_halted = True
            self.halt_reason = (
                f"MAX DAILY LOSS BREACHED: Daily loss (${round(current_loss, 2)}) "
                f"exceeded threshold (${round(self.max_daily_loss_limit, 2)}). Trading frozen."
            )
            self.halt_timestamp = time.time()

        return RiskStatus(
            circuit_breaker_active=self.is_halted,
            is_halted=self.is_halted,
            halt_reason=self.halt_reason,
            starting_daily_balance=round(self.starting_daily_balance, 2),
            current_equity=round(current_equity, 2),
            daily_realized_pnl=round(self.daily_realized_pnl, 2),
            daily_unrealized_pnl=round(open_positions_pnl, 2),
            total_daily_loss=round(current_loss, 2),
            max_daily_loss_limit=round(self.max_daily_loss_limit, 2),
            loss_capacity_used_pct=round(capacity_used, 1),
            emergency_kill_switch_engaged=self.emergency_kill_switch_engaged
        )

    def can_open_new_trade(self) -> Tuple[bool, str]:
        if self.is_halted:
            return False, f"Trading Halted: {self.halt_reason}"
        if self.emergency_kill_switch_engaged:
            return False, "Emergency Kill Switch is currently ENGAGED"
        return True, "Risk validation passed"
