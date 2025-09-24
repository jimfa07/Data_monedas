import React, { useState, useEffect } from 'react';
import { TradingChart } from './TradingChart';
import { MarketOverview } from './MarketOverview';
import { SignalNotifications } from './SignalNotifications';
import { TimeframeSelector } from './TimeframeSelector';
import { SymbolSelector } from './SymbolSelector';
import { binanceAPI } from '../services/binanceApi';
import { ChartData, Timeframe, TradingSignal } from '../types/trading';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Activity, TrendingUp, Bell } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Trading pairs list as requested
const TRADING_PAIRS = [
  'BTCUSDT', 'LTCUSDT', 'PROMUSDT', 'RAROUSDT', 'BNBUSDT', 
  'FILUSDT', 'HIFIUSDT', 'COTIUSDT', 'ORDIUSDT', 'ZECUSDT', 
  'QNTUSDT', 'SOLUSDT', 'UNIUSDT', 'ATOMUSDT', 'AVAXUSDT', 
  'COMPUSDT', 'LINKUSDT', 'UMAUSDT', 'ICPUSDT', 'ILVUSDT', 
  'MOVRUSDT', 'KSMUSDT', 'KAVAUSDT', 'INJUSDT', 'CRVUSDT', 
  'CELUSDT', 'OMUSDT', 'EGLDUSDT', 'YGGUSDT', 'ZENUSDT', 
  'FLOWUSDT', 'FIDAUSDT', 'ETHUSDT', 'ETCUSDT', 'CVXUSDT', 
  'TLMUSDT', 'DYDXUSDT', 'RSRUSDT', 'AUCTIONUSDT', 'BAKEUSDT'
];

export const TradingDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Load chart data
  const loadChartData = async (symbol: string, tf: Timeframe) => {
    try {
      setLoading(true);
      const data = await binanceAPI.getCandleData(symbol, tf, 500);
      setChartData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading chart data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chart data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle new trading signals
  const handleNewSignal = (signal: TradingSignal) => {
    setSignals(prev => [signal, ...prev].slice(0, 50)); // Keep last 50 signals

    // Show notification
    toast({
      title: `${signal.type} Signal`,
      description: `${signal.symbol} - ${signal.strength} signal at $${signal.price.toFixed(4)}`,
      variant: signal.type === 'BUY' ? 'default' : 'destructive',
    });

    // Browser notification (if permissions granted)
    if (Notification.permission === 'granted') {
      new Notification(`Trading Signal: ${signal.symbol}`, {
        body: `${signal.type} signal detected - ${signal.strength} strength`,
        icon: '/favicon.ico'
      });
    }
  };

  // Request notification permissions
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadChartData(selectedSymbol, timeframe);
  }, [selectedSymbol, timeframe]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadChartData(selectedSymbol, timeframe);
    }, timeframe === '1s' ? 2000 : timeframe === '15m' ? 15000 : 30000);

    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <Card className="gradient-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-bull animate-pulse" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-bull bg-clip-text text-transparent">
                    Trading Strategy Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Multiple Indicators + TL Alerts [LUPOWN Strategy]
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-bull rounded-full animate-pulse" />
                <span>Live</span>
              </Badge>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Last Update</div>
                <div className="text-sm font-medium">{lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <SymbolSelector
            symbols={TRADING_PAIRS}
            selected={selectedSymbol}
            onSelect={setSelectedSymbol}
          />
        </Card>
        <Card className="p-4">
          <TimeframeSelector
            selected={timeframe}
            onSelect={setTimeframe}
          />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-bull" />
            <span className="font-medium">Active Signals</span>
          </div>
          <Badge variant={signals.length > 0 ? 'default' : 'secondary'}>
            {signals.length}
          </Badge>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Chart Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="signals">Signal History</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-6">
          {loading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-8 h-8 border-4 border-bull border-t-transparent rounded-full animate-spin" />
                <span className="text-lg">Loading chart data...</span>
              </div>
            </Card>
          ) : (
            <TradingChart
              symbol={selectedSymbol}
              data={chartData}
              timeframe={timeframe}
              onSignal={handleNewSignal}
            />
          )}
        </TabsContent>

        <TabsContent value="overview">
          <MarketOverview symbols={TRADING_PAIRS} />
        </TabsContent>

        <TabsContent value="signals">
          <SignalNotifications signals={signals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
