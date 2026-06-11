import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ImageUpload';
import { X, Plus } from 'lucide-react';
import type { ServiceItem } from '@/services/api';

const serviceSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio' }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'El precio debe ser válido' }),
  duration: z.coerce.number().min(5, { message: 'Mínimo 5 min' }),
  imageUrl: z.string().optional(),
  category: z.string().min(1, { message: 'Requerido' }),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  isOpen: boolean;
  editingService: ServiceItem | null;
  onClose: () => void;
  onSave: (payload: any) => void | Promise<void>;
}

export function ServiceFormModal({
  isOpen,
  editingService,
  onClose,
  onSave,
}: ServiceFormModalProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 30,
      imageUrl: '',
      category: 'hair-cut',
    },
  });

  const [stepsList, setStepsList] = useState<string[]>([]);
  const [variantsList, setVariantsList] = useState<{ id?: string; name: string; price: number; duration: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        form.reset({
          name: editingService.name,
          description: editingService.description || '',
          price: editingService.price,
          duration: editingService.duration,
          imageUrl: editingService.imageUrl || '',
          category: editingService.category,
        });
        setStepsList(editingService.steps || []);
        setVariantsList(editingService.variants || []);
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          duration: 30,
          imageUrl: '',
          category: 'hair-cut',
        });
        setStepsList([]);
        setVariantsList([]);
      }
    }
  }, [editingService, isOpen, form]);

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

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        imageUrl: data.imageUrl || null,
        category: data.category,
        steps: stepsList.filter((s) => s.trim() !== ''),
        variants: variantsList.map((v) => ({
          name: v.name,
          price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
          duration: typeof v.duration === 'string' ? parseInt(v.duration) : v.duration,
        })),
      };
      await onSave(payload);
    } catch (err) {
      toast.error('Error al guardar el servicio');
    }
  };

  const imageUrlValue = form.watch('imageUrl');

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
        <div className="relative bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none animate-fade-in flex flex-col z-10">
          {/* Mobile drag handle */}
          <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mt-4 sm:hidden shrink-0" />
          
          <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] font-serif">
              {editingService ? 'Editar Servicio de Autor' : 'Nuevo Servicio de Autor'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Nombre del Ritual</label>
                  <Input
                    {...form.register('name')}
                    placeholder="Ej. Balayage Signature Gold"
                    className="bg-white border-border text-xs rounded-none"
                  />
                  {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Categoría</label>
                  <select
                    id="service-category"
                    aria-label="Categoría del servicio"
                    {...form.register('category')}
                    className="w-full bg-white border border-border text-xs rounded-none h-10 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                  >
                    <option value="hair-cut">Cabello - Cortes</option>
                    <option value="hair-style">Cabello - Peinados & Novias</option>
                    <option value="hair-color">Cabello - Color & Mechas</option>
                    <option value="hair-treatment">Cabello - Tratamientos & Botox</option>
                    <option value="hair-straightening">Cabello - Alisados</option>
                    <option value="hair-addon">Cabello - Adicionales</option>
                    <option value="makeup">Maquillaje & Mirada</option>
                    <option value="spa">Facial & Dermoestética</option>
                  </select>
                  {form.formState.errors.category && <p className="text-red-500 text-xs">{form.formState.errors.category.message}</p>}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Precio (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register('price')}
                    placeholder="Ej. 85.00"
                    className="bg-white border-border text-xs rounded-none"
                  />
                  {form.formState.errors.price && <p className="text-red-500 text-xs">{form.formState.errors.price.message}</p>}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Duración (minutos)</label>
                  <Input
                    type="number"
                    min="5"
                    {...form.register('duration')}
                    placeholder="Ej. 60"
                    className="bg-white border-border text-xs rounded-none"
                  />
                  {form.formState.errors.duration && <p className="text-red-500 text-xs">{form.formState.errors.duration.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Descripción del Servicio</label>
                <textarea
                  rows={3}
                  {...form.register('description')}
                  placeholder="Describe los beneficios principales, texturas o resultados de este ritual..."
                  className="w-full bg-white border border-border text-xs rounded-none p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-light leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUpload
                  label="Imagen de Portada"
                  value={imageUrlValue || ''}
                  onChange={(val) => form.setValue('imageUrl', val, { shouldValidate: true })}
                />
                <p className="text-[10px] text-muted-foreground font-light">
                  Opcional. Carga una foto representativa del servicio. Si se deja en blanco, se utilizará una imagen por defecto elegante.
                </p>
                {form.formState.errors.imageUrl && <p className="text-red-500 text-xs">{form.formState.errors.imageUrl.message}</p>}
              </div>

              {/* Dynamic Steps Management */}
              <div className="space-y-3.5 pt-4 border-t border-[#ECE7DC]">
                <div className="flex justify-between items-center gap-4">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Pasos del Ritual / Tratamiento</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#BFA37A] text-[#7A6241] hover:bg-[#FAF9F5] rounded-none text-xs tracking-wider"
                    onClick={() => setStepsList([...stepsList, ''])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Paso
                  </Button>
                </div>
                
                {stepsList.length > 0 ? (
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {stepsList.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs text-[#7A6241] font-bold font-mono w-6 text-right">{idx + 1}.</span>
                        <Input
                          value={step}
                          onChange={(e) => {
                            const updated = [...stepsList];
                            updated[idx] = e.target.value;
                            setStepsList(updated);
                          }}
                          placeholder={`Describir paso del tratamiento ${idx + 1}...`}
                          className="flex-grow bg-white border-border text-xs rounded-none font-light"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-[#ECE7DC] text-[#8A8172] hover:text-red-600 rounded-none h-10 w-10 p-0"
                          onClick={() => setStepsList(stepsList.filter((_, i) => i !== idx))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-[#ECE7DC] text-xs text-muted-foreground font-light italic">
                    No hay pasos descritos para este ritual capilar o estético.
                  </div>
                )}
              </div>

              {/* Dynamic Variants Management */}
              <div className="space-y-3.5 pt-4 border-t border-[#ECE7DC]">
                <div className="flex justify-between items-center gap-4">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Variantes del Servicio (Opcional)</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#BFA37A] text-[#7A6241] hover:bg-[#FAF9F5] rounded-none text-xs tracking-wider"
                    onClick={() => setVariantsList([...variantsList, { name: '', price: 0, duration: 60 }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Variante
                  </Button>
                </div>
                
                {variantsList.length > 0 ? (
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                    {variantsList.map((variant, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={variant.name}
                          onChange={(e) => {
                            const updated = [...variantsList];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setVariantsList(updated);
                          }}
                          placeholder="Nombre (ej. Cabello Corto)"
                          className="w-1/2 bg-white border-border text-xs rounded-none font-light"
                          required
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => {
                            const updated = [...variantsList];
                            updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 };
                            setVariantsList(updated);
                          }}
                          placeholder="Precio (€)"
                          className="w-1/4 bg-white border-border text-xs rounded-none font-light"
                          required
                        />
                        <Input
                          type="number"
                          min="5"
                          value={variant.duration}
                          onChange={(e) => {
                            const updated = [...variantsList];
                            updated[idx] = { ...updated[idx], duration: parseInt(e.target.value) || 0 };
                            setVariantsList(updated);
                          }}
                          placeholder="Duración (min)"
                          className="w-1/4 bg-white border-border text-xs rounded-none font-light"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-[#ECE7DC] text-[#8A8172] hover:text-red-600 rounded-none h-10 w-10 p-0 shrink-0"
                          onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-[#ECE7DC] text-xs text-muted-foreground font-light italic">
                    No hay variantes definidas. El servicio usará el precio y duración base.
                  </div>
                )}
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
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Ritual'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
