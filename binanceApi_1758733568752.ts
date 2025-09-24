import axios from 'axios';
import { MarketData, ChartData, Timeframe } from '../types/trading';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Binance API credentials (read-only)
const API_KEY = 'cjFYi9Fo614HVGz2NnbKcWto3darHBWd6AeZPWDH0TZqt1gBcatnXNLoTyhyXUY4';
const API_SECRET = 'eSm2VvqKngEONEoXaKmaScDr4dOn9YIuAbzoJhGMYPuIvstKjdnQ1yLTONlgOGYC';

class BinanceAPI {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = API_KEY;
    this.apiSecret = API_SECRET;
  }

  // Convert timeframe to Binance format
  private formatTimeframe(timeframe: Timeframe): string {
    const mapping: { [key in Timeframe]: string } = {
      '1s': '1s',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d'
    };
    return mapping[timeframe];
  }

  // Get market data for a symbol
  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      
      return {
        symbol: response.data.symbol,
        price: parseFloat(response.data.lastPrice),
        priceChange: parseFloat(response.data.priceChange),
        priceChangePercent: parseFloat(response.data.priceChangePercent),
        highPrice: parseFloat(response.data.highPrice),
        lowPrice: parseFloat(response.data.lowPrice),
        volume: parseFloat(response.data.volume),
        quoteVolume: parseFloat(response.data.quoteVolume),
        openPrice: parseFloat(response.data.openPrice),
        prevClosePrice: parseFloat(response.data.prevClosePrice),
        lastUpdateId: response.data.lastUpdateId,
        count: response.data.count
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Get historical candle data
  async getCandleData(symbol: string, timeframe: Timeframe, limit: number = 500): Promise<ChartData[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: this.formatTimeframe(timeframe),
          limit
        }
      });

      return response.data.map((candle: any[]) => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
    } catch (error) {
      console.error('Error fetching candle data:', error);
      throw error;
    }
  }

  // Get multiple symbols price data
  async getMultipleMarketData(symbols: string[]): Promise<MarketData[]> {
    try {
      const symbolsParam = symbols.map(s => `"${s.toUpperCase()}"`).join(',');
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`, {
        params: { symbols: `[${symbolsParam}]` }
      });

      return response.data.map((data: any) => ({
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        quoteVolume: parseFloat(data.quoteVolume),
        openPrice: parseFloat(data.openPrice),
        prevClosePrice: parseFloat(data.prevClosePrice),
        lastUpdateId: data.lastUpdateId,
        count: data.count
      }));
    } catch (error) {
      console.error('Error fetching multiple market data:', error);
      throw error;
    }
  }

  // Get real-time price for a symbol
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }
}

export const binanceAPI = new BinanceAPI();
