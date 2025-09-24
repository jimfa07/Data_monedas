import WebSocket from 'ws';
import { type CandleData, type Timeframe } from "@shared/schema";
import { storage } from '../storage';
import { TechnicalAnalysis } from './technicalAnalysis';

interface BinanceKlineEvent {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
}

interface BinanceTickerEvent {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // Previous day's close price
  c: string; // Current day's close price
  Q: string; // Close trade's quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 5000; // 5 seconds

  // Subscribe to kline data for a specific symbol and timeframe
  subscribeToKline(symbol: string, timeframe: Timeframe): void {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${this.mapTimeframeToBinanceInterval(timeframe)}`;
    const connectionKey = `kline_${symbol}_${timeframe}`;

    this.createConnection(connectionKey, wsUrl, (data: BinanceKlineEvent) => {
      if (data.k && data.k.x) { // Only process closed klines
        const candleData: CandleData = {
          time: data.k.t,
          open: parseFloat(data.k.o),
          high: parseFloat(data.k.h),
          low: parseFloat(data.k.l),
          close: parseFloat(data.k.c),
          volume: parseFloat(data.k.v),
        };

        // Store the candle data
        storage.addChartData({
          symbol: data.s,
          timeframe,
          time: candleData.time,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: candleData.volume,
        });

        // Generate signals based on updated data
        this.generateAndStoreSignals(symbol, timeframe);
      }
    });
  }

  // Subscribe to ticker data for all symbols
  subscribeToAllTickers(): void {
    const wsUrl = 'wss://stream.binance.com:9443/ws/!ticker@arr';
    const connectionKey = 'all_tickers';

    this.createConnection(connectionKey, wsUrl, (data: BinanceTickerEvent[]) => {
      if (Array.isArray(data)) {
        data.forEach(async (ticker) => {
          await storage.updateMarketData({
            symbol: ticker.s,
            price: parseFloat(ticker.c),
            priceChange: parseFloat(ticker.p),
            priceChangePercent: parseFloat(ticker.P),
            highPrice: parseFloat(ticker.h),
            lowPrice: parseFloat(ticker.l),
            volume: parseFloat(ticker.v),
            quoteVolume: parseFloat(ticker.q),
            openPrice: parseFloat(ticker.o),
            prevClosePrice: parseFloat(ticker.x),
            lastUpdateId: ticker.L,
            count: ticker.n,
          });
        });
      }
    });
  }

  // Subscribe to ticker data for a specific symbol
  subscribeToTicker(symbol: string): void {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;
    const connectionKey = `ticker_${symbol}`;

    this.createConnection(connectionKey, wsUrl, async (data: BinanceTickerEvent) => {
      await storage.updateMarketData({
        symbol: data.s,
        price: parseFloat(data.c),
        priceChange: parseFloat(data.p),
        priceChangePercent: parseFloat(data.P),
        highPrice: parseFloat(data.h),
        lowPrice: parseFloat(data.l),
        volume: parseFloat(data.v),
        quoteVolume: parseFloat(data.q),
        openPrice: parseFloat(data.o),
        prevClosePrice: parseFloat(data.x),
        lastUpdateId: data.L,
        count: data.n,
      });
    });
  }

  private createConnection<T>(key: string, url: string, onMessage: (data: T) => void): void {
    // Close existing connection if it exists
    const existingWs = this.connections.get(key);
    if (existingWs) {
      existingWs.close();
    }

    const ws = new WebSocket(url);

    ws.on('open', () => {
      console.log(`WebSocket connected: ${key}`);
      this.reconnectAttempts.set(key, 0);
    });

    ws.on('message', (data: Buffer) => {
      try {
        const parsed = JSON.parse(data.toString()) as T;
        onMessage(parsed);
      } catch (error) {
        console.error(`Error parsing WebSocket message for ${key}:`, error);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${key}:`, error);
    });

    ws.on('close', () => {
      console.log(`WebSocket closed: ${key}`);
      this.connections.delete(key);
      this.attemptReconnect(key, url, onMessage);
    });

    this.connections.set(key, ws);
  }

  private attemptReconnect<T>(key: string, url: string, onMessage: (data: T) => void): void {
    const attempts = this.reconnectAttempts.get(key) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(key, attempts + 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect ${key} (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
        this.createConnection(key, url, onMessage);
      }, this.reconnectDelay * Math.pow(2, attempts)); // Exponential backoff
    } else {
      console.error(`Max reconnect attempts reached for ${key}`);
    }
  }

  private async generateAndStoreSignals(symbol: string, timeframe: Timeframe): Promise<void> {
    try {
      const chartData = await storage.getChartData(symbol, timeframe, 500);
      if (chartData.length >= 200) {
        const candleData: CandleData[] = chartData.map(data => ({
          time: data.time,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
        }));

        const signals = TechnicalAnalysis.generateSignals(candleData, symbol, timeframe);
        
        // Store new signals
        for (const signal of signals) {
          await storage.createSignal(signal);
        }

        // Clean up old signals (keep only last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await storage.deleteOldSignals(oneDayAgo);
      }
    } catch (error) {
      console.error(`Error generating signals for ${symbol}:`, error);
    }
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

  // Cleanup method to close all connections
  cleanup(): void {
    this.connections.forEach((ws, key) => {
      console.log(`Closing WebSocket connection: ${key}`);
      ws.close();
    });
    this.connections.clear();
    this.reconnectAttempts.clear();
  }
}

export const wsManager = new WebSocketManager();
