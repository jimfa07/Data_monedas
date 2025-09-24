import { useState, useEffect } from 'react';
import { Activity, Bell } from 'lucide-react';
import { TradingChart } from './TradingChart';
import { MarketOverview } from './MarketOverview';
import { SignalNotifications } from './SignalNotifications';
import { TradingControls } from './TradingControls';
import { useTradingData } from '@/hooks/useTradingData';
import { type Timeframe } from '@/types/trading';

export function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('15m');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { 
    marketData, 
    chartData, 
    indicators, 
    signals, 
    dashboardSummary,
    tradingPairs,
    isLoading 
  } = useTradingData(selectedSymbol, selectedTimeframe);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const selectedMarketData = marketData?.find(data => data.symbol === selectedSymbol);
  const activeSignalsCount = signals?.length || 0;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6" data-testid="trading-dashboard">
      {/* Header */}
      <div className="gradient-card rounded-lg border border-border">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-bull/20 rounded-lg">
                  <Activity className="w-8 h-8 text-bull" data-testid="header-activity-icon" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-bull to-green-400 bg-clip-text text-transparent">
                    Trading Strategy Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Multiple Indicators + TL Alerts [LUPOWN Strategy]
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-bull/10 border border-bull/20">
                <div className="w-2 h-2 bg-bull rounded-full animate-pulse" data-testid="live-indicator"></div>
                <span className="text-sm font-medium text-bull">Live</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Last Update</div>
                <div className="text-sm font-medium" data-testid="last-update-time">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <TradingControls
        selectedSymbol={selectedSymbol}
        selectedTimeframe={selectedTimeframe}
        activeSignalsCount={activeSignalsCount}
        tradingPairs={tradingPairs || []}
        onSymbolChange={setSelectedSymbol}
        onTimeframeChange={setSelectedTimeframe}
      />

      {/* Main Chart Section */}
      <TradingChart
        symbol={selectedSymbol}
        timeframe={selectedTimeframe}
        marketData={selectedMarketData}
        chartData={chartData || []}
        indicators={indicators}
        recentSignals={signals?.slice(0, 3) || []}
        isLoading={isLoading}
      />

      {/* Market Overview and Signals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MarketOverview
          dashboardSummary={dashboardSummary}
          topMovers={dashboardSummary?.market.topMovers || []}
          isLoading={isLoading}
        />
        
        <SignalNotifications
          signals={signals || []}
          dashboardSummary={dashboardSummary}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
