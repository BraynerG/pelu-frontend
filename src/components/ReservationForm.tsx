import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_URL } from '@/services/api';

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
  initialVariantId?: string | null;
  variants?: ServiceVariant[];
}

export function ReservationForm({ 
  isOpen, 
  onClose, 
  serviceId, 
  serviceName, 
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: user?.name || '',
      customerPhone: user?.phone || '',
      date: '',
      notes: '',
    },
  });

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
      <DialogContent className="bg-white text-foreground border-border sm:max-w-[425px] rounded-none">
        <DialogHeader>
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

        {success ? (
          <div className="py-6 text-center text-green-600 font-medium">
            ¡Reserva creada con éxito!
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {variants.length > 0 && (
              <div className="space-y-2">
                <Label className="text-foreground font-medium text-sm">Opción / Tipo de Cabello</Label>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-2 text-xs border tracking-wider transition-all rounded-none text-left flex justify-between items-center ${
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

            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-foreground font-medium text-sm">Nombre</Label>
              <Input
                id="customerName"
                placeholder="Tu nombre"
                className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light"
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
                className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light"
                {...register('customerPhone')}
                disabled={isAuthenticated && !!user?.phone}
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-xs font-light">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground font-medium text-sm">Fecha y Hora</Label>
              <Input
                id="date"
                type="datetime-local"
                className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-red-500 text-xs font-light">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground font-medium text-sm">Notas (Opcional)</Label>
              <Input
                id="notes"
                placeholder="Alguna indicación especial"
                className="bg-white border-border text-foreground focus:ring-primary focus:border-primary rounded-none font-light"
                {...register('notes')}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-light">{error}</p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground font-light"
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
