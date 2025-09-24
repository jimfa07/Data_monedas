import { 
  type User, 
  type InsertUser, 
  type TradingPair, 
  type InsertTradingPair,
  type TradingSignal,
  type InsertTradingSignal,
  type MarketData,
  type InsertMarketData,
  type ChartData,
  type InsertChartData,
  type Timeframe
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trading Pairs
  getAllTradingPairs(): Promise<TradingPair[]>;
  createTradingPair(pair: InsertTradingPair): Promise<TradingPair>;
  updateTradingPairStatus(symbol: string, isActive: boolean): Promise<void>;

  // Trading Signals
  getAllSignals(): Promise<TradingSignal[]>;
  getSignalsBySymbol(symbol: string): Promise<TradingSignal[]>;
  getRecentSignals(limit: number): Promise<TradingSignal[]>;
  createSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  deleteOldSignals(olderThan: Date): Promise<void>;

  // Market Data
  getAllMarketData(): Promise<MarketData[]>;
  getMarketDataBySymbol(symbol: string): Promise<MarketData | undefined>;
  updateMarketData(data: InsertMarketData): Promise<MarketData>;
  getTopMovers(limit: number): Promise<MarketData[]>;

  // Chart Data
  getChartData(symbol: string, timeframe: Timeframe, limit: number): Promise<ChartData[]>;
  addChartData(data: InsertChartData): Promise<ChartData>;
  deleteOldChartData(symbol: string, timeframe: Timeframe, keepLast: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tradingPairs: Map<string, TradingPair>;
  private tradingSignals: Map<string, TradingSignal>;
  private marketData: Map<string, MarketData>;
  private chartData: Map<string, ChartData>;

  constructor() {
    this.users = new Map();
    this.tradingPairs = new Map();
    this.tradingSignals = new Map();
    this.marketData = new Map();
    this.chartData = new Map();
    
    // Initialize with popular trading pairs
    this.initializeTradingPairs();
  }

  private async initializeTradingPairs(): Promise<void> {
    const popularPairs = [
      { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', isActive: true },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', isActive: true },
      { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', isActive: true },
      { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', isActive: true },
      { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', isActive: true },
      { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', isActive: true },
      { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', isActive: true },
      { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', isActive: true },
      { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', isActive: true },
      { symbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT', isActive: true },
    ];

    for (const pair of popularPairs) {
      await this.createTradingPair(pair);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Trading Pairs
  async getAllTradingPairs(): Promise<TradingPair[]> {
    return Array.from(this.tradingPairs.values()).filter(pair => pair.isActive);
  }

  async createTradingPair(pair: InsertTradingPair): Promise<TradingPair> {
    const id = randomUUID();
    const tradingPair: TradingPair = { 
      ...pair, 
      id, 
      isActive: pair.isActive ?? true,
      createdAt: new Date()
    };
    this.tradingPairs.set(id, tradingPair);
    return tradingPair;
  }

  async updateTradingPairStatus(symbol: string, isActive: boolean): Promise<void> {
    for (const [id, pair] of this.tradingPairs.entries()) {
      if (pair.symbol === symbol) {
        this.tradingPairs.set(id, { ...pair, isActive });
        break;
      }
    }
  }

  // Trading Signals
  async getAllSignals(): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getSignalsBySymbol(symbol: string): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values())
      .filter(signal => signal.symbol === symbol)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getRecentSignals(limit: number): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const id = randomUUID();
    const tradingSignal: TradingSignal = { 
      ...signal, 
      id, 
      timestamp: new Date()
    };
    this.tradingSignals.set(id, tradingSignal);
    return tradingSignal;
  }

  async deleteOldSignals(olderThan: Date): Promise<void> {
    for (const [id, signal] of this.tradingSignals.entries()) {
      if (signal.timestamp && signal.timestamp < olderThan) {
        this.tradingSignals.delete(id);
      }
    }
  }

  // Market Data
  async getAllMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketData.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getMarketDataBySymbol(symbol: string): Promise<MarketData | undefined> {
    return Array.from(this.marketData.values()).find(data => data.symbol === symbol);
  }

  async updateMarketData(data: InsertMarketData): Promise<MarketData> {
    const existing = Array.from(this.marketData.entries()).find(([, d]) => d.symbol === data.symbol);
    
    if (existing) {
      const [id] = existing;
      const updated: MarketData = { 
        ...data, 
        id, 
        timestamp: new Date()
      };
      this.marketData.set(id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newData: MarketData = { 
        ...data, 
        id, 
        timestamp: new Date()
      };
      this.marketData.set(id, newData);
      return newData;
    }
  }

  async getTopMovers(limit: number): Promise<MarketData[]> {
    return Array.from(this.marketData.values())
      .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
      .slice(0, limit);
  }

  // Chart Data
  async getChartData(symbol: string, timeframe: Timeframe, limit: number): Promise<ChartData[]> {
    return Array.from(this.chartData.values())
      .filter(data => data.symbol === symbol && data.timeframe === timeframe)
      .sort((a, b) => b.time - a.time)
      .slice(0, limit)
      .reverse();
  }

  async addChartData(data: InsertChartData): Promise<ChartData> {
    const id = randomUUID();
    const chartDataItem: ChartData = { 
      ...data, 
      id, 
      timestamp: new Date()
    };
    this.chartData.set(id, chartDataItem);
    return chartDataItem;
  }

  async deleteOldChartData(symbol: string, timeframe: Timeframe, keepLast: number): Promise<void> {
    const symbolData = Array.from(this.chartData.entries())
      .filter(([, data]) => data.symbol === symbol && data.timeframe === timeframe)
      .sort(([, a], [, b]) => b.time - a.time);

    const toDelete = symbolData.slice(keepLast);
    for (const [id] of toDelete) {
      this.chartData.delete(id);
    }
  }
}

export const storage = new MemStorage();
