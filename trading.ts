export type Timeframe = '1s' | '15m' | '30m' | '1h' | '4h' | '1d';
export type SignalType = 'BUY' | 'SELL';
export type SignalStrength = 'WEAK' | 'MODERATE' | 'STRONG';

export interface TradingPair {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  isActive: boolean;
  createdAt: Date;
}

export interface MarketData {
  id: string;
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
  timestamp: Date;
}

export interface ChartData {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  type: SignalType;
  strength: SignalStrength;
  price: number;
  timeframe: Timeframe;
  indicators: string[];
  timestamp: Date;
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

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DashboardSummary {
  signals: {
    total: number;
    buy: number;
    sell: number;
    recent: TradingSignal[];
  };
  market: {
    totalPairs: number;
    gainers: number;
    losers: number;
    topMovers: MarketData[];
  };
}
