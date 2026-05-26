import { QueryClient } from '@tanstack/react-query';

/**
 * Single client for the app lifetime — avoids losing cache when a parent re-renders
 * and prevents duplicate default option instances.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
