import React, { useState, useEffect } from 'react';
import { binanceAPI } from '../services/binanceApi';
import { MarketData } from '../types/trading';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface MarketOverviewProps {
  symbols: string[];
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ symbols }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await binanceAPI.getMultipleMarketData(symbols);
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [symbols]);

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const sortedData = marketData.sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent));

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-8 h-8 border-4 border-bull border-t-transparent rounded-full animate-spin" />
          <span className="text-lg">Loading market overview...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bull/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-bull" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Gainers</div>
              <div className="text-xl font-bold text-bull">
                {marketData.filter(d => d.priceChangePercent > 0).length}
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
              <div className="text-sm text-muted-foreground">Losers</div>
              <div className="text-xl font-bold text-bear">
                {marketData.filter(d => d.priceChangePercent < 0).length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Pairs</div>
              <div className="text-xl font-bold text-foreground">
                {marketData.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Movers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-bull" />
          <span>Top Movers (24h)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.slice(0, 12).map((data) => (
            <Card key={data.symbol} className="p-4 hover:bg-card/80 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-foreground">
                  {data.symbol.replace('USDT', '/USDT')}
                </div>
                <Badge
                  variant={data.priceChangePercent >= 0 ? 'default' : 'destructive'}
                  className={data.priceChangePercent >= 0 ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'}
                >
                  {data.priceChangePercent >= 0 ? '+' : ''}{data.priceChangePercent.toFixed(2)}%
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className={`font-medium ${data.priceChangePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                    ${data.price.toFixed(data.price > 1 ? 2 : 6)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Change:</span>
                  <span className={`font-medium ${data.priceChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {data.priceChange >= 0 ? '+' : ''}${data.priceChange.toFixed(data.price > 1 ? 2 : 6)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Volume:</span>
                  <span className="font-medium text-foreground">
                    {formatNumber(data.volume)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Range:</span>
                  <span className="text-sm text-muted-foreground">
                    ${data.lowPrice.toFixed(data.lowPrice > 1 ? 2 : 6)} - ${data.highPrice.toFixed(data.highPrice > 1 ? 2 : 6)}
                  </span>
                </div>
              </div>

              {/* Price change indicator */}
              <div className="mt-3 flex items-center space-x-1">
                {data.priceChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-bull" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-bear" />
                )}
                <div className="h-2 bg-muted rounded-full flex-1">
                  <div
                    className={`h-full rounded-full ${data.priceChangePercent >= 0 ? 'bg-bull' : 'bg-bear'}`}
                    style={{ 
                      width: `${Math.min(Math.abs(data.priceChangePercent) * 2, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
