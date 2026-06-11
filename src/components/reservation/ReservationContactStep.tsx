import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { FormValues } from '@/hooks/useReservationForm';

interface ReservationContactStepProps {
  isActive: boolean;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  isAuthenticated: boolean;
  userPhone?: string;
  userName?: string;
}

export function ReservationContactStep({
  isActive,
  register,
  errors,
  isAuthenticated,
  userPhone,
  userName
}: ReservationContactStepProps) {
  return (
    <div className={`space-y-4 md:block md:border-t md:border-[#ECE7DC] md:pt-4 ${isActive ? 'block' : 'hidden'}`}>
      <div className="space-y-2">
        <Label htmlFor="customerName" className="text-foreground font-medium text-sm">Nombre</Label>
        <Input
          id="customerName"
          placeholder="Tu nombre"
          className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light min-h-[44px]"
          {...register('customerName')}
          disabled={isAuthenticated && !!userName}
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
          disabled={isAuthenticated && !!userPhone}
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
  );
}
