import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido (PNG, JPG, WEBP, etc.).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El límite es de 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al subir la imagen');
      }

      if (result.success && result.data?.url) {
        onChange(result.data.url);
      } else {
        throw new Error('No se recibió la URL de la imagen subida.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión al subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && (
        <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">
          {label}
        </label>
      )}
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border transition-all duration-300 rounded-none w-full min-h-[160px] bg-[#FAF9F5] ${
          dragActive 
            ? 'border-[#7A6241] bg-[#BFA37A]/5' 
            : 'border-dashed border-[#ECE7DC] hover:border-[#7A6241]/40'
        } ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
        onClick={!isUploading && !value ? onButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-2 text-[#7A6241]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs tracking-wider font-light uppercase animate-pulse">
              Subiendo imagen a Cloudinary...
            </span>
          </div>
        ) : value ? (
          <div className="relative w-full h-48 overflow-hidden group">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 h-10 px-4 flex items-center gap-1.5 rounded-none text-xs uppercase font-semibold tracking-wider transition-colors shadow-md"
              >
                <X className="h-4 w-4" /> Eliminar Imagen
              </button>
            </div>
            
            {/* Always visible action button on mobile or top right */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-[#1E1D1A]/80 backdrop-blur-sm hover:bg-red-600 text-white p-1.5 rounded-none transition-colors shadow-sm md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="h-10 w-10 flex items-center justify-center text-[#7A6241] bg-[#BFA37A]/10 border border-[#BFA37A]/20">
              <Upload className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#1E1D1A] uppercase tracking-wide">
                Cargar Imagen
              </p>
              <p className="text-[11px] text-[#8A8172] font-light leading-relaxed">
                Arrastra y suelta tu archivo aquí, o <span className="text-[#7A6241] font-medium underline">búscalo en tu equipo</span>
              </p>
              <p className="text-[9px] text-muted-foreground font-light font-mono">
                PNG, JPG, WEBP o GIF (Máx. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-xs p-3 rounded-none font-light animate-fade-in flex items-center justify-between">
          <span>{error}</span>
          <button 
            type="button" 
            onClick={() => setError(null)}
            className="text-[#c62828] hover:text-[#b71c1c]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
