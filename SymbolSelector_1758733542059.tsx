import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Search, TrendingUp, Check } from 'lucide-react';

interface SymbolSelectorProps {
  symbols: string[];
  selected: string;
  onSelect: (symbol: string) => void;
}

export const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  symbols,
  selected,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  const formatSymbol = (symbol: string): string => {
    return symbol.replace('USDT', '/USDT');
  };

  const getBaseAsset = (symbol: string): string => {
    return symbol.replace('USDT', '');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4 h-4 text-bull" />
        <span className="font-medium">Trading Pair</span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between hover:bg-muted/80"
          >
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {getBaseAsset(selected)}
              </Badge>
              <span>{formatSymbol(selected)}</span>
            </div>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search trading pairs..." />
            <CommandList>
              <CommandEmpty>No trading pairs found.</CommandEmpty>
              <CommandGroup>
                {symbols.map((symbol) => (
                  <CommandItem
                    key={symbol}
                    value={symbol}
                    onSelect={() => {
                      onSelect(symbol);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {getBaseAsset(symbol)}
                      </Badge>
                      <span>{formatSymbol(symbol)}</span>
                    </div>
                    {selected === symbol && (
                      <Check className="h-4 w-4 text-bull" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="text-xs text-muted-foreground">
        {symbols.length} pairs available
      </div>
    </div>
  );
};
