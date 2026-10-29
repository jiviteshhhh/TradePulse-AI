package com.tradepulse.app.firebase

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.tradepulse.app.MainActivity

class TradePulseFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "TradePulseFCM"
        const val CHANNEL_CRITICAL = "tradepulse_critical_alerts"
        const val CHANNEL_TRADES = "tradepulse_trade_updates"
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM Registration Token: $token")
        // Broadcast token to backend if needed for targeted push notifications
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "From: ${remoteMessage.from}")

        // 1. Check data payload (e.g. event_type: "CIRCUIT_BREAKER", "KILL_SWITCH", "CONFLUENCE_SIGNAL")
        val data = remoteMessage.data
        val eventType = data["event_type"] ?: "GENERAL"
        val title = remoteMessage.notification?.title ?: data["title"] ?: "TradePulse AI Alert"
        val body = remoteMessage.notification?.body ?: data["message"] ?: "Market update received."

        sendNotification(title, body, eventType)
    }

    private fun sendNotification(title: String, messageBody: String, eventType: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("notification_event_type", eventType)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = if (eventType == "CIRCUIT_BREAKER" || eventType == "KILL_SWITCH") {
            CHANNEL_CRITICAL
        } else {
            CHANNEL_TRADES
        }

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.stat_notify_more)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Notification Channels for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val criticalChannel = NotificationChannel(
                CHANNEL_CRITICAL,
                "Critical Risk & Circuit Breaker Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High-priority alerts when maximum loss is reached or kill switch is triggered"
                enableVibration(true)
            }

            val tradeChannel = NotificationChannel(
                CHANNEL_TRADES,
                "Trade Execution & AI Signals",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for order fills, Take-Profit, and Confluence entry signals"
            }

            notificationManager.createNotificationChannel(criticalChannel)
            notificationManager.createNotificationChannel(tradeChannel)
        }

        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
