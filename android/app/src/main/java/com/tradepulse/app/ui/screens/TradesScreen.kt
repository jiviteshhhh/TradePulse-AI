package com.tradepulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradepulse.app.data.model.PositionModel
import com.tradepulse.app.ui.theme.*
import com.tradepulse.app.viewmodel.TradingUiState

@Composable
fun TradesScreen(state: TradingUiState) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .padding(16.dp)
    ) {
        Text(
            text = "Active Blotter & Trades",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "${state.openPositions.size} Real-time Open Forex Positions",
            fontSize = 12.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (state.openPositions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 60.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "No Active Positions", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(text = "AI Engine is monitoring market for >=80% Confluence setups.", fontSize = 12.sp, color = TextMuted)
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.openPositions) { pos ->
                    TradeCard(pos)
                }
            }
        }
    }
}

@Composable
fun TradeCard(pos: PositionModel) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val directionColor = if (pos.direction == "BUY") EmeraldGreen else CoralRed
                    Text(
                        text = pos.direction,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = directionColor
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = pos.pair,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }

                val pnlColor = if (pos.floatingPnl >= 0) EmeraldGreen else CoralRed
                val pnlSign = if (pos.floatingPnl >= 0) "+" else ""
                Text(
                    text = "$pnlSign$${String.format("%.2f", pos.floatingPnl)}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = pnlColor,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Lot: ${pos.lotSize}", fontSize = 12.sp, color = TextSecondary)
                Text(text = "Entry: ${pos.entryPrice}", fontSize = 12.sp, color = TextSecondary)
                Text(text = "Current: ${pos.currentPrice}", fontSize = 12.sp, color = ElectricBlue)
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "SL: ${pos.stopLoss}", fontSize = 11.sp, color = CoralRed)
                Text(text = "TP: ${pos.takeProfit}", fontSize = 11.sp, color = EmeraldGreen)
                Text(text = "Pips: ${pos.pipsGained}", fontSize = 11.sp, color = TextMuted)
            }
        }
    }
}
