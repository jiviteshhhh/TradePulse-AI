import React from 'react';
import { TradingViewChart } from './TradingViewChart';
import { OrderBook } from './OrderBook';
import { OrderTicket } from './OrderTicket';
import { OrderBlotter } from './OrderBlotter';

export const DeskExecution: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-2 p-2">
      {/* Upper trading grid: Chart (6 col) + OrderTicket (3 col) + OrderBook (3 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 shrink-0">
        {/* Chart Viewport */}
        <div className="order-1 lg:col-span-6 h-[380px]">
          <TradingViewChart />
        </div>

        {/* Algorithmic Order Ticket (prioritized right below chart on mobile) */}
        <div className="order-2 lg:order-3 lg:col-span-3 min-h-[380px]">
          <OrderTicket />
        </div>

        {/* Level 2 Order Book */}
        <div className="order-3 lg:order-2 lg:col-span-3 min-h-[340px]">
          <OrderBook />
        </div>
      </div>

      {/* Lower Blotter: Positions, Algo Orders, Fills */}
      <div className="order-4 min-h-[260px] shrink-0">
        <OrderBlotter />
      </div>
    </div>
  );
};
