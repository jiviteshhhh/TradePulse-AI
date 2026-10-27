package com.tradepulse.app.network

import android.util.Log
import com.google.gson.Gson
import com.tradepulse.app.data.model.TelemetryPacket
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import okhttp3.*

class TradePulseWebSocketListener(
    private val gson: Gson = Gson()
) : WebSocketListener() {

    private val _telemetryFlow = MutableSharedFlow<TelemetryPacket>(extraBufferCapacity = 64)
    val telemetryFlow: SharedFlow<TelemetryPacket> = _telemetryFlow.asSharedFlow()

    private val _connectionState = MutableSharedFlow<Boolean>(replay = 1)
    val connectionState: SharedFlow<Boolean> = _connectionState.asSharedFlow()

    override fun onOpen(webSocket: WebSocket, response: Response) {
        Log.d("TradePulseWS", "WebSocket Connected to Python Backend")
        _connectionState.tryEmit(true)
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
        try {
            val packet = gson.fromJson(text, TelemetryPacket::class.java)
            if (packet != null && packet.type == "TELEMETRY_UPDATE") {
                _telemetryFlow.tryEmit(packet)
            }
        } catch (e: Exception) {
            Log.w("TradePulseWS", "Error parsing telemetry packet: ${e.message}")
        }
    }

    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
        Log.w("TradePulseWS", "WebSocket Closed: $reason")
        _connectionState.tryEmit(false)
    }

    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        Log.e("TradePulseWS", "WebSocket Failure: ${t.message}")
        _connectionState.tryEmit(false)
    }
}
