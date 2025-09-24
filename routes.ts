import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { binanceApi } from "./services/binanceApi";
import { TechnicalAnalysis } from "./services/technicalAnalysis";
import { wsManager } from "./services/websocketManager";
import { type Timeframe, type CandleData } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize WebSocket connections for popular pairs
  const popularPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT'];
  const timeframes: Timeframe[] = ['1s', '15m', '30m', '1h', '4h', '1d'];

  // Subscribe to all tickers
  wsManager.subscribeToAllTickers();

  // Subscribe to kline data for popular pairs
  popularPairs.forEach(symbol => {
    timeframes.forEach(timeframe => {
      wsManager.subscribeToKline(symbol, timeframe);
    });
  });

  // Initialize mock data if Binance is unavailable (after 5 seconds delay)
  setTimeout(async () => {
    try {
      const marketData = await storage.getAllMarketData();
      if (marketData.length === 0) {
        console.log('No market data found, initializing with mock data...');
        await initializeMockData();
      }
    } catch (error) {
      console.error('Error checking market data, initializing with mock data:', error);
      await initializeMockData();
    }
  }, 5000);

  // Get all trading pairs
  app.get("/api/trading-pairs", async (req, res) => {
    try {
      const pairs = await storage.getAllTradingPairs();
      res.json(pairs);
    } catch (error) {
      console.error('Error fetching trading pairs:', error);
      res.status(500).json({ error: 'Failed to fetch trading pairs' });
    }
  });

  // Get market data for all symbols
  app.get("/api/market-data", async (req, res) => {
    try {
      const marketData = await storage.getAllMarketData();
      res.json(marketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // Get market data for a specific symbol
  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const marketData = await storage.getMarketDataBySymbol(symbol);
      
      if (!marketData) {
        return res.status(404).json({ error: 'Market data not found for symbol' });
      }
      
      res.json(marketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // Get top movers
  app.get("/api/top-movers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topMovers = await storage.getTopMovers(limit);
      res.json(topMovers);
    } catch (error) {
      console.error('Error fetching top movers:', error);
      res.status(500).json({ error: 'Failed to fetch top movers' });
    }
  });

  // Get chart data for a symbol and timeframe
  app.get("/api/chart-data/:symbol/:timeframe", async (req, res) => {
    try {
      const { symbol, timeframe } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!['1s', '15m', '30m', '1h', '4h', '1d'].includes(timeframe)) {
        return res.status(400).json({ error: 'Invalid timeframe' });
      }

      const chartData = await storage.getChartData(symbol, timeframe as Timeframe, limit);
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  });

  // Get technical indicators for a symbol and timeframe
  app.get("/api/indicators/:symbol/:timeframe", async (req, res) => {
    try {
      const { symbol, timeframe } = req.params;

      if (!['1s', '15m', '30m', '1h', '4h', '1d'].includes(timeframe)) {
        return res.status(400).json({ error: 'Invalid timeframe' });
      }

      const chartData = await storage.getChartData(symbol, timeframe as Timeframe, 500);
      
      if (chartData.length < 200) {
        return res.status(400).json({ error: 'Insufficient data for technical analysis' });
      }

      const candleData: CandleData[] = chartData.map(data => ({
        time: data.time,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
      }));

      const indicators = TechnicalAnalysis.calculateIndicators(candleData);
      res.json(indicators);
    } catch (error) {
      console.error('Error calculating indicators:', error);
      res.status(500).json({ error: 'Failed to calculate indicators' });
    }
  });

  // Get all trading signals
  app.get("/api/signals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const signals = await storage.getRecentSignals(limit);
      res.json(signals);
    } catch (error) {
      console.error('Error fetching signals:', error);
      res.status(500).json({ error: 'Failed to fetch signals' });
    }
  });

  // Get signals for a specific symbol
  app.get("/api/signals/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const signals = await storage.getSignalsBySymbol(symbol);
      res.json(signals);
    } catch (error) {
      console.error('Error fetching signals:', error);
      res.status(500).json({ error: 'Failed to fetch signals' });
    }
  });

  // Initialize historical data for a symbol
  app.post("/api/initialize-data/:symbol/:timeframe", async (req, res) => {
    try {
      const { symbol, timeframe } = req.params;

      if (!['1s', '15m', '30m', '1h', '4h', '1d'].includes(timeframe)) {
        return res.status(400).json({ error: 'Invalid timeframe' });
      }

      // Fetch historical kline data from Binance
      const klines = await binanceApi.getKlines(symbol, timeframe as Timeframe, 1000);
      
      // Store historical data
      for (const kline of klines) {
        await storage.addChartData({
          symbol,
          timeframe: timeframe as Timeframe,
          time: kline.time,
          open: kline.open,
          high: kline.high,
          low: kline.low,
          close: kline.close,
          volume: kline.volume,
        });
      }

      // Subscribe to real-time data if not already subscribed
      wsManager.subscribeToKline(symbol, timeframe as Timeframe);

      res.json({ success: true, message: `Initialized ${klines.length} candles for ${symbol} ${timeframe}` });
    } catch (error) {
      console.error('Error initializing data:', error);
      res.status(500).json({ error: 'Failed to initialize data' });
    }
  });

  // Initialize all mock data
  app.post("/api/init-mock-data", async (req, res) => {
    try {
      await initializeMockData();
      res.json({ success: true, message: 'Mock data initialized successfully' });
    } catch (error) {
      console.error('Error initializing mock data:', error);
      res.status(500).json({ error: 'Failed to initialize mock data' });
    }
  });

  // Get dashboard summary
  app.get("/api/dashboard-summary", async (req, res) => {
    try {
      const [recentSignals, marketData, topMovers] = await Promise.all([
        storage.getRecentSignals(10),
        storage.getAllMarketData(),
        storage.getTopMovers(6)
      ]);

      const buySignals = recentSignals.filter(s => s.type === 'BUY').length;
      const sellSignals = recentSignals.filter(s => s.type === 'SELL').length;
      const gainers = marketData.filter(m => m.priceChangePercent > 0).length;
      const losers = marketData.filter(m => m.priceChangePercent < 0).length;

      res.json({
        signals: {
          total: recentSignals.length,
          buy: buySignals,
          sell: sellSignals,
          recent: recentSignals.slice(0, 5)
        },
        market: {
          totalPairs: marketData.length,
          gainers,
          losers,
          topMovers
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  });

  const httpServer = createServer(app);

  // Cleanup WebSocket connections on server shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    wsManager.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    wsManager.cleanup();
    process.exit(0);
  });

  return httpServer;
}

// Helper function to initialize mock data when Binance APIs are unavailable
async function initializeMockData() {
  try {
    console.log('Initializing mock data...');
    
    const popularPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT'];
    const timeframes: Timeframe[] = ['15m', '30m', '1h', '4h', '1d'];
    
    // Initialize market data for each pair
    for (const symbol of popularPairs) {
      const ticker = await binanceApi.getTicker(symbol);
      await storage.updateMarketData(ticker);
      
      // Initialize chart data for each timeframe
      for (const timeframe of timeframes) {
        const klines = await binanceApi.getKlines(symbol, timeframe, 100);
        for (const kline of klines) {
          await storage.addChartData(symbol, timeframe, kline);
        }
      }
    }
    
    console.log(`Mock data initialized for ${popularPairs.length} trading pairs`);
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}
