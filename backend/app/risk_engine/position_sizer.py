"""
TradePulse AI - Dynamic Position Sizing Calculator
Calculates optimal Forex lot size based on account equity and ATR stop-loss distance
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from typing import Tuple


class PositionSizer:
    STANDARD_LOT_UNITS = 100000  # 1 Standard Lot = 100,000 units
    PIP_VALUE_STANDARD = 10.0    # 1 pip on 1 standard lot of EUR/USD = $10

    @classmethod
    def calculate_lot_size(
        cls,
        account_balance: float,
        risk_pct: float,
        entry_price: float,
        stop_loss: float,
        pair: str = "EUR/USD"
    ) -> Tuple[float, float]:
        """
        Returns (lot_size, dollar_risk_amount)
        Formula: Lot Size = (Balance * Risk%) / (Stop Loss in Pips * Pip Value per Lot)
        """
        dollar_risk = account_balance * risk_pct
        price_diff = abs(entry_price - stop_loss)
        
        # In EUR/USD, 1 pip = 0.0001
        pips_at_risk = price_diff / 0.0001
        if pips_at_risk <= 0:
            return 0.01, dollar_risk  # minimum micro-lot

        # Pip value for 1 standard lot is approx $10 for USD quote pairs
        dollar_per_pip_needed = dollar_risk / pips_at_risk
        raw_lot = dollar_per_pip_needed / cls.PIP_VALUE_STANDARD

        # Clamp between 0.01 (micro-lot) and 2.0 (risk preservation cap)
        clamped_lot = max(0.01, min(2.0, round(raw_lot, 2)))
        return clamped_lot, round(dollar_risk, 2)
