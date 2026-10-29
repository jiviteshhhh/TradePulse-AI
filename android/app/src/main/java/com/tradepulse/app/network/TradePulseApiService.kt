package com.tradepulse.app.network

import com.tradepulse.app.data.model.KillSwitchRequest
import com.tradepulse.app.data.model.MaxLossUpdateRequest
import com.tradepulse.app.data.model.PositionModel
import com.tradepulse.app.data.model.TelemetryPacket
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface TradePulseApiService {

    @GET("/api/v1/status")
    suspend fun getStatus(): Response<Map<String, Any>>

    @POST("/api/v1/risk/kill-switch")
    suspend fun triggerKillSwitch(@Body request: KillSwitchRequest): Response<Map<String, Any>>

    @POST("/api/v1/risk/max-loss")
    suspend fun updateMaxLoss(@Body request: MaxLossUpdateRequest): Response<Map<String, Any>>

    @POST("/api/v1/risk/reset")
    suspend fun resetCircuitBreaker(): Response<Map<String, Any>>

    @POST("/api/v1/orders/")
    suspend fun placeOrder(@Body request: com.tradepulse.app.data.model.PlaceOrderRequest): Response<Map<String, Any>>

    @GET("/api/v1/trades/active")
    suspend fun getActiveTrades(): Response<List<PositionModel>>

    @GET("/api/v1/trades/history")
    suspend fun getTradeHistory(): Response<List<PositionModel>>

    @POST("/api/v1/account/sync")
    suspend fun syncAccount(@Body request: com.tradepulse.app.data.model.AccountSyncRequest): Response<Map<String, Any>>
}
