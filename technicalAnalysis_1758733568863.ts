import { ChartData, TechnicalIndicators, TradingSignal } from '../types/trading';

export class TechnicalAnalysis {
  // Calculate Simple Moving Average
  static sma(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  // Calculate Exponential Moving Average
  static ema(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0];
    result.push(ema);

    for (let i = 1; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
    return result;
  }

  // Calculate RSI
  static rsi(data: number[], period: number = 14): number[] {
    const changes = data.slice(1).map((price, i) => price - data[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    const result: number[] = [];
    
    for (let i = period; i < data.length; i++) {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push(rsi);

      // Update averages
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    }
    
    return result;
  }

  // Calculate VWAP
  static vwap(data: ChartData[]): number[] {
    const result: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;

    for (const candle of data) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumulativeVolumePrice += typicalPrice * candle.volume;
      cumulativeVolume += candle.volume;
      result.push(cumulativeVolumePrice / cumulativeVolume);
    }

    return result;
  }

  // Calculate Bollinger Bands
  static bollingerBands(data: number[], period: number = 20, multiplier: number = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const middle = this.sma(data, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      upper.push(middle[i - period + 1] + multiplier * stdDev);
      lower.push(middle[i - period + 1] - multiplier * stdDev);
    }

    return { upper, middle, lower };
  }

  // Calculate MACD
  static macd(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const fastEMA = this.ema(data, fastPeriod);
    const slowEMA = this.ema(data, slowPeriod);
    
    const macdLine: number[] = [];
    const startIndex = slowPeriod - 1;

    for (let i = startIndex; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }

    const signal = this.ema(macdLine, signalPeriod);
    const histogram: number[] = [];

    for (let i = 0; i < signal.length; i++) {
      histogram.push(macdLine[i + signalPeriod - 1] - signal[i]);
    }

    return { macd: macdLine, signal, histogram };
  }

  // Heikin Ashi calculation
  static heikinAshi(data: ChartData[]): ChartData[] {
    const result: ChartData[] = [];
    let prevHA = { open: data[0].open, close: data[0].close };

    for (const candle of data) {
      const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
      const haOpen = (prevHA.open + prevHA.close) / 2;
      const haHigh = Math.max(candle.high, haOpen, haClose);
      const haLow = Math.min(candle.low, haOpen, haClose);

      result.push({
        time: candle.time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        volume: candle.volume
      });

      prevHA = { open: haOpen, close: haClose };
    }

    return result;
  }

  // Generate trading signals based on multiple indicators
  static generateSignals(data: ChartData[], symbol: string, timeframe: string): TradingSignal[] {
    if (data.length < 200) return [];

    const closes = data.map(d => d.close);
    const signals: TradingSignal[] = [];

    // Calculate indicators
    const ema10 = this.ema(closes, 10);
    const ema55 = this.ema(closes, 55);
    const ema100 = this.ema(closes, 100);
    const ema200 = this.ema(closes, 200);
    const rsi = this.rsi(closes);
    const macd = this.macd(closes);
    const heikinData = this.heikinAshi(data);

    // Check for signals on recent data
    const recentIndex = closes.length - 1;
    const prevIndex = closes.length - 2;

    if (recentIndex >= 200) {
      const currentEMA10 = ema10[recentIndex - 10 + 1];
      const currentEMA55 = ema55[recentIndex - 55 + 1];
      const currentEMA100 = ema100[recentIndex - 100 + 1];
      const currentEMA200 = ema200[recentIndex - 200 + 1];
      
      const prevEMA10 = ema10[prevIndex - 10 + 1];
      const prevEMA55 = ema55[prevIndex - 55 + 1];

      // EMA crossover signals
      if (prevEMA10 <= prevEMA55 && currentEMA10 > currentEMA55) {
        signals.push({
          id: `${symbol}-${Date.now()}-buy`,
          symbol,
          type: 'BUY',
          strength: currentEMA100 > currentEMA200 ? 'STRONG' : 'MODERATE',
          timestamp: new Date(),
          price: closes[recentIndex],
          indicators: ['EMA Crossover', 'Trend Analysis'],
          timeframe
        });
      }

      if (prevEMA10 >= prevEMA55 && currentEMA10 < currentEMA55) {
        signals.push({
          id: `${symbol}-${Date.now()}-sell`,
          symbol,
          type: 'SELL',
          strength: currentEMA100 < currentEMA200 ? 'STRONG' : 'MODERATE',
          timestamp: new Date(),
          price: closes[recentIndex],
          indicators: ['EMA Crossover', 'Trend Analysis'],
          timeframe
        });
      }

      // Heikin Ashi signals
      const currentHA = heikinData[recentIndex];
      const prevHA = heikinData[prevIndex];
      
      if (prevHA.close <= prevHA.open && currentHA.close > currentHA.open) {
        signals.push({
          id: `${symbol}-${Date.now()}-ha-buy`,
          symbol,
          type: 'BUY',
          strength: 'MODERATE',
          timestamp: new Date(),
          price: closes[recentIndex],
          indicators: ['Heikin Ashi'],
          timeframe
        });
      }

      if (prevHA.close >= prevHA.open && currentHA.close < currentHA.open) {
        signals.push({
          id: `${symbol}-${Date.now()}-ha-sell`,
          symbol,
          type: 'SELL',
          strength: 'MODERATE',
          timestamp: new Date(),
          price: closes[recentIndex],
          indicators: ['Heikin Ashi'],
          timeframe
        });
      }
    }

    return signals;
  }

  // Calculate all indicators for display
  static calculateIndicators(data: ChartData[]): TechnicalIndicators | null {
    if (data.length < 200) return null;

    const closes = data.map(d => d.close);
    const ema10 = this.ema(closes, 10);
    const ema55 = this.ema(closes, 55);
    const ema100 = this.ema(closes, 100);
    const ema200 = this.ema(closes, 200);
    const vwap = this.vwap(data);
    const rsi = this.rsi(closes);
    const macd = this.macd(closes);
    const bollinger = this.bollingerBands(closes);

    const lastIndex = closes.length - 1;

    return {
      ema10: ema10[lastIndex - 10 + 1] || 0,
      ema55: ema55[lastIndex - 55 + 1] || 0,
      ema100: ema100[lastIndex - 100 + 1] || 0,
      ema200: ema200[lastIndex - 200 + 1] || 0,
      vwap: vwap[lastIndex] || 0,
      rsi: rsi[rsi.length - 1] || 50,
      macd: {
        value: macd.macd[macd.macd.length - 1] || 0,
        signal: macd.signal[macd.signal.length - 1] || 0,
        histogram: macd.histogram[macd.histogram.length - 1] || 0
      },
      bollinger: {
        upper: bollinger.upper[bollinger.upper.length - 1] || 0,
        middle: bollinger.middle[bollinger.middle.length - 1] || 0,
        lower: bollinger.lower[bollinger.lower.length - 1] || 0
      }
    };
  }
}
