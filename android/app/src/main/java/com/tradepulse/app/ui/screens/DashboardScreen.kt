package com.tradepulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradepulse.app.ui.theme.*
import com.tradepulse.app.viewmodel.TradingUiState
import com.tradepulse.app.viewmodel.TradingViewModel

@Composable
fun DashboardScreen(
    state: TradingUiState,
    viewModel: TradingViewModel
) {
    var showKillSwitchDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "TradePulse AI",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Autonomous Forex Algo Engine",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }

            // Connection Badge
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (state.isConnected) EmeraldGreen.copy(alpha = 0.15f) else CoralRed.copy(alpha = 0.15f))
                    .border(1.dp, if (state.isConnected) EmeraldGreen else CoralRed, RoundedCornerShape(20.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(if (state.isConnected) EmeraldGreen else CoralRed)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (state.isConnected) "LIVE STREAM" else "CONNECTING",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (state.isConnected) EmeraldGreen else CoralRed
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Portfolio Equity Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "TOTAL PORTFOLIO EQUITY", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "$${String.format("%,.2f", state.accountEquity)}",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    val pnlColor = if (state.unrealizedPnl >= 0) EmeraldGreen else CoralRed
                    val pnlSign = if (state.unrealizedPnl >= 0) "+" else ""
                    Text(
                        text = "$pnlSign$${String.format("%.2f", state.unrealizedPnl)}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = pnlColor,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
                Divider(color = BorderStroke)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "BALANCE", fontSize = 10.sp, color = TextMuted)
                        Text(text = "$${String.format("%,.2f", state.accountBalance)}", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                    }
                    Column {
                        Text(text = "OPEN TRADES", fontSize = 10.sp, color = TextMuted)
                        Text(text = "${state.openPositions.size} Active", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = ElectricBlue)
                    }
                    Column {
                        Text(text = "TARGET EFFICIENCY", fontSize = 10.sp, color = TextMuted)
                        Text(text = "84.2% Win Confluence", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = EmeraldGreen)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Active Forex Market Card (EUR/USD)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = state.activePair, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text(
                        text = String.format("%.5f", state.currentPrice),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = ElectricBlue,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = "US Session Overlap | Pip Precision: 0.0001", fontSize = 11.sp, color = TextMuted)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // AI Confluence Decision Matrix Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
            shape = RoundedCornerShape(16.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, ElectricBlue.copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "AI CONFLUENCE MATRIX (>= 80% GATE)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ElectricBlue
                    )
                    Text(
                        text = "${state.signal.confidencePercentage}% Confidence",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (state.signal.confidencePercentage >= 80) EmeraldGreen else WarningAmber
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    val badgeColor = when (state.signal.direction) {
                        "BUY" -> EmeraldGreen
                        "SELL" -> CoralRed
                        else -> TextMuted
                    }
                    Text(
                        text = "[${state.signal.direction}] ${state.signal.pair}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = badgeColor
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    if (state.signal.qualifiesForExecution) {
                        Text(
                            text = "QUALIFIED FOR EXECUTION",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldGreen,
                            modifier = Modifier
                                .background(EmeraldGreen.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Reasoning Tags
                state.signal.reasoningTags.forEach { tag ->
                    Text(
                        text = "• $tag",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(vertical = 1.dp)
                    )
                }

                if (state.signal.qualifiesForExecution) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { viewModel.executeManualTrade(state.signal.direction) },
                        modifier = Modifier.fillMaxWidth().height(46.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                        shape = RoundedCornerShape(8.dp),
                        enabled = !state.circuitBreaker.isHalted
                    ) {
                        Text(
                            text = "⚡ EXECUTE AI ${state.signal.direction} SIGNAL (${state.signal.confidencePercentage}%)",
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Direct Market Execution (One-Tap Buy / Sell)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = { viewModel.executeManualTrade("BUY") },
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                shape = RoundedCornerShape(10.dp),
                enabled = !state.circuitBreaker.isHalted
            ) {
                Text("BUY EUR/USD", fontWeight = FontWeight.Bold, color = Color.Black, fontSize = 14.sp)
            }
            Button(
                onClick = { viewModel.executeManualTrade("SELL") },
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CoralRed),
                shape = RoundedCornerShape(10.dp),
                enabled = !state.circuitBreaker.isHalted
            ) {
                Text("SELL EUR/USD", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
            }
        }

        state.statusMessage?.let { msg ->
            Spacer(modifier = Modifier.height(10.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = msg,
                    fontSize = 12.sp,
                    color = ElectricBlue,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(10.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Circuit Breaker & Max Loss Gauge Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "CIRCUIT BREAKER: MAX LOSS GUARD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WarningAmber)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "$${String.format("%.2f", state.circuitBreaker.totalDailyLoss)} / $${String.format("%.2f", state.circuitBreaker.maxDailyLossLimit)}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Text(
                        text = "${state.circuitBreaker.lossCapacityUsedPct}% Used",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (state.circuitBreaker.lossCapacityUsedPct > 75) CoralRed else EmeraldGreen
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { (state.circuitBreaker.lossCapacityUsedPct / 100f).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = if (state.circuitBreaker.lossCapacityUsedPct > 75) CoralRed else WarningAmber,
                    trackColor = BorderStroke,
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // EMERGENCY KILL SWITCH BUTTON
        Button(
            onClick = { showKillSwitchDialog = true },
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            colors = ButtonDefaults.buttonColors(containerColor = CoralRed),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "EMERGENCY KILL SWITCH",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(30.dp))
    }

    // Confirmation Dialog
    if (showKillSwitchDialog) {
        AlertDialog(
            onDismissRequest = { showKillSwitchDialog = false },
            title = { Text(text = "CONFIRM EMERGENCY KILL", color = CoralRed, fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    text = "This will immediately liquidate all open Forex positions at market price and freeze automated algorithmic trading. Are you sure?",
                    color = TextPrimary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.triggerEmergencyKillSwitch()
                        showKillSwitchDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CoralRed)
                ) {
                    Text("LIQUIDATE & HALT", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showKillSwitchDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = SurfaceElevated
        )
    }
}
