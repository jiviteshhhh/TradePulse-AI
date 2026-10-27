"""
Unit Tests for Circuit Breaker & Risk Governance
Authored by: Gatha Jain (@gathajain04-ui)
"""

import unittest
from app.risk_engine.circuit_breaker import CircuitBreakerEngine
from app.risk_engine.position_sizer import PositionSizer


class TestCircuitBreaker(unittest.TestCase):
    def setUp(self):
        self.cb = CircuitBreakerEngine(starting_balance=10000.0, max_daily_loss=150.0)

    def test_normal_operating_state(self):
        status = self.cb.evaluate_risk(current_equity=10000.0, open_positions_pnl=0.0)
        self.assertFalse(status.is_halted)
        self.assertEqual(status.loss_capacity_used_pct, 0.0)

        can_trade, reason = self.cb.can_open_new_trade()
        self.assertTrue(can_trade)

    def test_daily_drawdown_capacity_calculation(self):
        status = self.cb.evaluate_risk(current_equity=9925.0, open_positions_pnl=-75.0)
        self.assertFalse(status.is_halted)
        self.assertEqual(status.total_daily_loss, 75.0)
        self.assertEqual(status.loss_capacity_used_pct, 50.0)

    def test_automatic_circuit_breaker_trip(self):
        # Loss reaches $160 (exceeds $150 limit)
        status = self.cb.evaluate_risk(current_equity=9840.0, open_positions_pnl=-160.0)
        self.assertTrue(status.is_halted)
        self.assertTrue(status.circuit_breaker_active)
        self.assertIn("MAX DAILY LOSS BREACHED", status.halt_reason)

        can_trade, reason = self.cb.can_open_new_trade()
        self.assertFalse(can_trade)

    def test_emergency_kill_switch_engagement(self):
        self.cb.trigger_emergency_kill_switch("Manual test invocation")
        self.assertTrue(self.cb.emergency_kill_switch_engaged)
        self.assertTrue(self.cb.is_halted)

        can_trade, reason = self.cb.can_open_new_trade()
        self.assertFalse(can_trade)

    def test_circuit_breaker_reset(self):
        self.cb.trigger_emergency_kill_switch("Testing reset")
        self.assertTrue(self.cb.is_halted)
        self.cb.reset_circuit_breaker()
        self.assertFalse(self.cb.is_halted)
        self.assertFalse(self.cb.emergency_kill_switch_engaged)


class TestPositionSizer(unittest.TestCase):
    def test_lot_size_calculation(self):
        # $10,000 balance, 1.5% risk ($150), 20 pips SL
        lot, risk = PositionSizer.calculate_lot_size(
            account_balance=10000.0,
            risk_pct=0.015,
            entry_price=1.0850,
            stop_loss=1.0830,
            pair="EUR/USD"
        )
        self.assertEqual(risk, 150.0)
        self.assertEqual(lot, 0.75)


if __name__ == "__main__":
    unittest.main()
