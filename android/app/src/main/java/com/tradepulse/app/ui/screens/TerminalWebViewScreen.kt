package com.tradepulse.app.ui.screens

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.tradepulse.app.viewmodel.TradingViewModel

class AndroidBridge(private val viewModel: TradingViewModel) {
    @JavascriptInterface
    fun onKillSwitchTriggered(reason: String) {
        viewModel.triggerEmergencyKillSwitch("Triggered via Terminal WebView Bridge: $reason")
    }

    @JavascriptInterface
    fun onMaxLossUpdated(limit: Double) {
        viewModel.updateMaxLossLimit(limit)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TerminalWebViewScreen(
    viewModel: TradingViewModel,
    terminalUrl: String = "http://10.0.2.2:5173" // Vite default port or local server
) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                webViewClient = WebViewClient()
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }
                addJavascriptInterface(AndroidBridge(viewModel), "AndroidBridge")
                loadUrl(terminalUrl)
            }
        }
    )
}
