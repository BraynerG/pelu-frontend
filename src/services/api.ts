export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { ServiceVariant, ServiceItem, LookbookSlide, OccupiedSlot } from '../types';
export type { ServiceVariant, ServiceItem, LookbookSlide, OccupiedSlot };

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

export const getOccupiedSlots = async (): Promise<OccupiedSlot[]> => {
  const response = await fetch(`${API_URL}/reservations/occupied`);
  if (!response.ok) {
    throw new Error('Error al cargar la disponibilidad de citas');
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Error desconocido');
  }
  return result.data;
};
