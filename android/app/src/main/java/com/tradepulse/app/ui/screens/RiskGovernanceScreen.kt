package com.tradepulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradepulse.app.ui.theme.*
import com.tradepulse.app.viewmodel.TradingUiState
import com.tradepulse.app.viewmodel.TradingViewModel
import kotlin.math.roundToInt

@Composable
fun RiskGovernanceScreen(
    state: TradingUiState,
    viewModel: TradingViewModel
) {
    var sliderValue by remember(state.circuitBreaker.maxDailyLossLimit) {
        mutableFloatStateOf(state.circuitBreaker.maxDailyLossLimit.toFloat())
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Risk Governance & Limits",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Capital Preservation & Automated Circuit Breaker",
            fontSize = 12.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Max Daily Loss Setting Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "MAXIMUM DAILY LOSS THRESHOLD",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = WarningAmber
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Trading will automatically freeze and liquidate if total daily loss touches this amount.",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Current Loss Limit:", fontSize = 14.sp, color = TextPrimary)
                    Text(
                        text = "$${sliderValue.roundToInt()}",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = ElectricBlue
                    )
                }

                Slider(
                    value = sliderValue,
                    onValueChange = { sliderValue = it },
                    valueRange = 50f..500f,
                    steps = 8,
                    colors = SliderDefaults.colors(
                        thumbColor = ElectricBlue,
                        activeTrackColor = ElectricBlue,
                        inactiveTrackColor = BorderStroke
                    )
                )

                Button(
                    onClick = { viewModel.updateMaxLossLimit(sliderValue.toDouble()) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Apply Loss Limit", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Circuit Breaker State Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "CIRCUIT BREAKER STATUS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(12.dp))

                val isHalted = state.circuitBreaker.isHalted || state.circuitBreaker.emergencyKillSwitchEngaged
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "State:", fontSize = 14.sp, color = TextSecondary)
                    Text(
                        text = if (isHalted) "HALTED (TRIPPED)" else "ARMED (NORMAL)",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isHalted) CoralRed else EmeraldGreen
                    )
                }

                if (state.circuitBreaker.haltReason.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Reason: ${state.circuitBreaker.haltReason}",
                        fontSize = 12.sp,
                        color = CoralRed
                    )
                }

                if (isHalted) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.resetCircuitBreaker() },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Reset Circuit Breaker & Resume AI", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
