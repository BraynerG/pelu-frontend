import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes — data is "fresh" for this window
      gcTime: 1000 * 60 * 30,   // 30 minutes garbage collection
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});

// Centralized query key factory for type-safe invalidation
export const queryKeys = {
  services: {
    all: ['services'] as const,
    list: () => [...queryKeys.services.all, 'list'] as const,
  },
  lookbook: {
    all: ['lookbook'] as const,
    list: () => [...queryKeys.lookbook.all, 'list'] as const,
  },
  reservations: {
    all: ['reservations'] as const,
    list: () => [...queryKeys.reservations.all, 'list'] as const,
  },
  occupiedSlots: {
    all: ['occupiedSlots'] as const,
    list: () => [...queryKeys.occupiedSlots.all, 'list'] as const,
  },
} as const;
