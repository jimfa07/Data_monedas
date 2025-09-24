import { type MarketData, type CandleData, type Timeframe, type InsertMarketData } from "@shared/schema";
import { randomUUID } from "crypto";

interface BinanceTickerResponse {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BinanceKlineResponse {
  [index: number]: string | number;
  0: number; // Open time
  1: string; // Open price
  2: string; // High price
  3: string; // Low price
  4: string; // Close price
  5: string; // Volume
  6: number; // Close time
  7: string; // Quote asset volume
  8: number; // Number of trades
  9: string; // Taker buy base asset volume
  10: string; // Taker buy quote asset volume
  11: string; // Ignore
}

export class BinanceApi {
  private readonly baseUrl = 'https://api.binance.com/api/v3';
  private readonly wsBaseUrl = 'wss://stream.binance.com:9443/ws';
  private useMockData = true; // Binance blocked in Replit environment

  async getAllTickers(): Promise<InsertMarketData[]> {
    if (this.useMockData) {
      return this.getMockTickers();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`);
      if (!response.ok) {
        console.warn('Binance API unavailable, using mock data');
        this.useMockData = true;
        return this.getMockTickers();
      }

      const tickers: BinanceTickerResponse[] = await response.json();
      
      return tickers.map(ticker => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        priceChange: parseFloat(ticker.priceChange),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        highPrice: parseFloat(ticker.highPrice),
        lowPrice: parseFloat(ticker.lowPrice),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume),
        openPrice: parseFloat(ticker.openPrice),
        prevClosePrice: parseFloat(ticker.prevClosePrice),
        lastUpdateId: ticker.lastId,
        count: ticker.count,
      }));
    } catch (error) {
      console.error('Error fetching tickers from Binance, using mock data:', error);
      this.useMockData = true;
      return this.getMockTickers();
    }
  }

  async getKlines(symbol: string, interval: Timeframe, limit: number = 500): Promise<CandleData[]> {
    if (this.useMockData) {
      return this.getMockKlines(symbol, interval, limit);
    }
    
    try {
      const binanceInterval = this.mapTimeframeToBinanceInterval(interval);
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`
      );
      
      if (!response.ok) {
        console.warn(`Binance API unavailable for klines ${symbol}, using mock data`);
        this.useMockData = true;
        return this.getMockKlines(symbol, interval, limit);
      }

      const klines: BinanceKlineResponse[] = await response.json();
      
      return klines.map(kline => ({
        time: kline[0] as number,
        open: parseFloat(kline[1] as string),
        high: parseFloat(kline[2] as string),
        low: parseFloat(kline[3] as string),
        close: parseFloat(kline[4] as string),
        volume: parseFloat(kline[5] as string),
      }));
    } catch (error) {
      console.error(`Error fetching klines for ${symbol}, using mock data:`, error);
      this.useMockData = true;
      return this.getMockKlines(symbol, interval, limit);
    }
  }

  async getTicker(symbol: string): Promise<InsertMarketData> {
    if (this.useMockData) {
      return this.getMockTicker(symbol);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
      if (!response.ok) {
        console.warn(`Binance API unavailable for ${symbol}, using mock data`);
        this.useMockData = true;
        return this.getMockTicker(symbol);
      }

      const ticker: BinanceTickerResponse = await response.json();
      
      return {
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        priceChange: parseFloat(ticker.priceChange),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        highPrice: parseFloat(ticker.highPrice),
        lowPrice: parseFloat(ticker.lowPrice),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume),
        openPrice: parseFloat(ticker.openPrice),
        prevClosePrice: parseFloat(ticker.prevClosePrice),
        lastUpdateId: ticker.lastId,
        count: ticker.count,
      };
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol}, using mock data:`, error);
      this.useMockData = true;
      return this.getMockTicker(symbol);
    }
  }

  // Mock data methods for when Binance API is unavailable
  private getMockTickers(): InsertMarketData[] {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT'];
    return symbols.map(symbol => this.getMockTicker(symbol));
  }

  private getMockTicker(symbol: string): InsertMarketData {
    const prices: Record<string, number> = {
      'BTCUSDT': 113960.89,  // Updated Sept 24, 2025 - Real Bitcoin price
      'ETHUSDT': 4191.60,    // Updated Sept 24, 2025 - Real Ethereum price
      'SOLUSDT': 210.35,     // Updated Sept 24, 2025 - Real Solana price
      'ADAUSDT': 0.95,       // Estimated current ADA price
      'DOTUSDT': 8.45        // Estimated current DOT price
    };
    
    const basePrice = prices[symbol] || 100.00;
    const change = (Math.random() - 0.5) * 0.1; // ±5% change
    const price = basePrice * (1 + change);
    const priceChange = basePrice * change;
    const priceChangePercent = change * 100;

    return {
      symbol,
      price,
      priceChange,
      priceChangePercent,
      highPrice: price * 1.05,
      lowPrice: price * 0.95,
      volume: Math.random() * 100000,
      quoteVolume: Math.random() * 1000000000,
      openPrice: basePrice,
      prevClosePrice: basePrice,
      lastUpdateId: Math.floor(Math.random() * 1000000),
      count: Math.floor(Math.random() * 10000),
    };
  }

  private getMockKlines(symbol: string, interval: Timeframe, limit: number): CandleData[] {
    const prices: Record<string, number> = {
      'BTCUSDT': 113960.89,  // Updated Sept 24, 2025 - Real Bitcoin price
      'ETHUSDT': 4191.60,    // Updated Sept 24, 2025 - Real Ethereum price
      'SOLUSDT': 210.35,     // Updated Sept 24, 2025 - Real Solana price
      'ADAUSDT': 0.95,       // Estimated current ADA price
      'DOTUSDT': 8.45        // Estimated current DOT price
    };
    
    const basePrice = prices[symbol] || 100.00;
    const klines: CandleData[] = [];
    const intervalMs = this.getIntervalMilliseconds(interval);
    const now = Date.now();

    for (let i = limit - 1; i >= 0; i--) {
      const time = now - (i * intervalMs);
      const randomFactor = 1 + (Math.random() - 0.5) * 0.05; // ±2.5% variation
      const open = basePrice * randomFactor;
      const close = open * (1 + (Math.random() - 0.5) * 0.02); // ±1% from open
      const high = Math.max(open, close) * (1 + Math.random() * 0.01); // Up to 1% higher
      const low = Math.min(open, close) * (1 - Math.random() * 0.01); // Up to 1% lower

      klines.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000,
      });
    }

    return klines;
  }

  private getIntervalMilliseconds(interval: Timeframe): number {
    const intervals: Record<Timeframe, number> = {
      '1s': 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    return intervals[interval];
  }

  private mapTimeframeToBinanceInterval(timeframe: Timeframe): string {
    const mapping: Record<Timeframe, string> = {
      '1s': '1s',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    return mapping[timeframe];
  }

  createWebSocketUrl(symbol: string, interval: Timeframe): string {
    const binanceInterval = this.mapTimeframeToBinanceInterval(interval);
    return `${this.wsBaseUrl}/${symbol.toLowerCase()}@kline_${binanceInterval}`;
  }

  createTickerWebSocketUrl(symbol: string): string {
    return `${this.wsBaseUrl}/${symbol.toLowerCase()}@ticker`;
  }

  createAllTickersWebSocketUrl(): string {
    return `${this.wsBaseUrl}/!ticker@arr`;
  }
}

export const binanceApi = new BinanceApi();
