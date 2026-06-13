import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';
import type { GoogleCalendarStatus } from '@/types';
import { toast } from 'sonner';

export function useGoogleCalendar() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['google-calendar', 'status'];

  const { data: status, isLoading, error } = useQuery<GoogleCalendarStatus>({
    queryKey,
    queryFn: async () => {
      if (!token) throw new Error('No autorizado');
      const response = await fetch(`${API_URL}/google-calendar/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error al obtener estado de Google Calendar');
      return result.data;
    },
    enabled: !!token,
    refetchInterval: 60000, // Refrescar cada minuto
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('No autorizado');
      const response = await fetch(`${API_URL}/google-calendar/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error al desvincular Google Calendar');
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Cuenta desvinculada exitosamente.');
      } else {
        toast.error(data.message || 'Error al desvincular.');
      }
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const connect = async () => {
    if (!token) {
      toast.error('No estás autenticado.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/google-calendar/auth-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No se pudo obtener la URL de autorización');
      }

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        result.url,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        toast.error('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para sincronizar tu cuenta.');
        return;
      }

      // Escuchar mensajes del popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_CALENDAR_SYNC') {
          if (event.data.status === 'success') {
            toast.success('¡Google Calendar sincronizado correctamente!');
            queryClient.invalidateQueries({ queryKey });
          } else {
            toast.error(`Error al sincronizar: ${event.data.message || 'Error desconocido'}`);
          }
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Limpieza por si cierran el popup a mano sin completar
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          queryClient.invalidateQueries({ queryKey });
        }
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar conexión con Google Calendar');
    }
  };

  return {
    status,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    connect,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
  };
}
