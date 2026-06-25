import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '@/lib/queryClient';
import { getSchedules, updateBusinessHours, createTimeOff, deleteTimeOff } from '@/services/api';
import type { BusinessSchedule } from '@/types';

export function useSchedulesQuery() {
  return useQuery({
    queryKey: queryKeys.schedules.config(),
    queryFn: getSchedules,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSchedulesMutations() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const businessHoursMutation = useMutation({
    mutationFn: (schedules: Omit<BusinessSchedule, 'id'>[]) => updateBusinessHours(token!, schedules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.config() });
    },
  });

  const createTimeOffMutation = useMutation({
    mutationFn: (data: { startDate: string; endDate: string; reason?: string }) => createTimeOff(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.config() });
    },
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: (id: string) => deleteTimeOff(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.config() });
    },
  });

  return {
    updateBusinessHours: businessHoursMutation.mutateAsync,
    createTimeOff: createTimeOffMutation.mutateAsync,
    deleteTimeOff: deleteTimeOffMutation.mutateAsync,
    isUpdating: businessHoursMutation.isPending || createTimeOffMutation.isPending || deleteTimeOffMutation.isPending,
  };
}
