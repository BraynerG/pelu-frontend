import { useState, useEffect } from 'react';
import { X, Star, Clock, CheckCircle2 } from 'lucide-react';
import type { ServiceItem } from '@/services/api';

interface ServiceQuickViewProps {
  service: ServiceItem;
  onClose: () => void;
  handleOpenModal: (service: ServiceItem, variantId?: string | null) => void;
}

export function ServiceQuickView({
  service,
  onClose,
  handleOpenModal,
}: ServiceQuickViewProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (service.variants && service.variants.length > 0) {
      setSelectedVariantId(service.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [service]);

  const activeVariant = service.variants?.find((v) => v.id === selectedVariantId) || null;
  const displayPrice = activeVariant ? activeVariant.price : service.price;
  const displayDuration = activeVariant ? activeVariant.duration : service.duration;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop Blur Layer */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Trick browser into centering modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Quick View Content Panel */}
        <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-[#ECE7DC] rounded-none animate-fade-in">
          {/* Close Button */}
          <button 
            onClick={onClose}
            aria-label="Cerrar vista rápida"
            title="Cerrar"
            className="absolute top-4 right-4 z-20 h-10 w-10 bg-white hover:bg-[#FAF9F5] text-[#1E1D1A] flex items-center justify-center border border-[#ECE7DC] hover:border-[#1E1D1A] transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side: Gorgeous Visual Banner */}
            <div className="relative aspect-video md:aspect-auto md:h-[550px] bg-[#FAF9F5] overflow-hidden">
              <img 
                src={service.imageUrl || '/images/hero_salon.webp'} 
                alt={service.name}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero_salon.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute bottom-8 left-8 right-8 text-white z-20 space-y-2">
                <span className="text-[9px] tracking-[0.3em] text-[#7A6241] font-bold uppercase">
                  Experiencia Exclusiva
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {service.name}
                </h3>
              </div>
            </div>

            {/* Right Side: Ritual Details & Actions */}
            <div className="p-8 md:p-12 flex flex-col justify-between h-[550px] overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-[#ECE7DC] pb-4">
                  <div>
                    <div className="flex items-center gap-1 text-[#7A6241] mb-1">
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-[10px] text-[#534C43] ml-1 font-sans uppercase font-medium">5.0 (42 opiniones)</span>
                    </div>
                    <span className="text-2xl font-serif font-bold text-[#1E1D1A]">
                      {displayPrice}€
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#534C43] uppercase tracking-wider font-semibold">
                    <Clock className="h-4 w-4 text-[#7A6241]" />
                    <span>{displayDuration} MINUTOS</span>
                  </div>
                </div>

                {/* Variant Selector */}
                {service.variants && service.variants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">OPCIONES DISPONIBLES</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          type="button"
                          className={`px-3 py-1.5 text-xs tracking-wider border transition-all rounded-none ${
                            selectedVariantId === v.id
                              ? 'border-[#7A6241] bg-[#7A6241]/10 text-[#7A6241] font-semibold'
                              : 'border-[#ECE7DC] hover:border-[#1E1D1A] text-[#5C574F]'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">DESCRIPCIÓN DEL RITUAL</h4>
                  <p className="text-xs text-[#5C574F] font-light leading-relaxed">
                    {service.description || 'Una experiencia holística e integral para restaurar tu bienestar y elevar tu estilo.'}
                  </p>
                </div>

                {/* Step-by-Step Details */}
                {service.steps && service.steps.length > 0 && (
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">PASOS DEL TRATAMIENTO</h4>
                    <div className="space-y-2.5">
                      {service.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex gap-3 items-start">
                          <CheckCircle2 className="h-4 w-4 text-[#7A6241] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#5C574F] font-light leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 text-xs tracking-[0.2em] font-semibold border border-[#ECE7DC] hover:border-[#1E1D1A] text-[#5C574F] hover:text-[#1E1D1A] transition-all uppercase rounded-none"
                >
                  Volver
                </button>
                <button 
                  onClick={() => handleOpenModal(service, selectedVariantId)}
                  className="flex-1 py-4 text-xs tracking-[0.2em] font-semibold bg-[#1E1D1A] hover:bg-[#7A6241] text-white transition-all uppercase rounded-none shadow-lg"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
