import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { ServiceVariant } from '@/types';
import { useReservationForm } from '@/hooks/useReservationForm';
import { useReservationCalendar } from '@/hooks/useReservationCalendar';

import { ReservationOptionsStep } from './reservation/ReservationOptionsStep';
import { ReservationDateTimeStep } from './reservation/ReservationDateTimeStep';
import { ReservationContactStep } from './reservation/ReservationContactStep';
import { ReservationMobileFooter } from './reservation/ReservationMobileFooter';

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
  const {
    form,
    isSubmitting,
    error,
    setError,
    success,
    selectedVariantId,
    setSelectedVariantId,
    steps,
    currentStepIdx,
    activeStep,
    nextStep,
    prevStep,
    onSubmit,
    isAuthenticated,
    user
  } = useReservationForm({
    isOpen,
    onClose,
    serviceId,
    initialVariantId,
    variants,
  });

  const {
    loadingOccupied,
    selectedDay,
    setSelectedDay,
    selectedTime,
    setSelectedTime,
    getNext14Days,
    formatDateKey,
    timeSlots,
    isSlotOccupiedForClient,
    resetCalendar
  } = useReservationCalendar(isOpen);

  // Sync calendar selections to form state
  useEffect(() => {
    if (selectedDay && selectedTime) {
      const [year, month, day] = selectedDay.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes);
      form.setValue('date', localDate.toISOString());
    } else {
      form.setValue('date', '');
    }
  }, [selectedDay, selectedTime, form]);

  useEffect(() => {
    if (isOpen) resetCalendar();
  }, [isOpen]);

  const activeVariant = variants.find(v => v.id === selectedVariantId);
  const activeDuration = activeVariant ? activeVariant.duration : serviceDuration;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 w-full max-w-full h-[88vh] max-h-[88vh] rounded-t-[20px] p-5 flex flex-col bg-white border-t border-border shadow-2xl z-50 md:fixed md:top-[50%] md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:bottom-auto md:right-auto md:w-full md:max-w-[480px] md:h-auto md:max-h-[85vh] md:rounded-none md:border md:p-6">
        <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mb-4 md:hidden shrink-0" />

        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground uppercase tracking-wide">Reservar Servicio</DialogTitle>
          <DialogDescription className="text-muted-foreground font-light">
            Estás reservando: <span className="font-semibold text-foreground">{serviceName}</span>
            {activeVariant && (
              <span className="block mt-1.5 text-xs text-[#7A6241]">
                Opción: <strong className="font-semibold text-[#1E1D1A]">{activeVariant.name}</strong> ({activeVariant.price}€ | {activeVariant.duration} min)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow min-h-0 w-full max-w-full min-w-0 overflow-hidden md:block md:h-auto md:overflow-visible">
            <div className="space-y-5 overflow-y-auto pr-1 flex-grow min-h-0 w-full max-w-full flex flex-col min-w-0 pb-4 md:block md:max-h-[58vh] md:overflow-y-auto md:pr-1.5 md:flex-none">
              
              <ReservationOptionsStep 
                variants={variants}
                selectedVariantId={selectedVariantId}
                setSelectedVariantId={setSelectedVariantId}
                isActive={activeStep === 'options'}
              />

              <ReservationDateTimeStep 
                isActive={activeStep === 'datetime'}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                loadingOccupied={loadingOccupied}
                activeDuration={activeDuration}
                errors={form.formState.errors}
                getNext14Days={getNext14Days}
                formatDateKey={formatDateKey}
                timeSlots={timeSlots}
                isSlotOccupiedForClient={isSlotOccupiedForClient}
              />

              <ReservationContactStep 
                isActive={activeStep === 'contact'}
                register={form.register}
                errors={form.formState.errors}
                isAuthenticated={isAuthenticated}
                userPhone={user?.phone}
                userName={user?.name}
              />

              {error && (
                <p className="text-red-500 text-sm text-center font-light mt-2">{error}</p>
              )}
            </div>

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

            <ReservationMobileFooter 
              currentStepIdx={currentStepIdx}
              stepsLength={steps.length}
              activeStep={activeStep}
              isSubmitting={isSubmitting}
              selectedDay={selectedDay}
              selectedTime={selectedTime}
              onClose={onClose}
              nextStep={nextStep}
              prevStep={prevStep}
              setError={setError}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
