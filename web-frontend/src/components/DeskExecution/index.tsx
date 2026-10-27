import React from 'react';
import { TradingViewChart } from './TradingViewChart';
import { OrderBook } from './OrderBook';
import { OrderTicket } from './OrderTicket';
import { OrderBlotter } from './OrderBlotter';

export const DeskExecution: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-0">
      {/* Upper trading grid: Chart (6 col) + OrderBook (3 col) + OrderTicket (3 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 shrink-0 min-h-[460px]">
        {/* Chart Viewport */}
        <div className="lg:col-span-6 h-full min-h-[380px]">
          <TradingViewChart />
        </div>

        {/* Level 2 Order Book */}
        <div className="lg:col-span-3 h-full min-h-[380px]">
          <OrderBook />
        </div>

        {/* Algorithmic Order Ticket */}
        <div className="lg:col-span-3 h-full min-h-[380px]">
          <OrderTicket />
        </div>
      </div>

      {/* Lower Blotter: Positions, Algo Orders, Fills */}
      <div className="h-[270px] min-h-[220px] shrink-0">
        <OrderBlotter />
      </div>
    </div>
  );
};
