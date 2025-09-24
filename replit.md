# Overview

This is a professional cryptocurrency trading dashboard application that implements a TradingView-inspired multi-indicator strategy. The system provides real-time market data visualization, technical analysis, and trading signal generation for multiple cryptocurrency pairs from Binance. It features a modern dark-themed interface optimized for trading environments with comprehensive technical indicators including EMAs, RSI, MACD, and Bollinger Bands.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom trading-themed design system featuring bull/bear color schemes
- **State Management**: TanStack Query for server state management with automatic caching and real-time updates
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Data**: WebSocket connections to Binance API for live market data streaming
- **Technical Analysis**: Custom implementation of trading indicators (EMA, RSI, MACD, Bollinger Bands)
- **Signal Generation**: Multi-indicator strategy based on TradingView Pine Script logic

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon for production scalability
- **ORM**: Drizzle with migrations for schema management
- **Schema Design**: Normalized tables for trading pairs, market data, chart data, and trading signals
- **In-Memory Cache**: Memory storage layer for development with fallback to mock data
- **Real-time Updates**: WebSocket streaming with automatic data persistence

## Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **API Security**: Environment-based configuration with read-only Binance API credentials
- **CORS**: Configured for cross-origin requests in development environment

## Performance Optimizations
- **Query Caching**: TanStack Query with configurable stale times and refetch intervals
- **WebSocket Management**: Automatic reconnection with exponential backoff
- **Data Compression**: Efficient storage of OHLCV data with timestamp indexing
- **Chart Rendering**: Optimized visualization for 50+ candlestick data points

# External Dependencies

## Trading Data Provider
- **Binance API**: Primary source for cryptocurrency market data and real-time price feeds
- **Fallback System**: Mock data generation when Binance API is unavailable (common in Replit environments)
- **Rate Limiting**: Implemented to respect Binance API limits with appropriate intervals

## Database Services
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tools
- **Connection Management**: Environment-based connection strings with error handling

## UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: SVG icon library optimized for React applications
- **Embla Carousel**: Touch-friendly carousel component for mobile responsiveness

## Development Tools
- **Replit Integration**: Custom plugins for development environment optimization
- **Error Handling**: Runtime error overlay and development banner for debugging
- **Hot Reload**: Vite HMR with WebSocket server integration