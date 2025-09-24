import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tradingPairs = pgTable("trading_pairs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(),
  baseAsset: text("base_asset").notNull(),
  quoteAsset: text("quote_asset").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingSignals = pgTable("trading_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'BUY' | 'SELL'
  strength: text("strength").notNull(), // 'WEAK' | 'MODERATE' | 'STRONG'
  price: real("price").notNull(),
  timeframe: text("timeframe").notNull(),
  indicators: text("indicators").array().notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const marketData = pgTable("market_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  price: real("price").notNull(),
  priceChange: real("price_change").notNull(),
  priceChangePercent: real("price_change_percent").notNull(),
  highPrice: real("high_price").notNull(),
  lowPrice: real("low_price").notNull(),
  volume: real("volume").notNull(),
  quoteVolume: real("quote_volume").notNull(),
  openPrice: real("open_price").notNull(),
  prevClosePrice: real("prev_close_price").notNull(),
  count: integer("count").notNull(),
  lastUpdateId: integer("last_update_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const chartData = pgTable("chart_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(),
  time: integer("time").notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: real("volume").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs).omit({
  id: true,
  createdAt: true,
});

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  timestamp: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

export const insertChartDataSchema = createInsertSchema(chartData).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TradingPair = typeof tradingPairs.$inferSelect;
export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type ChartData = typeof chartData.$inferSelect;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;

// Trading types
export type Timeframe = '1s' | '15m' | '30m' | '1h' | '4h' | '1d';
export type SignalType = 'BUY' | 'SELL';
export type SignalStrength = 'WEAK' | 'MODERATE' | 'STRONG';

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
