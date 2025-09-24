import React from 'react';
import { Timeframe } from '../types/trading';
import { Button } from './ui/button';
import { Clock } from 'lucide-react';

interface TimeframeSelectorProps {
  selected: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: { value: Timeframe; label: string; description: string }[] = [
  { value: '1s', label: '1S', description: '1 Second' },
  { value: '15m', label: '15M', description: '15 Minutes' },
  { value: '30m', label: '30M', description: '30 Minutes' },
  { value: '1h', label: '1H', description: '1 Hour' },
  { value: '4h', label: '4H', description: '4 Hours' },
  { value: '1d', label: '1D', description: '1 Day' },
];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-bull" />
        <span className="font-medium">Timeframe</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf.value}
            variant={selected === tf.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(tf.value)}
            className={`transition-all ${
              selected === tf.value
                ? 'bg-bull hover:bg-bull/90 text-black font-semibold'
                : 'hover:bg-muted/80'
            }`}
            title={tf.description}
          >
            {tf.label}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Selected: {TIMEFRAMES.find(tf => tf.value === selected)?.description}
      </div>
    </div>
  );
};
