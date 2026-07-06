import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, AlignLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/PhoneInput';
import type { Reservation } from '@/hooks/useReservations';
import type { ServiceItem } from '@/services/api';

interface AdminReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  reservation?: Reservation;
  services: ServiceItem[];
  onSubmit: (data: any) => Promise<void>;
}

export function AdminReservationFormModal({
  isOpen,
  onClose,
  mode,
  reservation,
  services,
  onSubmit,
}: AdminReservationFormModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [notes, setNotes] = useState('');
  const [durationOverride, setDurationOverride] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && reservation) {
        setCustomerName(reservation.customerName);
        setCustomerPhone(reservation.customerPhone);
        setServiceId(reservation.serviceId);
        setVariantId(reservation.variantId || '');
        setNotes(reservation.notes || '');
        setDurationOverride(''); // Default empty unless we fetched it, but it's not in the Reservation interface on frontend yet.
        // Date is read-only in edit mode
        const d = new Date(reservation.date);
        setDate(d.toISOString().split('T')[0]);
        setTime(d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setDate('');
        setTime('');
        setServiceId('');
        setVariantId('');
        setNotes('');
        setDurationOverride('');
      }
      setError(null);
    }
  }, [isOpen, mode, reservation]);

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !customerPhone || !serviceId) {
      setError('Por favor, completa los campos requeridos (Nombre, Teléfono, Servicio).');
      return;
    }

    if (mode === 'create' && (!date || !time)) {
      setError('Por favor, selecciona una fecha y hora.');
      return;
    }

    setIsSubmitting(true);
    try {
      let submitData: any = {
        customerName,
        customerPhone,
        serviceId,
        variantId: variantId || undefined,
        notes: notes || undefined,
      };

      if (durationOverride) {
        submitData.durationOverride = parseInt(durationOverride, 10);
      }

      if (mode === 'create') {
        const dateTimeStr = `${date}T${time}:00`;
        submitData.date = new Date(dateTimeStr).toISOString();
      }

      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPastDate = () => {
    if (mode !== 'create' || !date || !time) return false;
    const selectedDate = new Date(`${date}T${time}:00`);
    return selectedDate < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FAF9F5] w-full max-w-lg border border-[#ECE7DC] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#ECE7DC] bg-white shrink-0">
          <h2 className="text-xl md:text-2xl font-serif text-[#1E1D1A]">
            {mode === 'create' ? 'Crear Cita' : 'Editar Cita'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8172] hover:text-[#1E1D1A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0 overflow-y-auto">
          <div className="p-5 md:p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Date and Time (Only editable in create mode) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                  Fecha {mode === 'edit' && '(Solo Lectura)'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8172]" />
                  <Input
                    type="date"
                    required={mode === 'create'}
                    disabled={mode === 'edit'}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10 h-11 bg-white border-[#ECE7DC] rounded-none focus-visible:ring-[#7A6241]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                  Hora {mode === 'edit' && '(Solo Lectura)'}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8172]" />
                  <Input
                    type="time"
                    required={mode === 'create'}
                    disabled={mode === 'edit'}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-10 h-11 bg-white border-[#ECE7DC] rounded-none focus-visible:ring-[#7A6241]"
                  />
                </div>
              </div>
            </div>

            {isPastDate() && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p><strong>Advertencia:</strong> Estás programando una cita en el pasado.</p>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-serif text-[#7A6241] border-b border-[#ECE7DC] pb-2">Datos del Cliente</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8172]" />
                  <Input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="pl-10 h-11 bg-white border-[#ECE7DC] rounded-none focus-visible:ring-[#7A6241]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                  Teléfono (WhatsApp)
                </label>
                <PhoneInput
                  value={customerPhone}
                  onChange={setCustomerPhone}
                />
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-serif text-[#7A6241] border-b border-[#ECE7DC] pb-2">Detalles del Servicio</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                  Servicio
                </label>
                <select
                  required
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setVariantId('');
                  }}
                  className="flex h-11 w-full rounded-none border border-[#ECE7DC] bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A6241] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && selectedService.variants && selectedService.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                    Variante (Opcional)
                  </label>
                  <select
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    className="flex h-11 w-full rounded-none border border-[#ECE7DC] bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A6241] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Ninguna</option>
                    {selectedService.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (+{v.price}€ / {v.duration} min)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                  Duración Personalizada (Minutos)
                </label>
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={durationOverride}
                  onChange={(e) => setDurationOverride(e.target.value)}
                  placeholder={`Ej: ${selectedService ? selectedService.duration : 60}`}
                  className="h-11 bg-white border-[#ECE7DC] rounded-none focus-visible:ring-[#7A6241]"
                />
                <p className="text-[10px] text-[#8A8172]">
                  Opcional. Deja vacío para usar la duración por defecto del servicio.
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1E1D1A]">
                Notas Adicionales
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-[#8A8172]" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales o comentarios"
                  className="flex w-full rounded-none border border-[#ECE7DC] bg-white pl-10 pr-3 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A6241] focus-visible:ring-offset-2 min-h-[80px] resize-none"
                />
              </div>
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="p-5 md:p-6 bg-white border-t border-[#ECE7DC] flex justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-none border-[#ECE7DC] text-[#8A8172] hover:text-[#1E1D1A] uppercase text-xs tracking-wider font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cita'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
