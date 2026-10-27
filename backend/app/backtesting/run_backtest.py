"""
Execution script for Quantitative Backtester
Authored by: Gatha Jain (@gathajain04-ui)
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.backtesting.backtester import QuantitativeBacktester


def main():
    print("=========================================================")
    print("TradePulse AI - Historical Confluence Backtesting Suite")
    print("Developed by: Gatha Jain (@gathajain04-ui)")
    print("=========================================================")

    backtester = QuantitativeBacktester(initial_capital=10000.0, min_confluence=0.80)
    print("\nGenerating 90 days of 15-minute EUR/USD tick & candle data...")
    candles = backtester.generate_synthetic_historical_data(days=90)
    print(f"Total Candlestick Bars Generated: {len(candles)}")

    print("\nSimulating Execution with >= 80% Confluence Gate & Dynamic Risk Sizing...")
    res = backtester.run_backtest(candles)
    metrics = res.to_dict()

    print("\n---------------- Backtest Results Summary ----------------")
    print(f" Initial Balance:      ${metrics['initial_balance']:,.2f}")
    print(f" Final Balance:        ${metrics['final_balance']:,.2f}")
    print(f" Net Profit:           ${metrics['net_profit']:,.2f} (+{metrics['return_pct']}%)")
    print(f" Total Executions:     {metrics['total_trades']}")
    print(f" Winning Trades:       {metrics['winning_trades']}")
    print(f" Losing Trades:        {metrics['losing_trades']}")
    print(f" Win Rate:             {metrics['win_rate_pct']}% (Target: >80%)")
    print(f" Profit Factor:        {metrics['profit_factor']}")
    print(f" Maximum Drawdown:     {metrics['max_drawdown_pct']}% (Protected by Circuit Breaker)")
    print(f" Estimated Sharpe:     {metrics['sharpe_ratio']}")
    print("----------------------------------------------------------\n")


if __name__ == "__main__":
    main()
