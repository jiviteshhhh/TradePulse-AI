package com.tradepulse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.tradepulse.app.ui.screens.DashboardScreen
import com.tradepulse.app.ui.screens.RiskGovernanceScreen
import com.tradepulse.app.ui.screens.TerminalWebViewScreen
import com.tradepulse.app.ui.screens.TradesScreen
import com.tradepulse.app.ui.theme.BgDark
import com.tradepulse.app.ui.theme.ElectricBlue
import com.tradepulse.app.ui.theme.SurfaceElevated
import com.tradepulse.app.ui.theme.TextMuted
import com.tradepulse.app.ui.theme.TradePulseTheme
import com.tradepulse.app.viewmodel.TradingViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: TradingViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TradePulseTheme {
                MainAppScaffold(viewModel)
            }
        }
    }
}

@Composable
fun MainAppScaffold(viewModel: TradingViewModel) {
    val state by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        containerColor = BgDark,
        bottomBar = {
            NavigationBar(
                containerColor = SurfaceElevated
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Dashboard") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ElectricBlue,
                        selectedTextColor = ElectricBlue,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Computer, contentDescription = "Terminal") },
                    label = { Text("Terminal") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ElectricBlue,
                        selectedTextColor = ElectricBlue,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Security, contentDescription = "Risk") },
                    label = { Text("Risk") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ElectricBlue,
                        selectedTextColor = ElectricBlue,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Assessment, contentDescription = "Trades") },
                    label = { Text("Trades") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ElectricBlue,
                        selectedTextColor = ElectricBlue,
                        unselectedIconColor = TextMuted,
                        unselectedTextColor = TextMuted
                    )
                )
            }
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            color = BgDark
        ) {
            when (selectedTab) {
                0 -> DashboardScreen(state = state, viewModel = viewModel)
                1 -> TerminalWebViewScreen(viewModel = viewModel)
                2 -> RiskGovernanceScreen(state = state, viewModel = viewModel)
                3 -> TradesScreen(state = state)
            }
        }
    }
}
