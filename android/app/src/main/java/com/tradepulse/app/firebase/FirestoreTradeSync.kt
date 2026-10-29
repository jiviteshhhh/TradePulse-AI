package com.tradepulse.app.firebase

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class FirestoreTradeSync {

    private val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

    suspend fun saveRiskPreferences(userId: String, maxDailyLoss: Double, riskPerTradePct: Double): Boolean {
        return try {
            val data = hashMapOf(
                "maxDailyLoss" to maxDailyLoss,
                "riskPerTradePct" to riskPerTradePct,
                "updatedAt" to System.currentTimeMillis()
            )
            firestore.collection("users")
                .document(userId)
                .collection("settings")
                .document("risk")
                .set(data)
                .await()
            true
        } catch (e: Exception) {
            Log.w("FirestoreSync", "Error saving risk settings: ${e.message}")
            false
        }
    }

    suspend fun logTradeAlertToCloud(userId: String, pair: String, direction: String, pnl: Double): Boolean {
        return try {
            val alert = hashMapOf(
                "pair" to pair,
                "direction" to direction,
                "pnl" to pnl,
                "timestamp" to System.currentTimeMillis()
            )
            firestore.collection("users")
                .document(userId)
                .collection("trade_alerts")
                .add(alert)
                .await()
            true
        } catch (e: Exception) {
            Log.w("FirestoreSync", "Error logging alert: ${e.message}")
            false
        }
    }
}
