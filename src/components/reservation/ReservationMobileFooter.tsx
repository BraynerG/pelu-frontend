import { Button } from '@/components/ui/button';

interface ReservationMobileFooterProps {
  currentStepIdx: number;
  stepsLength: number;
  activeStep: string;
  isSubmitting: boolean;
  selectedDay: string;
  selectedTime: string;
  onClose: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setError: (msg: string | null) => void;
}

export function ReservationMobileFooter({
  currentStepIdx,
  stepsLength,
  activeStep,
  isSubmitting,
  selectedDay,
  selectedTime,
  onClose,
  nextStep,
  prevStep,
  setError
}: ReservationMobileFooterProps) {
  return (
    <div className="flex md:hidden justify-between items-center pt-4 pb-2 border-t border-[#ECE7DC] mt-auto shrink-0 bg-white">
      {currentStepIdx > 0 ? (
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
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

      {currentStepIdx < stepsLength - 1 ? (
        <Button
          type="button"
          onClick={() => {
            if (activeStep === 'datetime' && (!selectedDay || !selectedTime)) {
              setError('Por favor, selecciona un día y una hora.');
              return;
            }
            setError(null);
            nextStep();
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
  );
}
