import { useState, useEffect } from 'react';
import { getServices, getLookbookSlides } from './services/api';
import type { ServiceItem, LookbookSlide } from './services/api';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Scissors, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  X,
  Heart,
  Palette,
  Eye
} from 'lucide-react';
import { ReservationForm } from '@/components/ReservationForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

function App() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [lookbookSlides, setLookbookSlides] = useState<LookbookSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Redesign state
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<
    'all' | 'hair-cut' | 'hair-style' | 'hair-color' | 'hair-treatment' | 'hair-straightening' | 'makeup' | 'spa'
  >('hair-cut');
  const [quickViewService, setQuickViewService] = useState<ServiceItem | null>(null);
  const [selectedQuickViewVariant, setSelectedQuickViewVariant] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Auto rotate hero slide
  useEffect(() => {
    if (currentView !== 'catalog' || lookbookSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % lookbookSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentView, lookbookSlides]);

  const handleOpenModal = (service: ServiceItem, variantId?: string | null) => {
    setSelectedService(service);
    setSelectedVariantId(variantId || null);
    setIsModalOpen(true);
    setQuickViewService(null); // Close quick view if open
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setSelectedVariantId(null);
  };

  const handleOpenQuickView = (service: ServiceItem) => {
    setQuickViewService(service);
    if (service.variants && service.variants.length > 0) {
      setSelectedQuickViewVariant(service.variants[0].id);
    } else {
      setSelectedQuickViewVariant(null);
    }
  };

  const fetchData = async () => {
    try {
      const [servicesData, lookbookData] = await Promise.all([
        getServices(),
        getLookbookSlides()
      ]);
      setServices(servicesData);
      setLookbookSlides(lookbookData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter services dynamically by database category field
  const getFilteredServices = () => {
    if (activeTab === 'all') return services;
    return services.filter(s => s.category === activeTab);
  };

  // Toggle favorite list
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const nextHeroSlide = () => {
    if (lookbookSlides.length === 0) return;
    setCurrentHeroSlide((prev) => (prev + 1) % lookbookSlides.length);
  };

  const prevHeroSlide = () => {
    if (lookbookSlides.length === 0) return;
    setCurrentHeroSlide((prev) => (prev - 1 + lookbookSlides.length) % lookbookSlides.length);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1D1A] antialiased">
      {/* Header */}
      <header className="border-b border-[#ECE7DC] bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <Scissors className="h-5 w-5 text-[#C4B297] transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7A6241] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7A6241]"></span>
              </span>
            </div>
            <span className="text-xl font-bold tracking-widest uppercase text-foreground font-serif">
              KAREN MENDEZ <span className="text-[#7A6241] font-light font-sans font-normal">HAIR DESIGNER</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                className="border-[#7A6241] text-[#7A6241] hover:bg-[#7A6241] hover:text-white font-light rounded-none tracking-widest text-xs px-4"
                onClick={() => setCurrentView(currentView === 'catalog' ? 'admin' : 'catalog')}
              >
                {currentView === 'catalog' ? 'PANEL ADMIN' : 'CATÁLOGO'}
              </Button>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#534C43] tracking-wider uppercase font-light hidden md:inline">
                  {user?.name}
                </span>
                <Button 
                  variant="ghost" 
                  className="text-[#534C43] hover:text-[#1E1D1A] font-light text-xs tracking-wider"
                  onClick={logout}
                >
                  SALIR
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="text-[#5C574F] hover:text-[#1E1D1A] font-light text-sm tracking-wider"
                onClick={() => setIsAuthModalOpen(true)}
              >
                ENTRAR
              </Button>
            )}
          </nav>
        </div>
      </header>

      {currentView === 'catalog' ? (
        <>
          {/* Immersive Hero Carousel */}
          <section className="relative h-[85vh] w-full overflow-hidden bg-black">
            {lookbookSlides.map((slide, idx) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  idx === currentHeroSlide ? 'opacity-70' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img 
                  src={slide.url} 
                  alt={slide.title}
                  loading={idx === 0 ? "eager" : "lazy"}
                  {...({ fetchpriority: idx === 0 ? "high" : "low" } as any)}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms] ease-out"
                />
              </div>
            ))}

            {/* Dark elegant mask overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-black/35 to-black/20 z-10" />

            {/* Slide Content Overlay */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="container mx-auto px-6 max-w-6xl w-full flex flex-col items-start text-white">
                {lookbookSlides.length > 0 && (
                  <div className="space-y-4 max-w-2xl animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-[#7A6241]/25 backdrop-blur-md border border-[#7A6241]/40 px-3 py-1 text-[10px] tracking-[0.3em] text-[#F3EDE2] uppercase">
                      <Sparkles className="h-3 w-3 text-[#7A6241]" />
                      <span>{lookbookSlides[currentHeroSlide]?.tag}</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight font-serif text-white leading-none">
                      {lookbookSlides[currentHeroSlide]?.title}
                    </h1>
                    <p className="text-base md:text-lg text-[#EDE6D7] font-light max-w-xl leading-relaxed font-sans">
                      {lookbookSlides[currentHeroSlide]?.subtitle}
                    </p>
                    <div className="pt-6">
                      <button 
                        onClick={() => {
                          const target = document.getElementById('catalog-services');
                          target?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group bg-white hover:bg-[#7A6241] text-[#1E1D1A] hover:text-white font-medium tracking-[0.2em] text-xs py-4 px-8 rounded-none transition-all duration-300 flex items-center gap-3 uppercase shadow-lg"
                      >
                        Explorar Rituales
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Controls */}
            <div className="absolute bottom-12 right-6 md:right-12 z-20 flex items-center gap-3">
              <button 
                onClick={prevHeroSlide}
                aria-label="Ver imagen anterior"
                title="Diapositiva anterior"
                className="h-12 w-12 border border-white/20 hover:border-white text-white flex items-center justify-center rounded-none bg-black/20 hover:bg-white/10 backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextHeroSlide}
                aria-label="Ver imagen siguiente"
                title="Diapositiva siguiente"
                className="h-12 w-12 border border-white/20 hover:border-white text-white flex items-center justify-center rounded-none bg-black/20 hover:bg-white/10 backdrop-blur-sm transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Hero Indicators */}
            <div className="absolute bottom-14 left-6 md:left-12 z-20 flex items-center gap-2">
              {lookbookSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroSlide(idx)}
                  aria-label={`Ver diapositiva ${idx + 1}`}
                  className={`h-[3px] transition-all duration-500 rounded-none ${
                    idx === currentHeroSlide ? 'w-10 bg-[#7A6241]' : 'w-4 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Boutique Brand Intro */}
          <section className="bg-white py-20 border-b border-[#ECE7DC]">
            <div className="container mx-auto px-6 max-w-4xl text-center space-y-6">
              <span className="text-[11px] tracking-[0.4em] text-[#7A6241] font-medium uppercase block">
                Filosofía de Bienestar
              </span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#1E1D1A]">
                Alta Estética en Clave Minimalista
              </h2>
              <div className="h-[1px] w-16 bg-[#7A6241] mx-auto my-4" />
              <p className="text-base text-[#5C574F] font-light leading-relaxed max-w-2xl mx-auto">
                El salón boutique de Karen Mendez ofrece un refugio de diseño concebido para esculpir tu estilo de autor, 
                cuidar la salud de tu fibra capilar y mimar tu piel con exclusividad. 
                Fórmulas orgánicas seleccionadas y técnicas avanzadas de alta peluquería en un ambiente de total serenidad.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto text-left">
                <div className="flex gap-4 items-start p-4">
                  <ShieldCheck className="h-6 w-6 text-[#7A6241] shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm tracking-wide uppercase">Cuidado Limpio</h3>
                    <p className="text-xs text-[#534C43] font-light mt-1">Cosmética 100% orgánica certificada de alta eficacia.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4">
                  <Sparkles className="h-6 w-6 text-[#7A6241] shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm tracking-wide uppercase">Diagnóstico Previo</h3>
                    <p className="text-xs text-[#534C43] font-light mt-1">Estudio integral morfológico previo a cada servicio.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4">
                  <Clock className="h-6 w-6 text-[#7A6241] shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm tracking-wide uppercase">Atención sin Prisas</h3>
                    <p className="text-xs text-[#534C43] font-light mt-1">Asignamos tiempo generoso para mimarte en total exclusividad.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shop/Catalog Section */}
          <section id="catalog-services" className="container mx-auto px-6 py-20 max-w-6xl scroll-mt-20">
            <div className="text-center mb-16 space-y-4">
              <span className="text-[11px] tracking-[0.4em] text-[#7A6241] font-semibold uppercase block">
                Nuestra Colección
              </span>
              <h2 className="text-4xl font-serif text-foreground uppercase tracking-wider">
                Menú de Experiencias
              </h2>
              <p className="text-[#534C43] text-sm font-light max-w-md mx-auto">
                Selecciona la categoría y haz clic en los rituales para conocer los pasos o realizar tu reserva online instantánea.
              </p>
            </div>

            {/* Category Filter Tabs - Desktop */}
            <div className="hidden md:flex justify-center border-b border-[#ECE7DC] mb-12 overflow-x-auto whitespace-nowrap scrollbar-none">
              <div className="flex gap-8">
                {[
                  { id: 'all', label: 'TODOS' },
                  { id: 'hair-cut', label: 'CORTES' },
                  { id: 'hair-style', label: 'PEINADOS & NOVIAS' },
                  { id: 'hair-color', label: 'COLOR & MECHAS' },
                  { id: 'hair-treatment', label: 'TRATAMIENTOS & BOTOX' },
                  { id: 'hair-straightening', label: 'ALISADOS' },
                  { id: 'makeup', label: 'MAQUILLAJE & MIRADA' },
                  { id: 'spa', label: 'FACIAL & SPA' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-xs tracking-[0.25em] font-medium transition-all duration-300 relative rounded-none ${
                      activeTab === tab.id 
                        ? 'text-[#1E1D1A]' 
                        : 'text-[#534C43] hover:text-[#1E1D1A]'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241] animate-fade-in" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Tabs - Mobile */}
            <div className="relative md:hidden mb-8 w-full">
              {/* Fade overlays to indicate scrolling */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#FAF9F5] to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#FAF9F5] to-transparent pointer-events-none z-10" />
              
              <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none snap-x snap-mandatory">
                {[
                  { id: 'all', label: 'TODOS', icon: Sparkles },
                  { id: 'hair-cut', label: 'CORTES', icon: Scissors },
                  { id: 'hair-style', label: 'PEINADOS', icon: Heart },
                  { id: 'hair-color', label: 'COLOR', icon: Palette },
                  { id: 'hair-treatment', label: 'TRATAMIENTOS', icon: Sparkles },
                  { id: 'hair-straightening', label: 'ALISADOS', icon: Scissors },
                  { id: 'makeup', label: 'MAQUILLAJE', icon: Eye },
                  { id: 'spa', label: 'SPA & FACIAL', icon: Heart }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-[10px] tracking-wider font-semibold border transition-all duration-300 rounded-none shrink-0 snap-align-start min-h-[44px] ${
                        isActive
                          ? 'border-[#7A6241] bg-[#7A6241] text-white shadow-sm'
                          : 'border-[#ECE7DC] bg-white text-[#534C43]'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#7A6241]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading && (
              <div className="text-center py-20 text-[#534C43] font-light tracking-widest animate-pulse">
                Consultando el libro de rituales...
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-[#993A3A] bg-[#FAF3F3] border border-[#ECDCDC] max-w-md mx-auto">
                <span className="text-sm font-medium uppercase tracking-widest block mb-2">Error de Conexión</span>
                <p className="text-xs font-light">{error}</p>
              </div>
            )}

            {!loading && !error && services.length === 0 && (
              <div className="text-center py-20 text-[#534C43] bg-white border border-[#ECE7DC] font-light max-w-lg mx-auto">
                No se han encontrado rituales en este momento.
              </div>
            )}

            {/* Boutique Cards Grid (Desktop) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getFilteredServices().map((service) => {
                const isFav = favorites.includes(service.id);
                return (
                  <div 
                    key={service.id} 
                    className="bg-white border border-[#ECE7DC] transition-all duration-500 hover:border-[#7A6241]/50 group luxury-shadow-sm hover:luxury-shadow flex flex-col justify-between"
                  >
                    {/* Visual Card Top */}
                    <div className="relative overflow-hidden aspect-[4/3] image-scale-container bg-[#FAF9F5] cursor-pointer" onClick={() => handleOpenQuickView(service)}>
                      <img 
                        src={service.imageUrl || '/images/hero_salon.webp'} 
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
                        {service.price >= 80 || (service.variants && service.variants.some(v => v.price >= 80)) ? 'PREMIUM RITUAL' : 'RECOMENDADO'}
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
                            {service.variants && service.variants.length > 0 ? (
                              `${Math.min(...service.variants.map(v => v.duration))}-${Math.max(...service.variants.map(v => v.duration))} MIN`
                            ) : (
                              `${service.duration} MIN`
                            )}
                          </span>
                          <span className="text-[#ECE7DC]">|</span>
                          <div className="flex items-center text-[#7A6241]">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="ml-1 text-[#1E1D1A]">4.9</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold font-serif text-[#1E1D1A]">
                          {service.variants && service.variants.length > 0 ? (
                            `Desde ${Math.min(...service.variants.map(v => v.price))}€`
                          ) : (
                            `${service.price}€`
                          )}
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
                        onClick={() => handleOpenModal(service, service.variants && service.variants.length > 0 ? service.variants[0].id : null)}
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
              {getFilteredServices().map((service) => {
                const isFav = favorites.includes(service.id);
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
                        src={service.imageUrl || '/images/hero_salon.webp'} 
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
                            {service.variants && service.variants.length > 0 ? (
                              `Desde ${Math.min(...service.variants.map(v => v.price))}€`
                            ) : (
                              `${service.price}€`
                            )}
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
                            {service.variants && service.variants.length > 0 ? (
                              `${Math.min(...service.variants.map(v => v.duration))}-${Math.max(...service.variants.map(v => v.duration))} MIN`
                            ) : (
                              `${service.duration} MIN`
                            )}
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
                            onClick={() => handleOpenModal(service, service.variants && service.variants.length > 0 ? service.variants[0].id : null)}
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
          </section>

          {/* Luxury Customer Results Lookbook (Carousel 2) */}
          <section className="bg-[#FAF9F5] py-20 border-t border-b border-[#ECE7DC]">
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] tracking-[0.4em] text-[#7A6241] font-semibold uppercase block">
                    Resultados de Autor
                  </span>
                  <h2 className="text-3xl font-serif tracking-tight text-[#1E1D1A]">
                    Lookbook de Autor
                  </h2>
                </div>
                <p className="text-xs text-[#534C43] font-light max-w-sm">
                  Colección de acabados reales de nuestros estilistas y profesionales. Cada look es diseñado respetando la identidad única de la persona.
                </p>
              </div>

              {/* Lookbook Horizontal List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { tag: 'Rubios de Lujo', name: 'Balayage Melocotón & Oro', img: '/images/service_balayage.webp' },
                  { tag: 'Corte Geométrico', name: 'Bob Esculpido con Flequillo', img: '/images/service_haircut.webp' },
                  { tag: 'Dermoestética', name: 'Ritual Facial Anti-Fatiga', img: '/images/service_facial.webp' },
                  { tag: 'Glow Makeup', name: 'Maquillaje de Ocasión Natural', img: '/images/service_makeup.webp' }
                ].map((look, i) => (
                  <div key={i} className="relative group overflow-hidden border border-[#ECE7DC] bg-white cursor-pointer">
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img 
                        src={look.img} 
                        alt={look.name}
                        loading="lazy"
                        width={300}
                        height={400}
                        className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                        <span className="text-[9px] tracking-widest text-[#7A6241] font-semibold uppercase">{look.tag}</span>
                        <h3 className="text-white font-serif text-sm mt-1">{look.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <AdminDashboard services={services} lookbookSlides={lookbookSlides} onServicesChange={fetchData} />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#ECE7DC] bg-white py-16">
        <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-12 text-[#5C574F]">
          <div className="space-y-4">
            <span className="text-lg font-serif font-bold tracking-widest text-[#1E1D1A] uppercase">
              KAREN MENDEZ <span className="text-[#7A6241] font-sans font-light">HAIR DESIGNER</span>
            </span>
            <p className="text-xs font-light leading-relaxed max-w-xs">
              Tu destino de belleza, alta peluquería y cuidado holístico premium bajo la dirección de Karen Mendez.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">HORARIO</h4>
            <div className="text-xs font-light space-y-1.5">
              <p>Lunes: Cerrado</p>
              <p>Martes - Viernes: 10:00h a 19:00h</p>
              <p>Sábados: 10:00h a 15:00h</p>
              <p>Domingos: Cerrado</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">DIRECCIÓN</h4>
            <div className="text-xs font-light space-y-1.5">
              <p>Calle Jiménez e Iglesias, 3</p>
              <p>28903 Getafe, Madrid</p>
              <p>Tlf: +34 603 120 838</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 max-w-6xl mt-12 pt-8 border-t border-[#FAF9F5] text-center text-[#534C43] text-[10px] tracking-widest font-light">
          <p>&copy; 2026 KAREN MENDEZ | HAIR DESIGNER. CONCEBIDO CON RIGOR Y DISTINCIÓN. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </footer>

      {/* Reservation Form Modal */}
      {selectedService && (
        <ReservationForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          serviceId={selectedService.id}
          serviceName={selectedService.name}
          serviceDuration={selectedService.duration}
          initialVariantId={selectedVariantId}
          variants={selectedService.variants || []}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Service Quick-View Luxury Drawer Modal */}
      {quickViewService && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop Blur Layer */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
              aria-hidden="true"
              onClick={() => setQuickViewService(null)}
            />

            {/* Trick browser into centering modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Quick View Content Panel */}
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-[#ECE7DC] rounded-none animate-fade-in">
              {/* Close Button */}
              <button 
                onClick={() => setQuickViewService(null)}
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
                    src={quickViewService.imageUrl || '/images/hero_salon.webp'} 
                    alt={quickViewService.name}
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
                      {quickViewService.name}
                    </h3>
                  </div>
                </div>

                {/* Right Side: Ritual Details & Actions */}
                {(() => {
                  const activeVariant = quickViewService.variants?.find(v => v.id === selectedQuickViewVariant) || null;
                  const displayPrice = activeVariant ? activeVariant.price : quickViewService.price;
                  const displayDuration = activeVariant ? activeVariant.duration : quickViewService.duration;
                  
                  return (
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
                        {quickViewService.variants && quickViewService.variants.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">OPCIONES DISPONIBLES</h4>
                            <div className="flex flex-wrap gap-2">
                              {quickViewService.variants.map((v) => (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedQuickViewVariant(v.id)}
                                  type="button"
                                  className={`px-3 py-1.5 text-xs tracking-wider border transition-all rounded-none ${
                                    selectedQuickViewVariant === v.id
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
                            {quickViewService.description || 'Una experiencia holística e integral para restaurar tu bienestar y elevar tu estilo.'}
                          </p>
                        </div>

                        {/* Step-by-Step Details */}
                        {quickViewService.steps && quickViewService.steps.length > 0 && (
                          <div className="space-y-3.5">
                            <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">PASOS DEL TRATAMIENTO</h4>
                            <div className="space-y-2.5">
                              {quickViewService.steps.map((step, stepIdx) => (
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
                          onClick={() => setQuickViewService(null)}
                          className="flex-1 py-4 text-xs tracking-[0.2em] font-semibold border border-[#ECE7DC] hover:border-[#1E1D1A] text-[#5C574F] hover:text-[#1E1D1A] transition-all uppercase rounded-none"
                        >
                          Volver
                        </button>
                        <button 
                          onClick={() => handleOpenModal(quickViewService, selectedQuickViewVariant)}
                          className="flex-1 py-4 text-xs tracking-[0.2em] font-semibold bg-[#1E1D1A] hover:bg-[#7A6241] text-white transition-all uppercase rounded-none shadow-lg"
                        >
                          Reservar Ahora
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
