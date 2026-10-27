package com.tradepulse.app.data.model

import com.google.gson.annotations.SerializedName

data class TelemetryPacket(
    @SerializedName("type") val type: String = "TELEMETRY_UPDATE",
    @SerializedName("timestamp") val timestamp: Double = 0.0,
    @SerializedName("pair") val pair: String = "EUR/USD",
    @SerializedName("current_price") val currentPrice: Double = 1.0850,
    @SerializedName("account_equity") val accountEquity: Double = 10000.0,
    @SerializedName("account_balance") val accountBalance: Double = 10000.0,
    @SerializedName("unrealized_pnl") val unrealizedPnl: Double = 0.0,
    @SerializedName("open_trades_count") val openTradesCount: Int = 0,
    @SerializedName("open_positions") val openPositions: List<PositionModel> = emptyList(),
    @SerializedName("circuit_breaker") val circuitBreaker: CircuitBreakerModel = CircuitBreakerModel(),
    @SerializedName("signal") val signal: ConfluenceSignalModel = ConfluenceSignalModel(),
    @SerializedName("sentiment_usd") val sentimentUsd: Double = 0.0
)

data class PositionModel(
    @SerializedName("id") val id: String = "",
    @SerializedName("pair") val pair: String = "EUR/USD",
    @SerializedName("direction") val direction: String = "BUY",
    @SerializedName("lot_size") val lotSize: Double = 0.1,
    @SerializedName("entry_price") val entryPrice: Double = 1.0850,
    @SerializedName("current_price") val currentPrice: Double = 1.0850,
    @SerializedName("stop_loss") val stopLoss: Double = 1.0830,
    @SerializedName("take_profit") val takeProfit: Double = 1.0890,
    @SerializedName("floating_pnl") val floatingPnl: Double = 0.0,
    @SerializedName("pips_gained") val pipsGained: Double = 0.0,
    @SerializedName("status") val status: String = "OPEN"
)

data class CircuitBreakerModel(
    @SerializedName("circuit_breaker_active") val circuitBreakerActive: Boolean = false,
    @SerializedName("is_halted") val isHalted: Boolean = false,
    @SerializedName("halt_reason") val haltReason: String = "",
    @SerializedName("starting_daily_balance") val startingDailyBalance: Double = 10000.0,
    @SerializedName("current_equity") val currentEquity: Double = 10000.0,
    @SerializedName("total_daily_loss") val totalDailyLoss: Double = 0.0,
    @SerializedName("max_daily_loss_limit") val maxDailyLossLimit: Double = 150.0,
    @SerializedName("loss_capacity_used_pct") val lossCapacityUsedPct: Double = 0.0,
    @SerializedName("emergency_kill_switch_engaged") val emergencyKillSwitchEngaged: Boolean = false
)

data class ConfluenceSignalModel(
    @SerializedName("pair") val pair: String = "EUR/USD",
    @SerializedName("direction") val direction: String = "HOLD",
    @SerializedName("confluence_score") val confluenceScore: Double = 0.0,
    @SerializedName("confidence_percentage") val confidencePercentage: Double = 0.0,
    @SerializedName("reasoning_tags") val reasoningTags: List<String> = emptyList(),
    @SerializedName("qualifies_for_execution") val qualifiesForExecution: Boolean = false
)

data class KillSwitchRequest(
    val confirmation: Boolean = true,
    val reason: String = "Manual Kill Switch from Android App"
)

data class MaxLossUpdateRequest(
    @SerializedName("max_daily_loss") val maxDailyLoss: Double
)
