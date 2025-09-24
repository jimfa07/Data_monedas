export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

export function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toLocaleString();
}

export function calculatePriceChange(current: number, previous: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = current - previous;
  const percentage = previous !== 0 ? (absolute / previous) * 100 : 0;
  
  return { absolute, percentage };
}

export function getSignalColor(type: 'BUY' | 'SELL'): string {
  return type === 'BUY' ? 'hsl(var(--bull))' : 'hsl(var(--bear))';
}

export function getStrengthColor(strength: 'WEAK' | 'MODERATE' | 'STRONG'): string {
  switch (strength) {
    case 'STRONG':
      return 'hsl(var(--bull))';
    case 'MODERATE':
      return 'hsl(var(--primary))';
    case 'WEAK':
      return 'hsl(var(--muted-foreground))';
  }
}
