"""
TradePulse AI - Configuration & Risk Governance Settings
Maintained by: Gatha Jain (@gathajain04-ui)
"""

from .compat import BaseModel
from typing import List


class TradingConfig(BaseModel):
    # Supported Major Forex Pairs in US Session
    supported_pairs: List[str] = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"]
    active_pair: str = "EUR/USD"

    # Confluence Engine Thresholds
    min_confluence_score: float = 0.80  # Requires >= 80% confidence before executing
    risk_reward_ratio: float = 2.0      # Minimum 1:2 Risk to Reward

    # Risk Management & Circuit Breaker Thresholds
    starting_balance: float = 10000.0   # Default Paper Trading Capital
    risk_percentage_per_trade: float = 0.015  # 1.5% maximum risk per trade
    max_daily_loss_limit: float = 150.0  # Hard daily stop: halts all trading if loss reaches this
    max_open_positions: int = 3
    trailing_stop_enabled: bool = True

    # Server & Networking
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = ["*"]


settings = TradingConfig()
