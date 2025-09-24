import { TrendingUp, TrendingDown, Clock, Triangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatTime } from '@/utils/chartUtils';
import { type TradingSignal, type DashboardSummary } from '@/types/trading';

interface SignalNotificationsProps {
  signals: TradingSignal[];
  dashboardSummary?: DashboardSummary;
  isLoading: boolean;
}

export function SignalNotifications({ 
  signals, 
  dashboardSummary, 
  isLoading 
}: SignalNotificationsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="signal-notifications-loading">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const buySignals = signals.filter(s => s.type === 'BUY').length;
  const sellSignals = signals.filter(s => s.type === 'SELL').length;
  const lastSignalTime = signals.length > 0 ? signals[0].timestamp : null;

  return (
    <div className="space-y-6" data-testid="signal-notifications">
      {/* Signal Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="gradient-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bull/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-bull" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Buy Signals</div>
              <div className="text-xl font-bold text-bull" data-testid="buy-signals-count">
                {buySignals}
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bear/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-bear" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sell Signals</div>
              <div className="text-xl font-bold text-bear" data-testid="sell-signals-count">
                {sellSignals}
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Signal</div>
              <div className="text-sm font-bold text-foreground" data-testid="last-signal-time">
                {lastSignalTime ? formatTime(lastSignalTime) : '--:--:--'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Triangle className="w-5 h-5 text-bull" />
          <span>Recent Signals</span>
        </h3>

        {signals.length > 0 ? (
          <div className="space-y-4" data-testid="signals-list">
            {signals.slice(0, 5).map((signal) => {
              const isBuy = signal.type === 'BUY';
              const SignalIcon = isBuy ? TrendingUp : TrendingDown;
              
              return (
                <div
                  key={signal.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                    isBuy 
                      ? 'border-bull/30 bg-bull/5 hover:bg-bull/10' 
                      : 'border-bear/30 bg-bear/5 hover:bg-bear/10'
                  }`}
                  data-testid={`signal-${signal.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${isBuy ? 'bg-bull/20' : 'bg-bear/20'}`}>
                      <Triangle 
                        className={`w-5 h-5 fill-current ${
                          isBuy ? 'text-bull' : 'text-bear rotate-180'
                        }`} 
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-foreground">
                          {signal.symbol}
                        </span>
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isBuy ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                          }`}
                        >
                          {signal.type}
                        </span>
                        <span className="px-2 py-1 border border-border rounded text-xs">
                          {signal.timeframe.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span>Price: {formatPrice(signal.price)}</span>
                        <span>•</span>
                        <span>Strength: {signal.strength}</span>
                        <span>•</span>
                        <span data-testid={`signal-time-${signal.id}`}>
                          {formatTime(signal.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-muted-foreground">Indicators:</span>
                        {signal.indicators.map((indicator, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 border border-border rounded text-xs"
                            data-testid={`indicator-${index}`}
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isBuy ? 'text-bull' : 'text-bear'}`}>
                      {formatPrice(signal.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No trading signals available
          </div>
        )}

        {signals.length > 5 && (
          <div className="mt-4 text-center">
            <span className="px-3 py-1 border border-border rounded text-xs text-muted-foreground">
              Showing latest 5 of {signals.length} signals
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
