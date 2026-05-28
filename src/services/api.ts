export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string | null;
  category: string;
  steps: string[];
}

export interface LookbookSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  tag: string;
  accent?: string | null;
}

export const getServices = async (): Promise<ServiceItem[]> => {
  const response = await fetch(`${API_URL}/services`);
  if (!response.ok) {
    throw new Error('Error al cargar los servicios');
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Error desconocido');
  }
  return result.data;
};

export const getLookbookSlides = async (): Promise<LookbookSlide[]> => {
  const response = await fetch(`${API_URL}/services/lookbook`);
  if (!response.ok) {
    throw new Error('Error al cargar las diapositivas de Lookbook');
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Error desconocido');
  }
  return result.data;
};
