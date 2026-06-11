import { useState, useEffect, useCallback } from 'react';

export function useHeroCarousel(slidesCount: number, isCatalogView: boolean) {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    if (!isCatalogView || slidesCount === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % slidesCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCatalogView, slidesCount]);

  const nextHeroSlide = useCallback(() => {
    if (slidesCount === 0) return;
    setCurrentHeroSlide((prev) => (prev + 1) % slidesCount);
  }, [slidesCount]);

  const prevHeroSlide = useCallback(() => {
    if (slidesCount === 0) return;
    setCurrentHeroSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  }, [slidesCount]);

  const goToSlide = useCallback((index: number) => {
    setCurrentHeroSlide(index);
  }, []);

  return {
    currentHeroSlide,
    nextHeroSlide,
    prevHeroSlide,
    goToSlide,
  };
}
