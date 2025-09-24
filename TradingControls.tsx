import { Clock, TrendingUp, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { type Timeframe, type TradingPair } from '@/types/trading';

const TIMEFRAMES: Timeframe[] = ['1s', '15m', '30m', '1h', '4h', '1d'];

interface TradingControlsProps {
  selectedSymbol: string;
  selectedTimeframe: Timeframe;
  activeSignalsCount: number;
  tradingPairs: TradingPair[];
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

export function TradingControls({
  selectedSymbol,
  selectedTimeframe,
  activeSignalsCount,
  tradingPairs,
  onSymbolChange,
  onTimeframeChange
}: TradingControlsProps) {
  const selectedPair = tradingPairs.find(pair => pair.symbol === selectedSymbol);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="trading-controls">
      {/* Symbol Selector */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-bull" />
            <span className="font-medium">Trading Pair</span>
          </div>
          
          <Select value={selectedSymbol} onValueChange={onSymbolChange}>
            <SelectTrigger 
              className="w-full" 
              data-testid="symbol-selector"
            >
              <SelectValue>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                    {selectedPair?.baseAsset || 'BTC'}
                  </span>
                  <span>{selectedSymbol}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tradingPairs.map((pair) => (
                <SelectItem key={pair.symbol} value={pair.symbol} data-testid={`symbol-option-${pair.symbol}`}>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                      {pair.baseAsset}
                    </span>
                    <span>{pair.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-xs text-muted-foreground">
            {tradingPairs.length} pairs available
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-bull" />
            <span className="font-medium">Timeframe</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {TIMEFRAMES.map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeframeChange(timeframe)}
                className={`text-xs ${
                  selectedTimeframe === timeframe 
                    ? 'bg-bull text-black hover:bg-bull/90' 
                    : 'hover:bg-muted/20'
                }`}
                data-testid={`timeframe-${timeframe}`}
              >
                {timeframe.toUpperCase()}
              </Button>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Selected: {selectedTimeframe.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Active Signals */}
      <div className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-bull" />
          <span className="font-medium">Active Signals</span>
        </div>
        <span 
          className="px-3 py-1 bg-bull/20 text-bull rounded-full text-sm font-medium"
          data-testid="active-signals-count"
        >
          {activeSignalsCount}
        </span>
      </div>
    </div>
  );
}
