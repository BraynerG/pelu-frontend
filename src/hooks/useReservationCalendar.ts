import { useState } from 'react';
import { useOccupiedSlotsQuery } from '@/hooks/useQueries';

export function useReservationCalendar(isOpen: boolean) {
  const { data: occupiedSlots = [], isLoading: loadingOccupied } = useOccupiedSlotsQuery(isOpen);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const isSlotOccupiedForClient = (dayStr: string, timeStr: string, serviceDurationMins: number) => {
    const [year, month, day] = dayStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const slotStart = new Date(year, month - 1, day, hours, minutes).getTime();
    const slotEnd = slotStart + serviceDurationMins * 60000;

    return occupiedSlots.some((occupied) => {
      const resStart = new Date(occupied.date).getTime();
      const resEnd = resStart + occupied.duration * 60000;

      return slotStart < resEnd && slotEnd > resStart;
    });
  };

  const resetCalendar = () => {
    setSelectedDay('');
    setSelectedTime('');
  };

  return {
    occupiedSlots,
    loadingOccupied,
    selectedDay,
    setSelectedDay,
    selectedTime,
    setSelectedTime,
    getNext14Days,
    formatDateKey,
    timeSlots,
    isSlotOccupiedForClient,
    resetCalendar
  };
}
