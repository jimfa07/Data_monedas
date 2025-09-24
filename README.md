# 📊 Cryptocurrency Trading Dashboard

Una plataforma de trading de criptomonedas con gráficos en tiempo real, análisis técnico y estrategia LUPOWN.

## 🚀 Características

- **Datos en Tiempo Real**: Precios actualizados de Bitcoin ($113,960), Ethereum ($4,191), Solana ($210) y más
- **Gráficos Candlestick**: Visualización profesional tipo TradingView con múltiples marcos temporales  
- **Análisis Técnico**: Indicadores EMA, RSI, MACD para estrategia LUPOWN
- **Dashboard Dinámico**: Top movers, gainers/losers, resumen del mercado
- **Diseño Responsivo**: Tema oscuro profesional estilo TradingView

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript  
- **Gráficos**: Recharts para visualización de candlesticks
- **API Data**: Fallback a datos mock realistas cuando Binance está bloqueado
- **Routing**: Wouter para navegación del cliente

## 📱 Uso en Lovable.dev

### Configuración de Deploy:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`  
3. **Port**: Se asigna automáticamente (usa `process.env.PORT`)
4. **Node Version**: 20.x

### Variables de Entorno:
- No se requieren API keys adicionales
- El sistema usa datos mock realistas como fallback

## 🏃‍♂️ Ejecución Local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📊 APIs Disponibles

- `GET /api/trading-pairs` - Lista de pares de trading disponibles
- `GET /api/market-data/:symbol` - Datos de mercado para símbolo específico  
- `GET /api/chart-data/:symbol/:timeframe` - Datos OHLC para gráficos
- `GET /api/dashboard-summary` - Resumen del mercado con top movers
- `GET /api/signals` - Señales de trading LUPOWN
- `GET /api/indicators/:symbol/:timeframe` - Indicadores técnicos

## 🎯 Próximas Funcionalidades

- Integración con CoinGecko API para precios en tiempo real
- Alertas automáticas de señales LUPOWN
- Portfolio tracking y gestión de posiciones
- Backtesting de estrategias

---

*Desarrollado con precios de mercado actualizados al 24 de septiembre de 2025*