# TradePulse AI - Android Client (Kotlin / Jetpack Compose)

[![Android](https://img.shields.io/badge/Platform-Android%20%7C%20Kotlin-brightgreen?logo=android)](https://developer.android.com/)
[![Compose](https://img.shields.io/badge/UI-Jetpack%20Compose%20%7C%20Material%203-4285F4?logo=jetpackcompose)](https://developer.android.com/jetpack/compose)
[![Firebase](https://img.shields.io/badge/Cloud-Firebase%20Auth%20%7C%20FCM-FFCA28?logo=firebase)](https://firebase.google.com/)

**Lead Mobile Engineer:** Jivitesh ([@jiviteshhhh](https://github.com/jiviteshhhh))  
**Backend & Quantitative Lead:** Gatha Jain ([@gathajain04-ui](https://github.com/gathajain04-ui))  
**Course:** Mobile App Development (Kotlin / Android Studio)  

---

## 🚀 How to Run in Android Studio (3 Simple Steps)

### 1. Open in Android Studio
1. Launch **Android Studio** (Hedgehog, Iguana, Jellyfish, Koala, or Ladybug).
2. Click **Open** and select the folder:
   ```
   /Users/dr.rohitdutt/Desktop/TradePulse-AI/android
   ```
3. Android Studio will automatically recognize the Gradle wrapper and sync all dependencies.

### 2. Run the App
1. Select an Android Emulator (e.g. **Pixel 7 / 8 / 9** with API 31–34) or a connected USB device.
2. Click the green **Run (▶)** button (or press `Shift + F10`).
3. The app will build, launch, and display the **Institutional Login** screen.

### 3. Quick Evaluation / Demo Access
* On the login screen, click **⚡ Quick Demo Access (Bypass Login)** to instantly enter the trading dashboard without configuring test credentials!
* Tap across the bottom navigation: **Dashboard**, **Terminal**, **Risk**, and **Trades**.

---

## 📱 Architecture & Key Features

### 1. Core Screens
* **`DashboardScreen.kt`:** Real-time EUR/USD tick visualizer, live portfolio equity, floating PnL, AI Confluence Matrix ($\ge 80\%$ confidence gate), and the bold Red **Emergency Kill Switch**.
* **`TerminalWebViewScreen.kt`:** Embeds the full-featured Institutional Algorithmic Terminal with an offline standby card and bidirectional `@JavascriptInterface AndroidBridge`.
* **`RiskGovernanceScreen.kt`:** Interactive slider to set the **Maximum Daily Loss Ceiling** (\$50 to \$500) and monitor circuit breaker capacity.
* **`TradesScreen.kt`:** Real-time blotter of open positions, entry prices, floating PnL, and Stop-Loss/Take-Profit levels.
* **`AuthScreen.kt`:** Firebase authentication with email/password sign-in and quick demo access.

### 2. Networking & Cloud Services
* **Retrofit 2 & OkHttp 3:** REST communication targeting `http://10.0.2.2:8000/api/v1`.
* **OkHttp WebSocket Listener:** Real-time telemetry stream from `ws://10.0.2.2:8000/ws/telemetry` emitted into Kotlin `SharedFlow` and `StateFlow`.
* **Firebase Cloud Messaging (FCM):** Push notifications with vibration for Circuit Breaker trips and AI signals.
* **Firebase Authentication & Firestore:** Trader identity and cloud backup of risk preferences.
