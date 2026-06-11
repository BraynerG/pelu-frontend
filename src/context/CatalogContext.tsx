import React, { createContext, useState, useContext, useCallback } from 'react';
import { useServicesQuery, useLookbookQuery } from '@/hooks/useQueries';
import type { ServiceItem, LookbookSlide } from '@/services/api';

interface CatalogContextType {
  services: ServiceItem[];
  lookbookSlides: LookbookSlide[];
  loading: boolean;
  error: string | null;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const servicesQuery = useServicesQuery();
  const lookbookQuery = useLookbookQuery();

  const loading = servicesQuery.isLoading || lookbookQuery.isLoading;
  const error = servicesQuery.error?.message || lookbookQuery.error?.message || null;

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  }, []);

  return (
    <CatalogContext.Provider
      value={{
        services: servicesQuery.data ?? [],
        lookbookSlides: lookbookQuery.data ?? [],
        loading,
        error,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
