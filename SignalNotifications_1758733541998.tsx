import React from 'react';
import { TradingSignal } from '../types/trading';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Triangle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface SignalNotificationsProps {
  signals: TradingSignal[];
}

export const SignalNotifications: React.FC<SignalNotificationsProps> = ({ signals }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatPrice = (price: number): string => {
    return price > 1 ? price.toFixed(2) : price.toFixed(6);
  };

  if (signals.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Triangle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Signals Yet</h3>
            <p className="text-muted-foreground">
              Trading signals will appear here when detected by the strategy
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Group signals by symbol for better organization
  const groupedSignals = signals.reduce((acc, signal) => {
    if (!acc[signal.symbol]) {
      acc[signal.symbol] = [];
    }
    acc[signal.symbol].push(signal);
    return acc;
  }, {} as Record<string, TradingSignal[]>);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bull/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-bull" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Buy Signals</div>
              <div className="text-xl font-bold text-bull">
                {signals.filter(s => s.type === 'BUY').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bear/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-bear" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sell Signals</div>
              <div className="text-xl font-bold text-bear">
                {signals.filter(s => s.type === 'SELL').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Signal</div>
              <div className="text-sm font-bold text-foreground">
                {signals.length > 0 ? formatTime(signals[0].timestamp) : 'None'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Signals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Triangle className="w-5 h-5 text-bull" />
          <span>Recent Signals</span>
        </h3>

        <div className="space-y-4">
          {signals.slice(0, 20).map((signal) => (
            <div
              key={signal.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:bg-card/80 ${
                signal.type === 'BUY' 
                  ? 'border-bull/30 bg-bull/5' 
                  : 'border-bear/30 bg-bear/5'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  signal.type === 'BUY' ? 'bg-bull/20' : 'bg-bear/20'
                }`}>
                  <Triangle
                    className={`w-5 h-5 ${
                      signal.type === 'BUY' 
                        ? 'text-bull rotate-0' 
                        : 'text-bear rotate-180'
                    }`}
                    fill="currentColor"
                  />
                </div>
                
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-foreground">
                      {signal.symbol.replace('USDT', '/USDT')}
                    </span>
                    <Badge
                      variant={signal.type === 'BUY' ? 'default' : 'destructive'}
                      className={signal.type === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'}
                    >
                      {signal.type}
                    </Badge>
                    <Badge variant="outline">
                      {signal.timeframe.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <span>Price: ${formatPrice(signal.price)}</span>
                    <span>•</span>
                    <span>Strength: {signal.strength}</span>
                    <span>•</span>
                    <span>{formatTime(signal.timestamp)}</span>
                  </div>
                  
                  {signal.indicators.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-muted-foreground">Indicators:</span>
                      {signal.indicators.map((indicator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${
                  signal.type === 'BUY' ? 'text-bull' : 'text-bear'
                }`}>
                  ${formatPrice(signal.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {signal.timestamp.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {signals.length > 20 && (
          <div className="mt-4 text-center">
            <Badge variant="outline">
              Showing latest 20 of {signals.length} signals
            </Badge>
          </div>
        )}
      </Card>

      {/* Signal Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Signal Distribution by Symbol</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedSignals)
            .sort(([, a], [, b]) => b.length - a.length)
            .slice(0, 12)
            .map(([symbol, symbolSignals]) => {
              const buyCount = symbolSignals.filter(s => s.type === 'BUY').length;
              const sellCount = symbolSignals.filter(s => s.type === 'SELL').length;
              const latestSignal = symbolSignals[0];

              return (
                <Card key={symbol} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">
                      {symbol.replace('USDT', '/USDT')}
                    </span>
                    <Badge variant="outline">
                      {symbolSignals.length} signals
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-bull">Buy signals:</span>
                      <span className="font-medium text-bull">{buyCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-bear">Sell signals:</span>
                      <span className="font-medium text-bear">{sellCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Latest:</span>
                      <span className="font-medium">
                        {formatTime(latestSignal.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Visual indicator */}
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-bull" 
                        style={{ width: `${(buyCount / symbolSignals.length) * 100}%` }}
                      />
                      <div 
                        className="bg-bear" 
                        style={{ width: `${(sellCount / symbolSignals.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      </Card>
    </div>
  );
};
