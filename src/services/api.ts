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

import type { ScheduleConfig, BusinessSchedule, TimeOff } from '../types';
export type { ScheduleConfig, BusinessSchedule, TimeOff };

export const getSchedules = async (): Promise<ScheduleConfig> => {
  const response = await fetch(`${API_URL}/schedules`);
  if (!response.ok) {
    throw new Error('Error al cargar los horarios');
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Error desconocido');
  }
  return result.data;
};

export const updateBusinessHours = async (token: string, schedules: Omit<BusinessSchedule, 'id'>[]): Promise<BusinessSchedule[]> => {
  const response = await fetch(`${API_URL}/schedules/business-hours`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ schedules }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Error al actualizar horarios');
  return result.data;
};

export const createTimeOff = async (token: string, data: { startDate: string; endDate: string; reason?: string }): Promise<TimeOff> => {
  const response = await fetch(`${API_URL}/schedules/time-offs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Error al crear vacaciones');
  return result.data;
};

export const deleteTimeOff = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/schedules/time-offs/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error?.message || 'Error al eliminar vacaciones');
  }
};
