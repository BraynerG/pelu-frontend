import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_URL, getOccupiedSlots, type OccupiedSlot } from '@/services/api';

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  customerPhone: z.string().min(7, { message: 'El teléfono debe tener al menos 7 caracteres' }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Debe ser una fecha válida' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

import type { ServiceVariant } from '@/services/api';

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  serviceDuration?: number;
  initialVariantId?: string | null;
  variants?: ServiceVariant[];
}

export function ReservationForm({ 
  isOpen, 
  onClose, 
  serviceId, 
  serviceName, 
  serviceDuration = 30,
  initialVariantId,
  variants = [] 
}: ReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId || (variants.length > 0 ? variants[0].id : null)
  );

  const { user, isAuthenticated } = useAuth();

  // Custom states for date-time slot selection
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [loadingOccupied, setLoadingOccupied] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Mobile multi-step wizard logic
  const hasVariants = variants && variants.length > 0;
  const steps = hasVariants ? ['options', 'datetime', 'contact'] : ['datetime', 'contact'];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const activeStep = steps[currentStepIdx];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: user?.name || '',
      customerPhone: user?.phone || '',
      date: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (selectedDay && selectedTime) {
      const [year, month, day] = selectedDay.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes);
      setValue('date', localDate.toISOString());
    } else {
      setValue('date', '');
    }
  }, [selectedDay, selectedTime, setValue]);

  useEffect(() => {
    if (isOpen) {
      setLoadingOccupied(true);
      getOccupiedSlots()
        .then((data) => setOccupiedSlots(data))
        .catch((err) => console.error('Error fetching occupied slots:', err))
        .finally(() => setLoadingOccupied(false));
      
      setSelectedDay('');
      setSelectedTime('');
      setCurrentStepIdx(0);
      setError(null);
    }
  }, [isOpen]);

  const activeVariant = variants.find(v => v.id === selectedVariantId);
  const activeDuration = activeVariant ? activeVariant.duration : serviceDuration;

  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const isSlotOccupiedForClient = (dayStr: string, timeStr: string, serviceDurationMins: number) => {
    const [year, month, day] = dayStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const slotStart = new Date(year, month - 1, day, hours, minutes).getTime();
    const slotEnd = slotStart + serviceDurationMins * 60000;

    return occupiedSlots.some((occupied) => {
      const resStart = new Date(occupied.date).getTime();
      const resEnd = resStart + occupied.duration * 60000;

      return slotStart < resEnd && slotEnd > resStart;
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          serviceId,
          variantId: selectedVariantId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al crear la reserva');
      }

      setSuccess(true);
      reset();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 w-full max-w-full h-[88vh] max-h-[88vh] rounded-t-[20px] p-5 flex flex-col bg-white border-t border-border shadow-2xl z-50 md:fixed md:top-[50%] md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:bottom-auto md:right-auto md:w-full md:max-w-[480px] md:h-auto md:max-h-[85vh] md:rounded-none md:border md:p-6">
        {/* Mobile slide-up drawer indicator handle */}
        <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mb-4 md:hidden shrink-0" />

        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground uppercase tracking-wide">Reservar Servicio</DialogTitle>
          <DialogDescription className="text-muted-foreground font-light">
            Estás reservando: <span className="font-semibold text-foreground">{serviceName}</span>
            {(() => {
              const activeVariant = variants.find(v => v.id === selectedVariantId);
              if (activeVariant) {
                return (
                  <span className="block mt-1.5 text-xs text-[#7A6241]">
                    Opción: <strong className="font-semibold text-[#1E1D1A]">{activeVariant.name}</strong> ({activeVariant.price}€ | {activeVariant.duration} min)
                  </span>
                );
              }
              return null;
            })()}
          </DialogDescription>
        </DialogHeader>

        {/* Mobile Step Progress Indicator */}
        {!success && (
          <div className="flex md:hidden flex-col gap-2 mb-2 shrink-0">
            <div className="flex justify-between items-center text-[10px] text-[#8A8172] font-semibold uppercase tracking-wider">
              <span>
                Paso {currentStepIdx + 1} de {steps.length}
              </span>
              <span>
                {activeStep === 'options' && 'Selecciona Opción'}
                {activeStep === 'datetime' && 'Fecha y Hora'}
                {activeStep === 'contact' && 'Tus Datos'}
              </span>
            </div>
            <div className="h-1 w-full bg-[#ECE7DC] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#7A6241] transition-all duration-300"
                style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center text-green-600 font-medium">
            ¡Reserva creada con éxito!
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow min-h-0 w-full max-w-full min-w-0 overflow-hidden md:block md:h-auto md:overflow-visible">
            <div className="space-y-5 overflow-y-auto pr-1 flex-grow min-h-0 w-full max-w-full flex flex-col min-w-0 pb-4 md:block md:max-h-[58vh] md:overflow-y-auto md:pr-1.5 md:flex-none">
              
              {/* STEP 1: Option / Hair Type (conditional view on mobile) */}
              {variants.length > 0 && (
                <div className={`space-y-2 md:block ${activeStep === 'options' ? 'block' : 'hidden'}`}>
                  <Label className="text-foreground font-medium text-sm">Opción / Tipo de Cabello</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-2 text-xs border tracking-wider transition-all rounded-none text-left flex justify-between items-center min-h-[44px] ${
                          selectedVariantId === v.id
                            ? 'border-[#7A6241] bg-[#7A6241]/5 text-[#7A6241] font-semibold'
                            : 'border-border text-muted-foreground hover:border-[#1E1D1A] hover:text-foreground'
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className="font-serif font-bold">{v.price}€</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Date & Time slot picker (conditional view on mobile) */}
              <div className={`space-y-4 md:block md:border-t md:border-[#ECE7DC] md:pt-4 w-full max-w-full overflow-hidden flex flex-col flex-grow min-h-0 md:h-auto md:flex-none ${activeStep === 'datetime' ? 'block' : 'hidden'}`}>
                <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#7A6241]" />
                  Fecha y Hora de la Cita
                </Label>

                {/* Day Selector */}
                <div className="space-y-1.5 w-full max-w-full overflow-hidden flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#8A8172] font-semibold">1. Selecciona el Día</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 w-full max-w-full scrollbar-thin scrollbar-thumb-[#C4B297]">
                    {getNext14Days().map((day, idx) => {
                      const dayKey = formatDateKey(day);
                      const isSelected = selectedDay === dayKey;
                      const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
                      const dayNum = day.getDate();
                      const monthName = day.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDay(dayKey);
                            setSelectedTime(''); // Reset time when day changes
                          }}
                          className={`flex flex-col items-center justify-center min-w-[68px] md:min-w-[55px] p-3 md:p-2 border transition-all duration-200 rounded-none ${
                            isSelected
                              ? 'border-[#7A6241] bg-[#7A6241]/5 text-[#7A6241] font-semibold shadow-sm'
                              : 'border-[#ECE7DC] bg-[#FAF9F5] text-[#8A8172] hover:border-[#1E1D1A] hover:text-[#1E1D1A]'
                          }`}
                        >
                          <span className="text-[8px] tracking-widest font-medium opacity-80">{dayName}</span>
                          <span className="text-xs font-serif font-bold my-0.5">{dayNum}</span>
                          <span className="text-[8px] tracking-widest uppercase font-semibold">{monthName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selector */}
                {selectedDay && (
                  <div className="space-y-1.5 animate-fade-in flex flex-col min-h-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#8A8172] font-semibold block flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#7A6241]" />
                      2. Selecciona la Hora
                    </span>
                    {loadingOccupied ? (
                      <div className="text-center py-4 text-xs text-[#8A8172] italic font-light">Cargando disponibilidad...</div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[180px] md:max-h-[130px] overflow-y-auto pr-1">
                        {timeSlots.map((slot) => {
                          const occupied = isSlotOccupiedForClient(selectedDay, slot, activeDuration);
                          const isSelected = selectedTime === slot;
                          
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={occupied}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2.5 md:py-1.5 text-xs md:text-[10px] tracking-wider border text-center transition-all duration-150 rounded-none min-h-[40px] flex items-center justify-center flex-col ${
                                occupied
                                  ? 'bg-[#E5E5E5]/20 text-[#A3A3A3] border-dashed border-[#ECE7DC] cursor-not-allowed line-through'
                                  : isSelected
                                    ? 'border-[#7A6241] bg-[#7A6241] text-white font-bold'
                                    : 'border-[#ECE7DC] text-[#1E1D1A] bg-white hover:border-[#1E1D1A]'
                              }`}
                            >
                              <span>{slot}</span>
                              {occupied && <span className="text-[6.5px] text-[#C62828] font-bold tracking-tight not-italic">Ocupado</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Selection Summary */}
                {selectedDay && selectedTime && (
                  <div className="bg-[#FAF3F3] border border-[#ECE7DC] p-3 text-xs text-center rounded-none animate-fade-in mt-auto md:mt-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8172] block mb-0.5">Fecha y Hora Seleccionada</span>
                    <p className="font-serif font-bold text-[#1E1D1A]">
                      {(() => {
                        const [year, month, day] = selectedDay.split('-').map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        return dateObj.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        });
                      })()}{' '}
                      a las <span className="font-mono text-[#7A6241]">{selectedTime}h</span>
                    </p>
                  </div>
                )}
                
                {errors.date && (
                  <p className="text-red-500 text-xs font-light">{errors.date.message}</p>
                )}
              </div>

              {/* STEP 3: Contact Details (conditional view on mobile) */}
              <div className={`space-y-4 md:block md:border-t md:border-[#ECE7DC] md:pt-4 ${activeStep === 'contact' ? 'block' : 'hidden'}`}>
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-foreground font-medium text-sm">Nombre</Label>
                  <Input
                    id="customerName"
                    placeholder="Tu nombre"
                    className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light min-h-[44px]"
                    {...register('customerName')}
                    disabled={isAuthenticated && !!user?.name}
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs font-light">{errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-foreground font-medium text-sm">Teléfono</Label>
                  <Input
                    id="customerPhone"
                    placeholder="Tu teléfono"
                    className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light min-h-[44px]"
                    {...register('customerPhone')}
                    disabled={isAuthenticated && !!user?.phone}
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-xs font-light">{errors.customerPhone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground font-medium text-sm">Notas (Opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Alguna indicación especial"
                    className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light min-h-[44px]"
                    {...register('notes')}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center font-light mt-2">{error}</p>
              )}
            </div>

            {/* Desktop Footer Controls */}
            <DialogFooter className="hidden md:flex gap-2 sm:gap-0 mt-4 border-t border-[#ECE7DC] pt-4 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground font-light rounded-none text-xs uppercase tracking-wider"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-wide font-medium text-sm py-5"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar Reserva'}
              </Button>
            </DialogFooter>

            {/* Mobile Footer Controls (Wizard navigation) */}
            <div className="flex md:hidden justify-between items-center pt-4 pb-2 border-t border-[#ECE7DC] mt-auto shrink-0 bg-white">
              {currentStepIdx > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStepIdx(prev => prev - 1)}
                  className="text-muted-foreground hover:text-foreground font-light text-xs uppercase tracking-wider px-3 h-11 rounded-none"
                >
                  Atrás
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground font-light text-xs uppercase tracking-wider px-3 h-11 rounded-none"
                >
                  Cancelar
                </Button>
              )}

              {currentStepIdx < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => {
                    // Pre-validation for date step
                    if (activeStep === 'datetime' && (!selectedDay || !selectedTime)) {
                      setError('Por favor, selecciona un día y una hora.');
                      return;
                    }
                    setError(null);
                    setCurrentStepIdx(prev => prev + 1);
                  }}
                  disabled={activeStep === 'datetime' && (!selectedDay || !selectedTime)}
                  className="bg-primary hover:bg-primary/90 text-[#FAF9F5] rounded-none uppercase tracking-wider font-semibold text-xs px-6 h-11 flex items-center justify-center"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-[#FAF9F5] rounded-none uppercase tracking-wider font-semibold text-xs px-6 h-11 flex items-center justify-center"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar'}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
