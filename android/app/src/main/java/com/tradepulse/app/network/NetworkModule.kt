package com.tradepulse.app.network

import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    // 10.0.2.2 is the standard loopback IP for Android Studio Emulator pointing to host Mac
    // If using physical device over WiFi, replace with host Mac's local IP (e.g. 192.168.1.x)
    var BASE_HOST = "10.0.2.2:8000"

    fun getHttpUrl(): String = "http://$BASE_HOST"
    fun getWsUrl(): String = "ws://$BASE_HOST/ws/telemetry"

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()
    }

    val apiService: TradePulseApiService by lazy {
        Retrofit.Builder()
            .baseUrl(getHttpUrl())
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TradePulseApiService::class.java)
    }

    val webSocketListener = TradePulseWebSocketListener()
    private var activeWebSocket: WebSocket? = null

    fun connectWebSocket() {
        if (activeWebSocket != null) return
        val request = Request.Builder().url(getWsUrl()).build()
        activeWebSocket = okHttpClient.newWebSocket(request, webSocketListener)
    }

    fun disconnectWebSocket() {
        activeWebSocket?.close(1000, "App paused")
        activeWebSocket = null
    }
}
