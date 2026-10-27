"""
TradePulse AI - SQLite Audit Database Engine
Thread-safe persistence for trades, risk events, and blotter history
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import sqlite3
import os
import json
import time
from typing import List, Dict, Any, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../tradepulse_audit.db"))


class DatabaseManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Trades table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id TEXT PRIMARY KEY,
                    pair TEXT NOT NULL,
                    direction TEXT NOT NULL,
                    lot_size REAL NOT NULL,
                    entry_price REAL NOT NULL,
                    exit_price REAL,
                    stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL,
                    pnl REAL DEFAULT 0.0,
                    pips REAL DEFAULT 0.0,
                    status TEXT NOT NULL,
                    close_reason TEXT,
                    created_at REAL NOT NULL,
                    closed_at REAL
                )
            """)

            # Circuit Breaker Events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    loss_amount REAL NOT NULL,
                    max_limit REAL NOT NULL,
                    reason TEXT NOT NULL,
                    timestamp REAL NOT NULL
                )
            """)

            # System Audit Logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    subsystem TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()

    def insert_trade(self, trade_data: Dict[str, Any]):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO trades (
                    id, pair, direction, lot_size, entry_price, exit_price,
                    stop_loss, take_profit, pnl, pips, status, close_reason,
                    created_at, closed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                trade_data["id"], trade_data["pair"], trade_data["direction"],
                trade_data["lot_size"], trade_data["entry_price"], trade_data.get("exit_price"),
                trade_data["stop_loss"], trade_data["take_profit"], trade_data.get("floating_pnl", 0.0),
                trade_data.get("pips_gained", 0.0), trade_data["status"], trade_data.get("close_reason"),
                trade_data.get("open_time", time.time()), trade_data.get("close_time")
            ))
            conn.commit()

    def log_risk_event(self, event_type: str, loss_amount: float, max_limit: float, reason: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO risk_events (event_type, loss_amount, max_limit, reason, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (event_type, loss_amount, max_limit, reason, time.time()))
            conn.commit()

    def get_all_trades(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM trades ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]


db_manager = DatabaseManager()
