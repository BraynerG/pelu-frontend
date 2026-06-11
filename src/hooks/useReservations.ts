import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'MODIFIED';
  notes: string | null;
  serviceId: string;
  variantId?: string | null;
}

async function fetchReservations(token: string | null): Promise<Reservation[]> {
  if (!token) return [];
  const response = await fetch(`${API_URL}/reservations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Error al cargar reservas');
  return result.data;
}

async function patchReservationStatus(
  token: string | null,
  id: string,
  status: 'CONFIRMED' | 'CANCELLED'
): Promise<void> {
  const response = await fetch(`${API_URL}/reservations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Error al actualizar');
}

async function patchReschedule(
  token: string | null,
  id: string,
  dateToUse: string
): Promise<void> {
  const response = await fetch(`${API_URL}/reservations/${id}/reschedule`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ date: dateToUse }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Error al reagendar');
}

export function useReservations() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Filters and search (UI-only state)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'MODIFIED' | 'CANCELLED'>('ALL');

  // Rescheduling state (UI-only state)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [selectedRescheduleDay, setSelectedRescheduleDay] = useState<string>('');
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>('');

  // TanStack Query for reservations data
  const {
    data: reservations = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: queryKeys.reservations.list(),
    queryFn: () => fetchReservations(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // 2 minutes for reservation data
  });

  const error = queryError?.message ?? null;

  // Mutation: update status with optimistic update
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'CANCELLED' }) =>
      patchReservationStatus(token, id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reservations.list() });
      const previous = queryClient.getQueryData<Reservation[]>(queryKeys.reservations.list());
      queryClient.setQueryData<Reservation[]>(queryKeys.reservations.list(), (old) =>
        old?.map((r) => (r.id === id ? { ...r, status } : r)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.reservations.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.list() });
    },
  });

  // Mutation: reschedule with optimistic update
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, dateToUse }: { id: string; dateToUse: string }) =>
      patchReschedule(token, id, dateToUse),
    onMutate: async ({ id, dateToUse }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reservations.list() });
      const previous = queryClient.getQueryData<Reservation[]>(queryKeys.reservations.list());
      queryClient.setQueryData<Reservation[]>(queryKeys.reservations.list(), (old) =>
        old?.map((r) => (r.id === id ? { ...r, date: dateToUse, status: 'MODIFIED' as const } : r)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.reservations.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.occupiedSlots.list() });
    },
  });

  const updateStatus = useCallback(
    (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
      statusMutation.mutate({ id, status });
    },
    [statusMutation]
  );

  const handleReschedule = useCallback(
    (id: string, dateToUse: string) => {
      rescheduleMutation.mutate(
        { id, dateToUse },
        {
          onSuccess: () => {
            setReschedulingId(null);
            setSelectedRescheduleDay('');
            setSelectedRescheduleTime('');
          },
        }
      );
    },
    [rescheduleMutation]
  );

  const openRescheduleModal = useCallback((res: Reservation) => {
    setReschedulingId(res.id);
    const d = new Date(res.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedRescheduleDay(`${year}-${month}-${day}`);

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setSelectedRescheduleTime(`${hours}:${minutes}`);
  }, []);

  const closeRescheduleModal = useCallback(() => {
    setReschedulingId(null);
    setSelectedRescheduleDay('');
    setSelectedRescheduleTime('');
  }, []);

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      if (statusFilter === 'ALL') {
        if (res.status === 'CANCELLED') return false;
      } else if (res.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameMatch = res.customerName.toLowerCase().includes(query);
        const phoneMatch = res.customerPhone.toLowerCase().includes(query);
        return nameMatch || phoneMatch;
      }
      return true;
    });
  }, [reservations, statusFilter, searchQuery]);

  return {
    reservations,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    reschedulingId,
    selectedRescheduleDay,
    setSelectedRescheduleDay,
    selectedRescheduleTime,
    setSelectedRescheduleTime,
    fetchReservations: refetchReservations,
    updateStatus,
    handleReschedule,
    openRescheduleModal,
    closeRescheduleModal,
    filteredReservations,
  };
}
