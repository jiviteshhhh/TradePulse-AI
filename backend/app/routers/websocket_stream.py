"""
TradePulse AI - Full-Duplex Real-Time WebSocket Streaming Router
Streams Live Ticks, OrderBook, Positions, Confluence Signals & Risk Telemetry
Handles Bidirectional Commands from Terminal & Android Studio
Maintained by: Gatha Jain (@gathajain04-ui)
"""

import asyncio
import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter(tags=["WebSocket Stream"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)

        for dc in dead_connections:
            self.disconnect(dc)


manager = ConnectionManager()


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Handle bidirectional client messages
            raw_data = await websocket.receive_text()
            if raw_data == "PING":
                await websocket.send_text(json.dumps({"type": "PONG", "time": time.time()}))
                continue

            try:
                msg = json.loads(raw_data)
                action = msg.get("action")

                if action == "KILL_SWITCH":
                    from ..main import broker, circuit_breaker
                    mode = msg.get("mode", "FULL_FLATTEN")
                    circuit_breaker.trigger_emergency_kill_switch(f"WebSocket Client Trigger: {mode}")
                    broker.emergency_liquidate_all(reason=f"Emergency Kill Switch ({mode})")
                    await websocket.send_text(json.dumps({
                        "type": "ACTION_CONFIRMED",
                        "action": "KILL_SWITCH",
                        "status": "ENGAGED",
                        "message": "EMERGENCY LIQUIDATION COMPLETED. ALL POSITIONS FLATTENED."
                    }))

                elif action == "UPDATE_MAX_LOSS":
                    from ..main import circuit_breaker
                    new_limit = float(msg.get("max_daily_loss", 150.0))
                    circuit_breaker.update_loss_limit(new_limit)
                    await websocket.send_text(json.dumps({
                        "type": "ACTION_CONFIRMED",
                        "action": "UPDATE_MAX_LOSS",
                        "new_limit": new_limit
                    }))

            except Exception as e:
                print(f"[WS Command Error]: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
