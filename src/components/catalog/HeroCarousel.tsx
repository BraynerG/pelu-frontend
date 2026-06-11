import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import type { LookbookSlide } from '@/services/api';

interface HeroCarouselProps {
  lookbookSlides: LookbookSlide[];
  currentHeroSlide: number;
  nextHeroSlide: () => void;
  prevHeroSlide: () => void;
  goToSlide: (index: number) => void;
}

export function HeroCarousel({
  lookbookSlides,
  currentHeroSlide,
  nextHeroSlide,
  prevHeroSlide,
  goToSlide,
}: HeroCarouselProps) {
  const handleScrollToServices = () => {
    const target = document.getElementById('catalog-services');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black">
      {lookbookSlides.map((slide, idx) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentHeroSlide ? 'opacity-70' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img 
            src={optimizeCloudinaryUrl(slide.url)} 
            alt={slide.title}
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "low"}
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
                  onClick={handleScrollToServices}
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
            onClick={() => goToSlide(idx)}
            aria-label={`Ver diapositiva ${idx + 1}`}
            className={`h-[3px] transition-all duration-500 rounded-none ${
              idx === currentHeroSlide ? 'w-10 bg-[#7A6241]' : 'w-4 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
