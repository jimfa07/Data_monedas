export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: Date;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  ema10: number;
  ema55: number;
  ema100: number;
  ema200: number;
  vwap: number;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  timestamp: Date;
  price: number;
  indicators: string[];
  timeframe: string;
}

export type Timeframe = '1s' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface MarketData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openPrice: number;
  prevClosePrice: number;
  lastUpdateId: number;
  count: number;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
