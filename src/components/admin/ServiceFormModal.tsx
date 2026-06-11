import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ImageUpload';
import { X, Plus } from 'lucide-react';
import type { ServiceItem } from '@/services/api';

interface ServiceFormModalProps {
  isOpen: boolean;
  editingService: ServiceItem | null;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export function ServiceFormModal({
  isOpen,
  editingService,
  onClose,
  onSave,
}: ServiceFormModalProps) {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('hair-cut');
  const [stepsList, setStepsList] = useState<string[]>([]);
  const [variantsList, setVariantsList] = useState<{ id?: string; name: string; price: number; duration: number }[]>([]);

  useEffect(() => {
    if (editingService) {
      setFormName(editingService.name);
      setFormDescription(editingService.description || '');
      setFormPrice(editingService.price.toString());
      setFormDuration(editingService.duration.toString());
      setFormImageUrl(editingService.imageUrl || '');
      setFormCategory(editingService.category);
      setStepsList(editingService.steps || []);
      setVariantsList(editingService.variants || []);
    } else {
      setFormName('');
      setFormDescription('');
      setFormPrice('');
      setFormDuration('');
      setFormImageUrl('');
      setFormCategory('hair-cut');
      setStepsList([]);
      setVariantsList([]);
    }
  }, [editingService, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formDuration) {
      alert('Nombre, precio y duración son obligatorios');
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      duration: parseInt(formDuration),
      imageUrl: formImageUrl || null,
      category: formCategory,
      steps: stepsList.filter((s) => s.trim() !== ''),
      variants: variantsList.map((v) => ({
        name: v.name,
        price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
        duration: typeof v.duration === 'string' ? parseInt(v.duration) : v.duration,
      })),
    };

    await onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop Layer */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
          aria-hidden="true"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Content Panel */}
        <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none animate-fade-in fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col">
          {/* Mobile drag handle */}
          <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mt-4 sm:hidden shrink-0" />
          
          <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] font-serif">
              {editingService ? 'Editar Servicio de Autor' : 'Nuevo Servicio de Autor'}
            </h3>
            <button 
              onClick={onClose}
              className="h-8 w-8 text-[#8A8172] hover:text-[#1E1D1A] flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0 overflow-hidden sm:block sm:h-auto sm:overflow-visible">
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Nombre del Ritual</label>
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Balayage Signature Gold"
                    className="bg-white border-border text-xs rounded-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Precio (€)</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Ej. 85.00"
                    className="bg-white border-border text-xs rounded-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Duración (minutos)</label>
                  <Input
                    required
                    type="number"
                    min="5"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="Ej. 60"
                    className="bg-white border-border text-xs rounded-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Descripción del Servicio</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe los beneficios principales, texturas o resultados de este ritual..."
                  className="w-full bg-white border border-border text-xs rounded-none p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-light leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUpload
                  label="Imagen de Portada"
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                />
                <p className="text-[10px] text-muted-foreground font-light">
                  Opcional. Carga una foto representativa del servicio. Si se deja en blanco, se utilizará una imagen por defecto elegante.
                </p>
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
                className="flex-grow bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
              >
                Guardar Ritual
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
