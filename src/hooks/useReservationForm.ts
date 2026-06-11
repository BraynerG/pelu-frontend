import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';
import type { ServiceVariant } from '@/types';

export const formSchema = z.object({
  customerName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  customerPhone: z.string().min(7, { message: 'El teléfono debe tener al menos 7 caracteres' }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Debe ser una fecha válida' }),
  notes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface UseReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  initialVariantId?: string | null;
  variants?: ServiceVariant[];
}

export function useReservationForm({
  isOpen,
  onClose,
  serviceId,
  initialVariantId,
  variants = []
}: UseReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId || (variants.length > 0 ? variants[0].id : null)
  );

  const { user, isAuthenticated } = useAuth();

  const hasVariants = variants && variants.length > 0;
  const steps = hasVariants ? ['options', 'datetime', 'contact'] : ['datetime', 'contact'];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const activeStep = steps[currentStepIdx];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: user?.name || '',
      customerPhone: user?.phone || '',
      date: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setError(null);
      form.reset({
        customerName: user?.name || '',
        customerPhone: user?.phone || '',
        date: '',
        notes: '',
      });
      setSelectedVariantId(initialVariantId || (variants.length > 0 ? variants[0].id : null));
    }
  }, [isOpen, initialVariantId, variants, user, form]);

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
      form.reset();
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

  const nextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setError(null);
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  return {
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
  };
}
