import { useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ImageUpload';
import { X } from 'lucide-react';
import type { LookbookSlide } from '@/services/api';

const lookbookSchema = z.object({
  title: z.string().min(1, { message: 'El título es obligatorio' }),
  subtitle: z.string().optional(),
  tag: z.string().min(1, { message: 'La etiqueta es obligatoria' }),
  url: z.string().min(1, { message: 'La imagen es obligatoria' }),
  accent: z.string().optional(),
});

type LookbookFormValues = z.infer<typeof lookbookSchema>;

interface LookbookFormModalProps {
  isOpen: boolean;
  editingLookbook: LookbookSlide | null;
  onClose: () => void;
  onSave: (payload: any) => void | Promise<void>;
}

export function LookbookFormModal({
  isOpen,
  editingLookbook,
  onClose,
  onSave,
}: LookbookFormModalProps) {
  const form = useForm<LookbookFormValues>({
    resolver: zodResolver(lookbookSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      tag: '',
      url: '',
      accent: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingLookbook) {
        form.reset({
          title: editingLookbook.title,
          subtitle: editingLookbook.subtitle || '',
          tag: editingLookbook.tag,
          url: editingLookbook.url,
          accent: editingLookbook.accent || '',
        });
      } else {
        form.reset({
          title: '',
          subtitle: '',
          tag: '',
          url: '',
          accent: '',
        });
      }
    }
  }, [editingLookbook, isOpen, form]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onSubmit = async (data: LookbookFormValues) => {
    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle || undefined,
        tag: data.tag,
        url: data.url,
        accent: data.accent || null,
      };
      await onSave(payload);
    } catch (err) {
      toast.error('Ocurrió un error al guardar la diapositiva');
    }
  };

  const urlValue = form.watch('url');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4 text-center">
        {/* Backdrop Layer */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal Content Panel */}
        <div className="relative bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none animate-fade-in flex flex-col z-10">
          {/* Mobile drag handle */}
          <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mt-4 sm:hidden shrink-0" />
          
          <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] font-serif">
              {editingLookbook ? 'Editar Diapositiva Hero' : 'Nueva Diapositiva Hero'}
            </h3>
            <button 
              type="button"
              onClick={onClose}
              className="h-8 w-8 text-[#8A8172] hover:text-[#1E1D1A] flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow min-h-0 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow min-h-0">
              {/* Tag */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Etiqueta (Tag)</label>
                <Input
                  {...form.register('tag')}
                  placeholder="Ej. NUEVA COLECCIÓN"
                  className="bg-white border-border text-xs rounded-none"
                />
                {form.formState.errors.tag && <p className="text-red-500 text-xs">{form.formState.errors.tag.message}</p>}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Título Principal</label>
                <Input
                  {...form.register('title')}
                  placeholder="Ej. Estilo Esculpido"
                  className="bg-white border-border text-xs rounded-none"
                />
                {form.formState.errors.title && <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>}
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Subtítulo</label>
                <textarea
                  rows={2}
                  {...form.register('subtitle')}
                  placeholder="Ej. Cortes geométricos de alta precisión que respetan el movimiento natural del cabello..."
                  className="w-full bg-white border border-border text-xs rounded-none p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-light leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUpload
                  label="Imagen de Fondo"
                  value={urlValue}
                  onChange={(val) => form.setValue('url', val, { shouldValidate: true })}
                />
                {form.formState.errors.url && <p className="text-red-500 text-xs">{form.formState.errors.url.message}</p>}
              </div>

              {/* Accent (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Color de Acento (Hexadecimal Opcional)</label>
                <Input
                  {...form.register('accent')}
                  placeholder="Ej. #BFA37A"
                  className="bg-white border-border text-xs rounded-none"
                />
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="p-6 sm:p-8 pt-4 sm:pt-6 border-t border-[#ECE7DC] flex gap-4 shrink-0 bg-white mt-auto">
              <Button 
                type="button"
                variant="outline"
                className="flex-grow border-border text-muted-foreground hover:text-foreground rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-grow bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
              >
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Diapositiva'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
