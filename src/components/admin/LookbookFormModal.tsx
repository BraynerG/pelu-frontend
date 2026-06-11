import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ImageUpload';
import { X } from 'lucide-react';
import type { LookbookSlide } from '@/services/api';

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
  const [lookbookTitle, setLookbookTitle] = useState('');
  const [lookbookSubtitle, setLookbookSubtitle] = useState('');
  const [lookbookTag, setLookbookTag] = useState('');
  const [lookbookUrl, setLookbookUrl] = useState('');
  const [lookbookAccent, setLookbookAccent] = useState('');

  useEffect(() => {
    if (editingLookbook) {
      setLookbookTitle(editingLookbook.title);
      setLookbookSubtitle(editingLookbook.subtitle || '');
      setLookbookTag(editingLookbook.tag);
      setLookbookUrl(editingLookbook.url);
      setLookbookAccent(editingLookbook.accent || '');
    } else {
      setLookbookTitle('');
      setLookbookSubtitle('');
      setLookbookTag('');
      setLookbookUrl('');
      setLookbookAccent('');
    }
  }, [editingLookbook, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookbookTitle || !lookbookUrl || !lookbookTag) {
      alert('Título, imagen y etiqueta son obligatorios');
      return;
    }

    const payload = {
      title: lookbookTitle,
      subtitle: lookbookSubtitle,
      tag: lookbookTag,
      url: lookbookUrl,
      accent: lookbookAccent || null,
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
        <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none animate-fade-in fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col">
          {/* Mobile drag handle */}
          <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mt-4 sm:hidden shrink-0" />
          
          <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] font-serif">
              {editingLookbook ? 'Editar Diapositiva Hero' : 'Nueva Diapositiva Hero'}
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
              {/* Tag */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Etiqueta (Tag)</label>
                <Input
                  required
                  value={lookbookTag}
                  onChange={(e) => setLookbookTag(e.target.value)}
                  placeholder="Ej. NUEVA COLECCIÓN"
                  className="bg-white border-border text-xs rounded-none"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Título Principal</label>
                <Input
                  required
                  value={lookbookTitle}
                  onChange={(e) => setLookbookTitle(e.target.value)}
                  placeholder="Ej. Estilo Esculpido"
                  className="bg-white border-border text-xs rounded-none"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Subtítulo</label>
                <textarea
                  rows={2}
                  value={lookbookSubtitle}
                  onChange={(e) => setLookbookSubtitle(e.target.value)}
                  placeholder="Ej. Cortes geométricos de alta precisión que respetan el movimiento natural del cabello..."
                  className="w-full bg-white border border-border text-xs rounded-none p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-light leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUpload
                  label="Imagen de Fondo"
                  value={lookbookUrl}
                  onChange={setLookbookUrl}
                />
              </div>

              {/* Accent (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Color de Acento (Hexadecimal Opcional)</label>
                <Input
                  value={lookbookAccent}
                  onChange={(e) => setLookbookAccent(e.target.value)}
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
                className="flex-grow bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
              >
                Guardar Diapositiva
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
