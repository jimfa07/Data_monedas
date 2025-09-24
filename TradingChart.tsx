import { BarChart3, TrendingUp, TrendingDown, Triangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatPercentage } from '@/utils/chartUtils';
import { type MarketData, type ChartData, type TechnicalIndicators, type TradingSignal, type Timeframe } from '@/types/trading';

interface TradingChartProps {
  symbol: string;
  timeframe: Timeframe;
  marketData?: MarketData;
  chartData: ChartData[];
  indicators?: TechnicalIndicators;
  recentSignals: TradingSignal[];
  isLoading: boolean;
}

export function TradingChart({
  symbol,
  timeframe,
  marketData,
  chartData,
  indicators,
  recentSignals,
  isLoading
}: TradingChartProps) {
  if (isLoading) {
    return (
      <div className="chart-container rounded-lg border border-border" data-testid="trading-chart-loading">
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const priceChangeClass = marketData?.priceChangePercent >= 0 ? 'price-up' : 'price-down';
  const priceChangeIcon = marketData?.priceChangePercent >= 0 ? TrendingUp : TrendingDown;
  const PriceChangeIcon = priceChangeIcon;

  // Calculate chart bar heights for visualization
  const chartBars = chartData.slice(-50).map((candle, index) => {
    const isGreen = candle.close > candle.open;
    const maxPrice = Math.max(...chartData.slice(-50).map(c => c.high));
    const minPrice = Math.min(...chartData.slice(-50).map(c => c.low));
    const priceRange = maxPrice - minPrice;
    const height = priceRange > 0 ? ((candle.close - minPrice) / priceRange) * 100 : 50;
    
    return {
      height: Math.max(height, 5), // Minimum height for visibility
      isGreen,
      candle,
      index
    };
  });

  // Calculate volume bars
  const volumeBars = chartData.slice(-50).map((candle, index) => {
    const maxVolume = Math.max(...chartData.slice(-50).map(c => c.volume));
    const height = maxVolume > 0 ? (candle.volume / maxVolume) * 100 : 50;
    
    return {
      height: Math.max(height, 5),
      candle,
      index
    };
  });

  return (
    <div className="chart-container rounded-lg border border-border" data-testid="trading-chart">
      {/* Chart Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-bull" />
              <h3 className="text-lg font-semibold" data-testid="chart-symbol">
                {symbol}
              </h3>
            </div>
            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
              {timeframe.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div 
                className={`text-2xl font-bold ${priceChangeClass}`}
                data-testid="current-price"
              >
                {marketData ? formatPrice(marketData.price) : '--'}
              </div>
              <div className="text-sm flex items-center">
                <PriceChangeIcon className="w-4 h-4 mr-1" />
                <span data-testid="price-change">
                  {marketData ? formatPercentage(marketData.priceChangePercent) : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        {recentSignals.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" data-testid="recent-signals">
            {recentSignals.map((signal) => (
              <div
                key={signal.id}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  signal.type === 'BUY' 
                    ? 'bg-bull/20 text-bull signal-pulse' 
                    : 'bg-bear/20 text-bear'
                }`}
                data-testid={`signal-${signal.type.toLowerCase()}`}
              >
                <Triangle 
                  className={`w-3 h-3 fill-current ${signal.type === 'SELL' ? 'rotate-180' : ''}`} 
                />
                <span>{signal.type}</span>
                <span className="opacity-70">({signal.strength})</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical Indicators */}
        {indicators && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" data-testid="technical-indicators">
            <div>
              <span className="text-muted-foreground">RSI:</span>
              <span className="ml-1 font-medium text-bull" data-testid="rsi-value">
                {indicators.rsi.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">EMA 10:</span>
              <span className="ml-1 font-medium text-blue-400" data-testid="ema10-value">
                {formatPrice(indicators.ema10)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">EMA 55:</span>
              <span className="ml-1 font-medium text-yellow-400" data-testid="ema55-value">
                {formatPrice(indicators.ema55)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">VWAP:</span>
              <span className="ml-1 font-medium text-foreground" data-testid="vwap-value">
                {formatPrice(indicators.vwap)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Chart Area */}
      <div className="p-4 bg-black/20">
        <div className="space-y-4">
          {/* Price Movement Chart */}
          <div className="h-80 bg-card/20 rounded-lg p-4 relative" data-testid="price-chart">
            {chartBars.length > 0 ? (
              <div className="h-full flex items-end space-x-1">
                {chartBars.map((bar, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                      bar.isGreen ? 'bg-bull' : 'bg-bear'
                    }`}
                    style={{ height: `${bar.height}%` }}
                    title={`Price: ${formatPrice(bar.candle.close)} | Time: ${new Date(bar.candle.time).toLocaleTimeString()}`}
                    data-testid={`candle-${index}`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
            
            {chartData.length > 0 && (
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span data-testid="chart-low">
                  {formatPrice(Math.min(...chartData.slice(-50).map(c => c.low)))}
                </span>
                <span>Price Movement (Last 50 candles)</span>
                <span data-testid="chart-high">
                  {formatPrice(Math.max(...chartData.slice(-50).map(c => c.high)))}
                </span>
              </div>
            )}
          </div>

          {/* Volume Chart */}
          <div className="h-16 bg-card/20 rounded-lg p-4" data-testid="volume-chart">
            {volumeBars.length > 0 ? (
              <div className="h-full flex items-end space-x-1">
                {volumeBars.map((bar, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-muted/60 rounded-t"
                    style={{ height: `${bar.height}%` }}
                    data-testid={`volume-bar-${index}`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                No volume data
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground text-center">Volume</div>
          </div>

          {/* Market Summary */}
          {marketData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="market-summary">
              <div className="bg-card/40 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Open</div>
                <div className="font-medium" data-testid="open-price">
                  {formatPrice(marketData.openPrice)}
                </div>
              </div>
              <div className="bg-card/40 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">High</div>
                <div className="font-medium text-bull" data-testid="high-price">
                  {formatPrice(marketData.highPrice)}
                </div>
              </div>
              <div className="bg-card/40 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Low</div>
                <div className="font-medium text-bear" data-testid="low-price">
                  {formatPrice(marketData.lowPrice)}
                </div>
              </div>
              <div className="bg-card/40 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Volume</div>
                <div className="font-medium" data-testid="volume">
                  {marketData.volume.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
