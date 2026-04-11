import {QueryClient} from '@tanstack/react-query';

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 30,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});
