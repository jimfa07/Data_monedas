import React, { useEffect, useState } from 'react';
import { ChartData, Timeframe, TradingSignal } from '../types/trading';
import { TechnicalAnalysis } from '../services/technicalAnalysis';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Triangle, BarChart3 } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  data: ChartData[];
  timeframe: Timeframe;
  onSignal?: (signal: TradingSignal) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
  symbol, 
  data, 
  timeframe,
  onSignal 
}) => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [indicators, setIndicators] = useState<any>(null);

  useEffect(() => {
    if (data.length === 0) return;

    // Calculate indicators and signals
    const closes = data.map(d => d.close);
    
    if (closes.length >= 200) {
      // Calculate and show indicators
      const techIndicators = TechnicalAnalysis.calculateIndicators(data);
      setIndicators(techIndicators);

      // Generate signals
      const newSignals = TechnicalAnalysis.generateSignals(data, symbol, timeframe);
      setSignals(newSignals);

      // Notify parent of new signals
      newSignals.forEach(signal => onSignal?.(signal));
    }
  }, [data, symbol, timeframe, onSignal]);

  const latestPrice = data[data.length - 1]?.close || 0;
  const priceChange = data.length > 1 ? data[data.length - 1].close - data[data.length - 2].close : 0;
  const priceChangePercent = data.length > 1 ? (priceChange / data[data.length - 2].close) * 100 : 0;

  // Calculate price range for visualization
  const prices = data.slice(-50).map(d => d.close); // Last 50 candles
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  return (
    <Card className="chart-container border-border/40">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-bull" />
              <h3 className="text-lg font-semibold">{symbol}</h3>
            </div>
            <Badge variant={timeframe === '1s' ? 'destructive' : 'secondary'}>
              {timeframe.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-xl font-bold ${priceChange >= 0 ? 'price-up' : 'price-down'}`}>
                ${latestPrice.toFixed(4)}
              </div>
              <div className={`text-sm flex items-center ${priceChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {priceChangePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Signals Display */}
        {signals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {signals.slice(-3).map((signal) => (
              <div
                key={signal.id}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium signal-triangle ${
                  signal.type === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                }`}
              >
                <Triangle 
                  className={`w-3 h-3 ${signal.type === 'BUY' ? 'rotate-0' : 'rotate-180'}`}
                  fill="currentColor"
                />
                <span>{signal.type}</span>
                <span className="opacity-70">({signal.strength})</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical Indicators */}
        {indicators && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">RSI:</span>
              <span className={`ml-1 font-medium ${
                indicators.rsi > 70 ? 'text-bear' : indicators.rsi < 30 ? 'text-bull' : 'text-neutral'
              }`}>
                {indicators.rsi.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">EMA 10:</span>
              <span className="ml-1 font-medium text-ema-10">{indicators.ema10.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">EMA 55:</span>
              <span className="ml-1 font-medium text-ema-55">{indicators.ema55.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">VWAP:</span>
              <span className="ml-1 font-medium text-foreground">{indicators.vwap.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Simple Price Chart Visualization */}
      <div className="p-4 bg-chart-bg">
        <div className="space-y-4">
          {/* Price Movement Chart */}
          <div className="h-64 bg-card/20 rounded-lg p-4">
            <div className="h-full flex items-end space-x-1">
              {data.slice(-50).map((candle, index) => {
                const height = priceRange > 0 ? ((candle.close - minPrice) / priceRange) * 100 : 50;
                const isUp = index > 0 ? candle.close >= data[data.length - 50 + index - 1].close : true;
                
                return (
                  <div
                    key={index}
                    className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                      isUp ? 'bg-bull' : 'bg-bear'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`Price: $${candle.close.toFixed(4)}\nTime: ${new Date(candle.time).toLocaleString()}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>${minPrice.toFixed(4)}</span>
              <span>Price Movement (Last 50 candles)</span>
              <span>${maxPrice.toFixed(4)}</span>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="h-20 bg-card/20 rounded-lg p-4">
            <div className="h-full flex items-end space-x-1">
              {data.slice(-50).map((candle, index) => {
                const volumes = data.slice(-50).map(d => d.volume);
                const maxVolume = Math.max(...volumes);
                const height = maxVolume > 0 ? (candle.volume / maxVolume) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    className="flex-1 bg-muted/60 rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`Volume: ${candle.volume.toLocaleString()}`}
                  />
                );
              })}
            </div>
            <div className="mt-1 text-xs text-muted-foreground text-center">Volume</div>
          </div>

          {/* Market Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Open</div>
              <div className="font-medium">${data[data.length - 1]?.open?.toFixed(4) || '0'}</div>
            </div>
            <div className="bg-card/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">High</div>
              <div className="font-medium text-bull">${data[data.length - 1]?.high?.toFixed(4) || '0'}</div>
            </div>
            <div className="bg-card/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Low</div>
              <div className="font-medium text-bear">${data[data.length - 1]?.low?.toFixed(4) || '0'}</div>
            </div>
            <div className="bg-card/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Volume</div>
              <div className="font-medium">{(data[data.length - 1]?.volume || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
