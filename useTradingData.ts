import { useQuery } from '@tanstack/react-query';
import { type Timeframe } from '@/types/trading';

export function useTradingData(symbol: string, timeframe: Timeframe) {
  // Fetch trading pairs
  const { data: tradingPairs } = useQuery({
    queryKey: ['/api/trading-pairs'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch chart data for selected symbol and timeframe
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['/api/chart-data', symbol, timeframe],
    refetchInterval: timeframe === '1s' ? 1000 : timeframe === '15m' ? 15000 : 30000,
  });

  // Fetch technical indicators
  const { data: indicators, isLoading: indicatorsLoading } = useQuery({
    queryKey: ['/api/indicators', symbol, timeframe],
    refetchInterval: timeframe === '1s' ? 2000 : timeframe === '15m' ? 30000 : 60000,
  });

  // Fetch trading signals
  const { data: signals, isLoading: signalsLoading } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch dashboard summary
  const { data: dashboardSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/dashboard-summary'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Initialize data for new symbols
  const { refetch: initializeData } = useQuery({
    queryKey: ['/api/initialize-data', symbol, timeframe],
    enabled: false, // Only run when manually triggered
  });

  const isLoading = chartLoading || indicatorsLoading || signalsLoading || summaryLoading;

  return {
    tradingPairs,
    marketData,
    chartData,
    indicators,
    signals,
    dashboardSummary,
    isLoading,
    initializeData,
  };
}
