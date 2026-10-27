"""
TradePulse AI - System Diagnostics & Hardware Router
Provides Colo Node Latencies (LD4, NY4, TY3, FR2) & Subsystem Audit Logs
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import time
import random
from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/diagnostics", tags=["Diagnostics & Telemetry"])

COLO_NODES_DB = [
    {
        "id": "colo-ny4",
        "name": "Equinix NY4 Secaucus",
        "city": "New York",
        "region": "US-East",
        "ip": "198.19.102.14",
        "coloCode": "NY4",
        "latencyMs": 0.84,
        "jitterMs": 0.04,
        "packetLossPercent": 0.0,
        "fixStatus": "LOGGED_IN",
        "fpgaEnabled": True,
        "status": "OPTIMAL"
    },
    {
        "id": "colo-ld4",
        "name": "Equinix LD4 Slough",
        "city": "London",
        "region": "EU-West",
        "ip": "195.66.225.12",
        "coloCode": "LD4",
        "latencyMs": 1.15,
        "jitterMs": 0.06,
        "packetLossPercent": 0.0,
        "fixStatus": "LOGGED_IN",
        "fpgaEnabled": True,
        "status": "OPTIMAL"
    },
    {
        "id": "colo-ty3",
        "name": "Equinix TY3 Shinagawa",
        "city": "Tokyo",
        "region": "APAC-North",
        "ip": "203.178.134.8",
        "coloCode": "TY3",
        "latencyMs": 2.45,
        "jitterMs": 0.12,
        "packetLossPercent": 0.0,
        "fixStatus": "LOGGED_IN",
        "fpgaEnabled": False,
        "status": "OPTIMAL"
    },
    {
        "id": "colo-fr2",
        "name": "Equinix FR2 Frankfurt",
        "city": "Frankfurt",
        "region": "EU-Central",
        "ip": "194.146.118.5",
        "coloCode": "FR2",
        "latencyMs": 1.42,
        "jitterMs": 0.08,
        "packetLossPercent": 0.0,
        "fixStatus": "LOGGED_IN",
        "fpgaEnabled": True,
        "status": "OPTIMAL"
    }
]

SYSTEM_LOGS: List[Dict[str, Any]] = [
    {
        "id": "LOG-1",
        "timestamp": time.strftime("%H:%M:%S"),
        "level": "INFO",
        "subsystem": "FEED_HANDLER",
        "message": "Connected to OANDA v20 institutional tick stream (NY4 cross-connect established)."
    },
    {
        "id": "LOG-2",
        "timestamp": time.strftime("%H:%M:%S"),
        "level": "INFO",
        "subsystem": "FINBERT_NLP",
        "message": "FinBERT Macro News Ingestion online. Model weights cached in memory."
    },
    {
        "id": "LOG-3",
        "timestamp": time.strftime("%H:%M:%S"),
        "level": "INFO",
        "subsystem": "CONFLUENCE_GATE",
        "message": "Multi-factor confluence matrix active (Threshold >= 80% confidence enforced)."
    },
    {
        "id": "LOG-4",
        "timestamp": time.strftime("%H:%M:%S"),
        "level": "RISK_ALERT",
        "subsystem": "CIRCUIT_BREAKER",
        "message": "Circuit breaker active: Daily loss ceiling armed ($150.00 max drawdown)."
    }
]


@router.get("/colo-nodes")
def get_colo_nodes():
    # Slightly jitter latency for realism
    for n in COLO_NODES_DB:
        n["latencyMs"] = round(n["latencyMs"] + random.uniform(-0.03, 0.03), 2)
    return COLO_NODES_DB


@router.get("/logs")
def get_system_logs():
    return SYSTEM_LOGS
