import { useQuery } from '@tanstack/react-query';
import { getServices, getLookbookSlides, getOccupiedSlots } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

/** Cached services query — stale-while-revalidate by default */
export function useServicesQuery() {
  return useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: getServices,
  });
}

/** Cached lookbook slides query */
export function useLookbookQuery() {
  return useQuery({
    queryKey: queryKeys.lookbook.list(),
    queryFn: getLookbookSlides,
  });
}

/** Occupied slots — short staleTime since availability changes fast */
export function useOccupiedSlotsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.occupiedSlots.list(),
    queryFn: getOccupiedSlots,
    enabled,
    staleTime: 1000 * 30, // 30 seconds for availability data
  });
}
