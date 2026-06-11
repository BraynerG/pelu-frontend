import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';

export interface WhatsAppStatus {
  authenticated: boolean;
  qrCode?: string;
  status: 'DISCONNECTED' | 'CONNECTING' | 'QR_RECEIVED' | 'AUTHENTICATED' | 'READY' | 'ERROR';
  provider: 'local-webjs' | 'external-api' | 'mock-logger';
  phoneNumber?: string;
}

export function useWhatsApp() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['whatsapp', 'status'];

  const { data: status, isLoading, error } = useQuery<WhatsAppStatus>({
    queryKey,
    queryFn: async () => {
      if (!token) throw new Error('No autorizado');
      const response = await fetch(`${API_URL}/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al obtener estado');
      return result.data;
    },
    enabled: !!token,
    // Refresco dinámico: si está conectando o se generó el QR, consultar cada 3 segundos
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'CONNECTING' || data.status === 'QR_RECEIVED')) {
        return 3000;
      }
      return 20000; // si está listo o inactivo, refrescar cada 20 segundos
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('No autorizado');
      const response = await fetch(`${API_URL}/whatsapp/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al cerrar sesión');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: async ({ to, message }: { to: string; message: string }) => {
      if (!token) throw new Error('No autorizado');
      const response = await fetch(`${API_URL}/whatsapp/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al enviar');
      if (!result.success) throw new Error(result.message || 'Error al enviar');
      return result;
    },
  });

  return {
    status,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    sendTest: sendTestMutation.mutate,
    isSendingTest: sendTestMutation.isPending,
    sendTestSuccess: sendTestMutation.isSuccess,
    sendTestError: sendTestMutation.error ? (sendTestMutation.error as Error).message : null,
    resetSendTest: sendTestMutation.reset,
  };
}
