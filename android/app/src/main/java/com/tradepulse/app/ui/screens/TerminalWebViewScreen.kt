package com.tradepulse.app.ui.screens

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.webkit.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.tradepulse.app.ui.theme.*
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

    @JavascriptInterface
    fun onOrderPlaced(symbol: String, side: String, size: Double) {
        viewModel.loadActiveTrades()
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TerminalWebViewScreen(
    viewModel: TradingViewModel,
    terminalUrl: String = "http://10.0.2.2:5173"
) {
    var isFailed by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(true) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            isLoading = true
                            isFailed = false
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            isLoading = false
                        }

                        override fun onReceivedError(
                            view: WebView?,
                            request: WebResourceRequest?,
                            error: WebResourceError?
                        ) {
                            if (request?.isForMainFrame == true) {
                                isFailed = true
                                isLoading = false
                            }
                        }
                    }

                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    }
                    addJavascriptInterface(AndroidBridge(viewModel), "AndroidBridge")
                    webViewRef = this
                    loadUrl(terminalUrl)
                }
            }
        )

        // Loading Overlay
        if (isLoading && !isFailed) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BgDark.copy(alpha = 0.85f)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = ElectricBlue)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Loading Institutional Terminal...",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        // Elegant Fallback Card if Vite Dev Server is not currently running
        if (isFailed) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BgDark)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Computer,
                            contentDescription = null,
                            tint = WarningAmber,
                            modifier = Modifier.size(48.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "Terminal Host Server Standby",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "To view the full institutional desktop terminal directly in Android, start the Vite development server on your machine:",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Card(
                            colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "cd ~/Desktop/institutional-algorithmic-terminal\nnpm run dev",
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                color = ElectricBlue,
                                modifier = Modifier.padding(12.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Button(
                            onClick = {
                                isFailed = false
                                isLoading = true
                                webViewRef?.loadUrl(terminalUrl)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Reconnect to Terminal (5173)", color = Color.White)
                        }
                    }
                }
            }
        }
    }
}
