import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatPercentage } from '@/utils/chartUtils';
import { type MarketData, type DashboardSummary } from '@/types/trading';

interface MarketOverviewProps {
  dashboardSummary?: DashboardSummary;
  topMovers: MarketData[];
  isLoading: boolean;
}

export function MarketOverview({ 
  dashboardSummary, 
  topMovers, 
  isLoading 
}: MarketOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="market-overview-loading">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="market-overview">
      {/* Market Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="gradient-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bull/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-bull" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Gainers</div>
              <div className="text-xl font-bold text-bull" data-testid="gainers-count">
                {dashboardSummary?.market.gainers || 0}
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
              <div className="text-sm text-muted-foreground">Losers</div>
              <div className="text-xl font-bold text-bear" data-testid="losers-count">
                {dashboardSummary?.market.losers || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Pairs</div>
              <div className="text-xl font-bold text-foreground" data-testid="total-pairs-count">
                {dashboardSummary?.market.totalPairs || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-bull" />
          <span>Top Movers (24h)</span>
        </h3>

        {topMovers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="top-movers-grid">
            {topMovers.slice(0, 6).map((mover) => {
              const isPositive = mover.priceChangePercent >= 0;
              const TrendIcon = isPositive ? TrendingUp : TrendingDown;
              
              return (
                <div
                  key={mover.symbol}
                  className="bg-card/80 rounded-lg border border-border p-4 hover:bg-card/60 transition-colors cursor-pointer"
                  data-testid={`top-mover-${mover.symbol}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-foreground">
                      {mover.symbol}
                    </div>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isPositive 
                          ? 'bg-bull/20 text-bull' 
                          : 'bg-bear/20 text-bear'
                      }`}
                      data-testid={`change-${mover.symbol}`}
                    >
                      {formatPercentage(mover.priceChangePercent)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span 
                        className={`font-medium ${isPositive ? 'text-bull' : 'text-bear'}`}
                        data-testid={`price-${mover.symbol}`}
                      >
                        {formatPrice(mover.price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="font-medium" data-testid={`volume-${mover.symbol}`}>
                        {(mover.volume / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-1">
                    <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-bull' : 'text-bear'}`} />
                    <div className="h-2 bg-muted rounded-full flex-1">
                      <div
                        className={`h-full rounded-full ${isPositive ? 'bg-bull' : 'bg-bear'}`}
                        style={{ 
                          width: `${Math.min(Math.abs(mover.priceChangePercent) * 10, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No market data available
          </div>
        )}
      </div>
    </div>
  );
}
