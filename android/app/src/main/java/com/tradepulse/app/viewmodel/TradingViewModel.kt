package com.tradepulse.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tradepulse.app.data.model.*
import com.tradepulse.app.network.NetworkModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TradingUiState(
    val isConnected: Boolean = false,
    val activePair: String = "EUR/USD",
    val currentPrice: Double = 1.0850,
    val accountEquity: Double = 10000.0,
    val accountBalance: Double = 10000.0,
    val unrealizedPnl: Double = 0.0,
    val openPositions: List<PositionModel> = emptyList(),
    val circuitBreaker: CircuitBreakerModel = CircuitBreakerModel(),
    val signal: ConfluenceSignalModel = ConfluenceSignalModel(),
    val usdSentiment: Double = 0.0,
    val statusMessage: String? = null,
    val isKillSwitchArmed: Boolean = false
)

class TradingViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(TradingUiState())
    val uiState: StateFlow<TradingUiState> = _uiState.asStateFlow()

    init {
        startWebSocketListener()
    }

    private fun startWebSocketListener() {
        NetworkModule.connectWebSocket()

        viewModelScope.launch {
            NetworkModule.webSocketListener.connectionState.collect { connected ->
                _uiState.value = _uiState.value.copy(isConnected = connected)
            }
        }

        viewModelScope.launch {
            NetworkModule.webSocketListener.telemetryFlow.collect { packet ->
                _uiState.value = _uiState.value.copy(
                    activePair = packet.pair,
                    currentPrice = packet.currentPrice,
                    accountEquity = packet.accountEquity,
                    accountBalance = packet.accountBalance,
                    unrealizedPnl = packet.unrealizedPnl,
                    openPositions = packet.openPositions,
                    circuitBreaker = packet.circuitBreaker,
                    signal = packet.signal,
                    usdSentiment = packet.sentimentUsd,
                    isKillSwitchArmed = packet.circuitBreaker.emergencyKillSwitchEngaged || packet.circuitBreaker.isHalted
                )
            }
        }
    }

    fun triggerEmergencyKillSwitch(reason: String = "Triggered from Android Mobile Client") {
        viewModelScope.launch {
            try {
                val res = NetworkModule.apiService.triggerKillSwitch(KillSwitchRequest(confirmation = true, reason = reason))
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        statusMessage = "EMERGENCY KILL SWITCH ENGAGED! Positions liquidated.",
                        isKillSwitchArmed = true
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(statusMessage = "Error sending kill switch: ${e.message}")
            }
        }
    }

    fun updateMaxLossLimit(newLimit: Double) {
        viewModelScope.launch {
            try {
                NetworkModule.apiService.updateMaxLoss(MaxLossUpdateRequest(maxDailyLoss = newLimit))
                _uiState.value = _uiState.value.copy(statusMessage = "Max daily loss set to $$newLimit")
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(statusMessage = "Error updating loss: ${e.message}")
            }
        }
    }

    fun resetCircuitBreaker() {
        viewModelScope.launch {
            try {
                NetworkModule.apiService.resetCircuitBreaker()
                _uiState.value = _uiState.value.copy(statusMessage = "Circuit breaker reset. Bot resumed.")
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(statusMessage = "Error resetting: ${e.message}")
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        NetworkModule.disconnectWebSocket()
    }
}
