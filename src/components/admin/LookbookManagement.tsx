import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { LookbookFormModal } from './LookbookFormModal';
import { useAuth } from '@/context/AuthContext';
import { API_URL, type LookbookSlide } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

interface LookbookManagementProps {
  lookbookSlides: LookbookSlide[];
  onServicesChange?: () => void;
}

export function LookbookManagement({ lookbookSlides, onServicesChange }: LookbookManagementProps) {
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookSlide | null>(null);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const handleOpenCreateLookbook = () => {
    setEditingLookbook(null);
    setIsLookbookModalOpen(true);
  };

  const handleOpenEditLookbook = (slide: LookbookSlide) => {
    setEditingLookbook(slide);
    setIsLookbookModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/services/lookbook/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al eliminar');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lookbook.all });
      onServicesChange?.();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingLookbook ? `${API_URL}/services/lookbook/${editingLookbook.id}` : `${API_URL}/services/lookbook`;
      const method = editingLookbook ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al guardar');
    },
    onSuccess: () => {
      setIsLookbookModalOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.lookbook.all });
      onServicesChange?.();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleDeleteLookbook = (id: string) => {
    toast('¿Eliminar diapositiva del carrusel?', {
      description: 'Esta acción no se puede deshacer.',
      action: {
        label: 'Eliminar',
        onClick: () => deleteMutation.mutate(id),
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  const handleSaveLookbook = (payload: any) => {
    saveMutation.mutate(payload);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.2em] font-serif flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#BFA37A]" />
          Diapositivas del Carrusel Hero
        </h3>
        <Button
          onClick={handleOpenCreateLookbook}
          className="bg-[#1E1D1A] hover:bg-[#7A6241] text-white flex items-center gap-1.5 rounded-none text-xs uppercase font-medium tracking-wider px-4"
        >
          <Plus className="h-4 w-4" /> Nueva Diapositiva
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lookbookSlides.map((slide) => (
          <div 
            key={slide.id} 
            className="border border-[#ECE7DC] bg-[#FAF9F5] flex flex-col justify-between rounded-none overflow-hidden hover:border-[#7A6241]/40 transition-colors"
          >
            <div className="aspect-video relative overflow-hidden bg-black/10">
              <img 
                src={slide.url} 
                alt={slide.title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero_salon.webp';
                }}
              />
              <span className="absolute top-2 left-2 bg-[#1E1D1A]/80 backdrop-blur-sm text-white text-[9px] tracking-widest uppercase font-semibold py-0.5 px-2">
                {slide.tag}
              </span>
            </div>
            
            <div className="p-4 space-y-2 flex-grow">
              <h4 className="font-serif text-[#1E1D1A] font-bold text-sm leading-tight">{slide.title}</h4>
              <p className="text-xs text-[#5C574F] font-light line-clamp-2">{slide.subtitle || 'Sin subtítulo'}</p>
              {slide.accent && (
                <div className="text-[10px] text-[#5C574F] flex items-center gap-1">
                  <span>Acento:</span>
                  <span className="inline-block h-3 w-3 border border-border" style={{ backgroundColor: slide.accent }} />
                  <span className="font-mono text-[9px]">{slide.accent}</span>
                </div>
              )}
            </div>

            <div className="p-4 pt-0 border-t border-[#ECE7DC]/40 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-grow border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-none text-xs uppercase"
                onClick={() => handleOpenEditLookbook(slide)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-grow border-border text-red-500 hover:text-white hover:bg-red-600 rounded-none text-xs uppercase"
                onClick={() => handleDeleteLookbook(slide.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
      {lookbookSlides.length === 0 && (
        <div className="text-center text-muted-foreground py-12 font-light">No hay diapositivas registradas.</div>
      )}

      <LookbookFormModal
        isOpen={isLookbookModalOpen}
        editingLookbook={editingLookbook}
        onClose={() => setIsLookbookModalOpen(false)}
        onSave={handleSaveLookbook}
      />
    </>
  );
}
