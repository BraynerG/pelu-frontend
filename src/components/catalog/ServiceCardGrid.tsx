import { Heart, Clock, Star } from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import type { ServiceItem } from '@/services/api';
import type { CategoryTabId } from './CategoryTabs';

interface ServiceCardGridProps {
  activeTab: CategoryTabId;
  handleOpenModal: (service: ServiceItem, variantId?: string | null) => void;
  handleOpenQuickView: (service: ServiceItem) => void;
}

export function ServiceCardGrid({
  activeTab,
  handleOpenModal,
  handleOpenQuickView,
}: ServiceCardGridProps) {
  const { services, favorites, toggleFavorite, loading, error } = useCatalog();

  const getFilteredServices = () => {
    if (activeTab === 'all') return services;
    return services.filter((s) => s.category === activeTab);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-4 border border-[#ECE7DC] p-4 bg-white luxury-shadow-sm">
            <Skeleton className="w-full aspect-[4/3] rounded-none" />
            <div className="space-y-2 flex-grow mt-2">
              <Skeleton className="h-6 w-3/4 rounded-none" />
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="h-4 w-5/6 rounded-none" />
            </div>
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-4 w-1/4 rounded-none" />
              <Skeleton className="h-6 w-1/4 rounded-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 flex-1 rounded-none" />
              <Skeleton className="h-10 flex-1 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-[#993A3A] bg-[#FAF3F3] border border-[#ECDCDC] max-w-md mx-auto">
        <span className="text-sm font-medium uppercase tracking-widest block mb-2">
          Error de Conexión
        </span>
        <p className="text-xs font-light">{error}</p>
      </div>
    );
  }

  const filteredServices = getFilteredServices();

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-20 text-[#534C43] bg-white border border-[#ECE7DC] font-light max-w-lg mx-auto">
        No se han encontrado rituales en este momento.
      </div>
    );
  }

  return (
    <>
      {/* Boutique Cards Grid (Desktop) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => {
          const isFav = favorites.includes(service.id);
          const hasVariants = service.variants && service.variants.length > 0;
          const minPrice = hasVariants ? Math.min(...service.variants!.map((v) => v.price)) : service.price;
          const minDuration = hasVariants ? Math.min(...service.variants!.map((v) => v.duration)) : service.duration;
          const maxDuration = hasVariants ? Math.max(...service.variants!.map((v) => v.duration)) : service.duration;

          return (
            <div 
              key={service.id} 
              className="bg-white border border-[#ECE7DC] transition-all duration-500 hover:border-[#7A6241]/50 group luxury-shadow-sm hover:luxury-shadow flex flex-col justify-between"
            >
              {/* Visual Card Top */}
              <div 
                className="relative overflow-hidden aspect-[4/3] image-scale-container bg-[#FAF9F5] cursor-pointer" 
                onClick={() => handleOpenQuickView(service)}
              >
                <img 
                  src={optimizeCloudinaryUrl(service.imageUrl || '/images/hero_salon.webp')} 
                  alt={service.name}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero_salon.webp';
                  }}
                />
                {/* Favorite Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(service.id);
                  }}
                  aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  className="absolute top-4 right-4 h-9 w-9 bg-white/80 hover:bg-white text-[#1E1D1A] flex items-center justify-center rounded-full transition-all duration-300 z-10 shadow-sm"
                >
                  <Heart className={`h-4.5 w-4.5 transition-colors ${isFav ? 'fill-[#C0392B] text-[#C0392B]' : 'text-[#534C43]'}`} />
                </button>

                {/* Tag Label */}
                <span className="absolute bottom-4 left-4 bg-[#1E1D1A] text-white text-[9px] tracking-widest uppercase font-semibold py-1 px-3">
                  {minPrice >= 80 ? 'PREMIUM RITUAL' : 'RECOMENDADO'}
                </span>
              </div>

              {/* Card Description Content */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 
                      className="text-lg font-serif text-[#1E1D1A] font-semibold group-hover:text-[#7A6241] transition-colors cursor-pointer"
                      onClick={() => handleOpenQuickView(service)}
                    >
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#5C574F] font-light leading-relaxed line-clamp-3">
                    {service.description || 'Una experiencia única diseñada a medida para revitalizar tus sentidos y potenciar tu imagen.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#FAF9F5] flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#534C43] uppercase tracking-wider font-medium">
                    <Clock className="h-3.5 w-3.5 text-[#7A6241]" />
                    <span>
                      {hasVariants ? `${minDuration}-${maxDuration} MIN` : `${service.duration} MIN`}
                    </span>
                    <span className="text-[#ECE7DC]">|</span>
                    <div className="flex items-center text-[#7A6241]">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-1 text-[#1E1D1A]">4.9</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold font-serif text-[#1E1D1A]">
                    {hasVariants ? `Desde ${minPrice}€` : `${service.price}€`}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button 
                  className="flex-1 py-3 text-[10px] tracking-[0.2em] font-medium border border-[#ECE7DC] hover:border-[#1E1D1A] text-[#5C574F] hover:text-[#1E1D1A] transition-all uppercase rounded-none text-center"
                  onClick={() => handleOpenQuickView(service)}
                >
                  Ver Ritual
                </button>
                <button 
                  className="flex-1 py-3 text-[10px] tracking-[0.2em] font-medium bg-[#1E1D1A] hover:bg-[#7A6241] text-white transition-all uppercase rounded-none"
                  onClick={() => handleOpenModal(service, hasVariants ? service.variants![0].id : null)}
                >
                  Reservar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Service List (Mobile) */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredServices.map((service) => {
          const isFav = favorites.includes(service.id);
          const hasVariants = service.variants && service.variants.length > 0;
          const minPrice = hasVariants ? Math.min(...service.variants!.map((v) => v.price)) : service.price;
          const minDuration = hasVariants ? Math.min(...service.variants!.map((v) => v.duration)) : service.duration;
          const maxDuration = hasVariants ? Math.max(...service.variants!.map((v) => v.duration)) : service.duration;

          return (
            <div 
              key={service.id} 
              className="bg-white border border-[#ECE7DC] p-4 flex gap-4 hover:border-[#7A6241]/50 transition-all duration-300 luxury-shadow-sm"
            >
              {/* Left: Square Thumbnail image */}
              <div 
                className="relative w-24 h-24 shrink-0 bg-[#FAF9F5] overflow-hidden cursor-pointer"
                onClick={() => handleOpenQuickView(service)}
              >
                <img 
                  src={optimizeCloudinaryUrl(service.imageUrl || '/images/hero_salon.webp')} 
                  alt={service.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero_salon.webp';
                  }}
                />
                {/* Favorite Icon */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(service.id);
                  }}
                  aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  className="absolute top-1 right-1 h-7 w-7 bg-white/80 hover:bg-white text-[#1E1D1A] flex items-center justify-center rounded-full transition-all duration-300 z-10 shadow-sm"
                >
                  <Heart className={`h-3.5 w-3.5 transition-colors ${isFav ? 'fill-[#C0392B] text-[#C0392B]' : 'text-[#534C43]'}`} />
                </button>
              </div>

              {/* Right: Info & CTA */}
              <div className="flex-grow flex flex-col justify-between min-w-0">
                <div>
                  <div 
                    className="flex justify-between items-start gap-2 cursor-pointer"
                    onClick={() => handleOpenQuickView(service)}
                  >
                    <h3 className="text-sm font-serif font-semibold text-[#1E1D1A] leading-tight truncate">
                      {service.name}
                    </h3>
                    <span className="text-sm font-bold font-serif text-[#1E1D1A] shrink-0">
                      {hasVariants ? `Desde ${minPrice}€` : `${service.price}€`}
                    </span>
                  </div>
                  <p 
                    className="text-[11px] text-[#5C574F] font-light leading-snug line-clamp-2 mt-1 cursor-pointer"
                    onClick={() => handleOpenQuickView(service)}
                  >
                    {service.description || 'Una experiencia única diseñada a medida para potenciar tu imagen.'}
                  </p>
                </div>

                {/* Info Row & Buttons */}
                <div className="pt-2 border-t border-[#FAF9F5] flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1.5 text-[9px] text-[#534C43] uppercase tracking-wider font-semibold">
                    <Clock className="h-3 w-3 text-[#7A6241]" />
                    <span>
                      {hasVariants ? `${minDuration}-${maxDuration} MIN` : `${service.duration} MIN`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="py-1.5 px-3 text-[9px] tracking-wider font-bold border border-[#ECE7DC] hover:border-[#1E1D1A] text-[#5C574F] hover:text-[#1E1D1A] transition-all uppercase rounded-none"
                      onClick={() => handleOpenQuickView(service)}
                    >
                      Ver
                    </button>
                    <button 
                      className="py-1.5 px-3 text-[9px] tracking-wider font-bold bg-[#1E1D1A] hover:bg-[#7A6241] text-white transition-all uppercase rounded-none"
                      onClick={() => handleOpenModal(service, hasVariants ? service.variants![0].id : null)}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
