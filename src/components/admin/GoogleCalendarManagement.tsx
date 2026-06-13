import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  Calendar,
  Unlink
} from 'lucide-react';
import { toast } from 'sonner';

export function GoogleCalendarManagement() {
  const {
    status,
    loading,
    error,
    connect,
    disconnect,
    isDisconnecting
  } = useGoogleCalendar();

  const handleDisconnect = () => {
    toast.info('Desvinculando cuenta...', {
      action: {
        label: 'Confirmar',
        onClick: () => {
          disconnect();
        }
      },
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#7A6241]" />
        <p className="text-sm text-muted-foreground font-light tracking-widest uppercase">
          Cargando configuración de Calendario...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50/50 p-6 text-center space-y-4 rounded-none">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-red-800 uppercase tracking-wider text-sm">Error de Conexión</h3>
        <p className="text-xs text-red-700 font-light max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      {/* Columna de Gestión / Estado */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border border-border rounded-none shadow-none bg-[#FAF9F5]">
          <CardHeader className="border-b border-[#ECE7DC] pb-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Google Calendar Sincronización
                </CardTitle>
                <CardDescription className="text-xs font-light text-muted-foreground mt-1">
                  Mantén tu agenda de reservas organizada automáticamente.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  status?.connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {status?.connected ? 'Sincronizado' : 'Sin Sincronizar'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!status?.connected ? (
              <div className="space-y-6">
                <div className="space-y-2 text-xs font-light text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground text-sm">¿Cómo funciona la sincronización?</p>
                  <p>
                    Al vincular tu cuenta de Google Calendar, cada vez que marques una reserva como <strong>Confirmada</strong>, se creará un evento en tu calendario de forma automática.
                  </p>
                  <p>
                    Si la reserva es reprogramada o cancelada, el evento correspondiente se actualizará o eliminará de tu calendario de forma automática para evitar solapamientos.
                  </p>
                  <p className="bg-[#ECE7DC]/40 p-3 text-[#7A6241] border-l-2 border-[#7A6241] font-normal">
                    La vinculación se hace mediante el flujo seguro de Google. No guardamos tus contraseñas y puedes revocar el acceso en cualquier momento.
                  </p>
                </div>

                <div className="flex pt-2">
                  <Button 
                    onClick={connect}
                    className="bg-[#7A6241] hover:bg-[#634F33] text-white rounded-none font-light uppercase tracking-wider text-xs px-6 py-3 h-auto"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Vincular Cuenta de Google
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 border border-green-200 bg-green-50/50 text-green-900 rounded-none">
                  <CheckCircle2 className="h-10 w-10 shrink-0 text-green-600" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider">Sincronización Activa</h4>
                    <p className="text-xs font-light text-green-800 leading-relaxed">
                      La agenda está vinculada con Google Calendar. Los recordatorios de reservas confirmadas se añadirán automáticamente.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-border bg-white text-xs space-y-3 font-light">
                  <div className="flex justify-between items-center border-b border-muted pb-2">
                    <span className="text-muted-foreground">Cuenta Conectada:</span>
                    <span className="font-mono font-medium text-foreground">
                      {status.email || 'Cuenta de Google'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-muted pb-2">
                    <span className="text-muted-foreground">Calendario Destino:</span>
                    <span className="font-semibold text-[#7A6241]">
                      Principal (Primary)
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-muted-foreground">Método de Enlace:</span>
                    <span className="font-bold text-[#7A6241] uppercase text-[10px] tracking-widest">
                      {status.provider || 'Google OAuth2'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none font-light text-xs tracking-wider uppercase h-auto px-4 py-2"
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                        Desvinculando...
                      </>
                    ) : (
                      <>
                        <Unlink className="h-3.5 w-3.5 mr-2" />
                        Desvincular Cuenta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Columna de Ayuda / FAQ */}
      <div className="space-y-6">
        <Card className="border border-border rounded-none shadow-none bg-[#FAF9F5]">
          <CardHeader className="border-b border-[#ECE7DC] pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
              Preguntas Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-xs font-light text-muted-foreground space-y-4 leading-relaxed">
            <div className="space-y-1">
              <h4 className="font-bold text-foreground">¿Qué eventos se sincronizan?</h4>
              <p>Solo se sincronizan las citas que están en estado **Confirmado**. Las reservas en estado Pendiente, Cancelado o Modificado no aparecen en Google Calendar.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground">¿Puedo usar mi cuenta personal?</h4>
              <p>Sí. Puedes sincronizar cualquier cuenta de Google (personal o corporativa) que utilices para gestionar tu agenda de la peluquería.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground">¿Cómo desconectar la cuenta?</h4>
              <p>Haz clic en "Desvincular Cuenta" en este panel. Esto eliminará todos los tokens de acceso guardados del servidor de forma inmediata.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
