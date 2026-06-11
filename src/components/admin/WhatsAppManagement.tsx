import { useState, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInput } from '@/components/PhoneInput';
import { 
  CheckCircle2, 
  Loader2, 
  HelpCircle, 
  AlertTriangle,
  RefreshCw,
  LogOut,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export function WhatsAppManagement() {
  const {
    status,
    loading,
    error,
    logout,
    isLoggingOut,
    sendTest,
    isSendingTest,
    sendTestSuccess,
    sendTestError,
    resetSendTest
  } = useWhatsApp();

  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('¡Hola! Este es un mensaje de prueba desde el panel administrativo de tu peluquería.');

  useEffect(() => {
    if (sendTestSuccess) {
      toast.success('Mensaje de prueba enviado exitosamente.');
      resetSendTest();
    }
    if (sendTestError) {
      toast.error(`Error al enviar mensaje: ${sendTestError}`);
      resetSendTest();
    }
  }, [sendTestSuccess, sendTestError, resetSendTest]);

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      toast.error('Por favor, ingresa un número de teléfono.');
      return;
    }
    // Sanitizar número quitando caracteres que no sean números
    const cleanPhone = testPhone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 8) {
      toast.error('Número de teléfono inválido. Debe incluir código de país (ej. 34600000000).');
      return;
    }
    sendTest({ to: cleanPhone, message: testMessage });
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión y desvincular este número de WhatsApp? Se borrarán las credenciales persistidas.')) {
      logout();
      toast.success('Sesión desvinculada. Generando nuevo código QR...');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#7A6241]" />
        <p className="text-sm text-muted-foreground font-light tracking-widest uppercase">
          Cargando configuración de WhatsApp...
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

  const providerNames = {
    'local-webjs': 'WhatsApp Web Nativo (Local/Server)',
    'external-api': 'Pasarela/API Externa (Remote Gateway)',
    'mock-logger': 'Consola/Simulación (Vercel Serverless)',
  };

  const currentProviderName = status ? providerNames[status.provider] : 'Desconocido';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      {/* Columna Izquierda/Central: Estado de Conexión */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border border-border rounded-none shadow-none bg-[#FAF9F5]">
          <CardHeader className="border-b border-[#ECE7DC] pb-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Estado del Servicio de Notificaciones
                </CardTitle>
                <CardDescription className="text-xs font-light text-muted-foreground mt-1">
                  Proveedor activo: <span className="font-medium text-[#7A6241]">{currentProviderName}</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  status?.status === 'READY' ? 'bg-green-500 animate-pulse' :
                  status?.status === 'QR_RECEIVED' ? 'bg-amber-500' :
                  status?.status === 'CONNECTING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {status?.status === 'READY' ? 'Conectado / Listo' :
                   status?.status === 'QR_RECEIVED' ? 'Pendiente de Escaneo' :
                   status?.status === 'CONNECTING' ? 'Estableciendo Conexión' : 'Desconectado'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            
            {/* 1. MOCK LOGGER (Simulación por consola) */}
            {status?.provider === 'mock-logger' && (
              <div className="space-y-4">
                <div className="flex gap-4 p-4 border border-amber-200 bg-amber-50/50 text-amber-800">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold uppercase tracking-wider">Entorno Serverless / Simulación Activo</p>
                    <p className="font-light leading-relaxed">
                      El backend se está ejecutando en un entorno serverless (Vercel) o de simulación. Los mensajes de WhatsApp no se enviarán a teléfonos reales, sino que se escribirán directamente en los logs de la consola del backend para fines de prueba.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-light text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground">¿Cómo habilitar envíos reales?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Opción Railway:</strong> Despliega el backend en Railway usando el Dockerfile incluido. Esto levantará una instancia persistente de `whatsapp-web.js` lista para escanear el QR.</li>
                    <li><strong>Opción Gateway:</strong> Configura la variable de entorno <code className="bg-[#ECE7DC] px-1 py-0.5 rounded text-foreground font-mono">WHATSAPP_GATEWAY_URL</code> con una API externa y cambia el proveedor a <code className="bg-[#ECE7DC] px-1 py-0.5 rounded text-foreground font-mono">external-api</code>.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Si es local-webjs o external-api, manejamos el estado de conexión */}
            {status?.provider !== 'mock-logger' && (
              <div className="space-y-6">
                
                {/* Caso A: Esperando escaneo de QR */}
                {status?.status === 'QR_RECEIVED' && status.qrCode && (
                  <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <div className="text-center max-w-sm space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#7A6241]">
                        Vincular Cuenta de WhatsApp
                      </h4>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y escanea el código QR a continuación para activar las notificaciones de reservas.
                        {status.provider === 'external-api' && ' (La vinculación se realizará en el servidor puente remoto)'}
                      </p>
                    </div>

                    <div className="p-4 border-2 border-[#7A6241]/20 bg-white relative group">
                      <img 
                        src={status.qrCode} 
                        alt="WhatsApp QR Code" 
                        className="h-52 w-52 object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <RefreshCw className="h-6 w-6 text-[#7A6241] animate-spin" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse font-light">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Actualizando código QR en tiempo real...
                    </div>
                  </div>
                )}

                {/* Caso B: Conectando / Iniciando */}
                {(status?.status === 'CONNECTING' || status?.status === 'AUTHENTICATED') && !status.qrCode && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#7A6241]" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider">
                        {status.status === 'AUTHENTICATED' ? 'Sesión Autenticada' : 'Estableciendo Conexión'}
                      </p>
                      <p className="text-xs text-muted-foreground font-light">
                        {status.status === 'AUTHENTICATED' 
                          ? 'Sincronizando chats y cargando conexión. Un momento...' 
                          : 'Cargando navegador o conectando con la pasarela. Por favor espera...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Caso C: Ya está conectado (READY) */}
                {status?.status === 'READY' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-5 border border-green-200 bg-green-50/50 text-green-900 rounded-none">
                      <CheckCircle2 className="h-10 w-10 shrink-0 text-green-600" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider">Conexión Establecida</h4>
                        <p className="text-xs font-light text-green-800 leading-relaxed">
                          El sistema está vinculado a WhatsApp y listo para enviar notificaciones automáticas instantáneas sobre reservas.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border border-border bg-white text-xs space-y-3 font-light">
                      <div className="flex justify-between items-center border-b border-muted pb-2">
                        <span className="text-muted-foreground">Teléfono Vinculado:</span>
                        <span className="font-mono font-medium text-foreground">
                          {status.phoneNumber ? `+${status.phoneNumber}` : 'Gateway Remoto (Activo)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted pb-2">
                        <span className="text-muted-foreground">Tipo de Enlace:</span>
                        <span className="font-semibold text-[#7A6241] uppercase tracking-widest text-[10px]">
                          {status.provider === 'local-webjs' ? 'CLIENTE LOCAL (LocalAuth)' : 'PASARELA EXTERNA (HTTP Bridge)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-muted-foreground">Estado de Enlace:</span>
                        <span className="font-bold text-green-600 uppercase text-[10px] tracking-widest">
                          ACTIVO
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none font-light text-xs tracking-wider uppercase h-auto px-4 py-2"
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            Cerrando Sesión...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-3.5 w-3.5 mr-2" />
                            Desvincular WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Caso D: Desconectado / Inactivo */}
                {status?.status === 'DISCONNECTED' && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-light text-center max-w-xs leading-relaxed">
                      El servicio de WhatsApp está desconectado. El backend intentará inicializarlo automáticamente.
                    </p>
                  </div>
                )}

                {/* Caso E: Error */}
                {status?.status === 'ERROR' && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">Error de Enlace</p>
                      <p className="text-xs text-muted-foreground font-light max-w-xs leading-relaxed">
                        Ha ocurrido un problema al conectar con el cliente o pasarela. Intenta recargar o verificar el servidor puente.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha: Herramientas de Prueba */}
      <div className="space-y-6">
        <Card className="border border-border rounded-none shadow-none bg-[#FAF9F5]">
          <CardHeader className="border-b border-[#ECE7DC] pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
              Herramienta de Prueba
            </CardTitle>
            <CardDescription className="text-xs font-light text-muted-foreground mt-1">
              Envía un mensaje de prueba manual para validar la conexión.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSendTest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Número del Destinatario
                </Label>
                <PhoneInput
                  value={testPhone}
                  onChange={setTestPhone}
                  placeholder="Ej. 600000000"
                />
                <span className="text-[10px] text-muted-foreground font-light leading-relaxed block">
                  Selecciona la bandera de tu país e ingresa el número móvil (ej: 600123456).
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Mensaje
                </Label>
                <textarea
                  id="test-message"
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full min-h-[80px] p-2.5 rounded-none border border-border bg-white text-xs font-light focus:outline-none focus:ring-1 focus:ring-ring focus:border-input"
                />
              </div>

              <Button
                type="submit"
                disabled={isSendingTest || status?.status !== 'READY'}
                className="w-full bg-[#7A6241] hover:bg-[#634F33] text-white rounded-none font-light uppercase tracking-wider text-xs py-2.5"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>

              {status?.status !== 'READY' && (
                <div className="flex gap-2 p-3 border border-amber-200 bg-amber-50/50 text-amber-800 text-[10px] leading-relaxed">
                  <HelpCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    El envío de prueba solo está habilitado cuando el estado es <strong>Conectado / Listo</strong>.
                  </span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
