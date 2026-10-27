/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TerminalProvider, useTerminal } from './context/TerminalContext';
import { HeaderTelemetry } from './components/HeaderTelemetry';
import { DeskExecution } from './components/DeskExecution';
import { DeskStrategies } from './components/DeskStrategies';
import { DeskOrderFlow } from './components/DeskOrderFlow';
import { DeskRisk } from './components/DeskRisk';
import { DeskDiagnostics } from './components/DeskDiagnostics';
import { DeskTreasury } from './components/DeskTreasury';
import { KillSwitchModal } from './components/KillSwitchModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { CommandPalette } from './components/CommandPalette';
import { BottomStatusBar } from './components/BottomStatusBar';

const TerminalWorkspace: React.FC = () => {
  const { activeDesk, viewMode } = useTerminal();

  return (
    <div
      className={`flex flex-col w-screen bg-[#0B0F19] text-[#F8FAFC] select-none ${
        viewMode === 'docked' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'
      }`}
    >
      {/* Institutional Header & Navigation */}
      <HeaderTelemetry />

      {/* Main Active Desk Viewport with native vertical scrolling */}
      <main className="flex-1 flex flex-col overflow-y-auto relative min-h-0">
        {activeDesk === 'execution' && <DeskExecution />}
        {activeDesk === 'strategies' && <DeskStrategies />}
        {activeDesk === 'orderflow' && <DeskOrderFlow />}
        {activeDesk === 'risk' && <DeskRisk />}
        {activeDesk === 'diagnostics' && <DeskDiagnostics />}
        {activeDesk === 'treasury' && <DeskTreasury />}
      </main>

      {/* Institutional Bottom Status & Telemetry Bar */}
      <BottomStatusBar />

      {/* Level 3 Emergency Kill Switch Modal */}
      <KillSwitchModal />

      {/* Institutional Payment Gateway Modal */}
      <PaymentGatewayModal />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <TerminalProvider>
      <TerminalWorkspace />
    </TerminalProvider>
  );
}
