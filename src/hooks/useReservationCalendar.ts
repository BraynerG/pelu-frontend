import { useState } from 'react';
import { useOccupiedSlotsQuery } from '@/hooks/useQueries';
import { useSchedulesQuery } from '@/hooks/useSchedules';

export function useReservationCalendar(isOpen: boolean) {
  const { data: occupiedSlots = [], isLoading: loadingOccupied } = useOccupiedSlotsQuery(isOpen);
  const { data: scheduleConfig, isLoading: loadingSchedule } = useSchedulesQuery();
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const nextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const getCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // getDay() is 0 for Sunday, 1 for Monday. Map to Monday=0, Sunday=6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    
    const days = [];
    
    // Previous month padding
    for (let i = startDayOfWeek; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
    }
    
    // Current month days
    const daysInMonth = lastDayOfMonth.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month padding to ensure a consistent grid (always 6 rows of 7 days = 42 cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const getDaySchedule = (dayStr: string) => {
    if (!scheduleConfig) return null;
    const [year, month, day] = dayStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const isTimeOff = scheduleConfig.timeOffs.some(to => {
      // Set to midnight to include the full days
      const start = new Date(to.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to.endDate);
      end.setHours(23, 59, 59, 999);
      const current = dateObj.getTime();
      return current >= start.getTime() && current <= end.getTime();
    });

    if (isTimeOff) return { isClosed: true, timeSlots: [] };

    const businessHours = scheduleConfig.businessHours.find(b => b.dayOfWeek === dayOfWeek);
    if (!businessHours || businessHours.isClosed) return { isClosed: true, timeSlots: [] };

    return { isClosed: false, startTime: businessHours.startTime, endTime: businessHours.endTime };
  };

  const timeSlots = selectedDay ? (() => {
    const schedule = getDaySchedule(selectedDay);
    if (!schedule || schedule.isClosed) return [];

    const slots = [];
    let [currentH, currentM] = schedule.startTime!.split(':').map(Number);
    const [endH, endM] = schedule.endTime!.split(':').map(Number);

    while (currentH < endH || (currentH === endH && currentM <= endM)) {
      slots.push(`${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
      currentM += 30;
      if (currentM >= 60) {
        currentH += 1;
        currentM -= 60;
      }
    }
    return slots;
  })() : [];

  const isSlotOccupiedForClient = (dayStr: string, timeStr: string, serviceDurationMins: number) => {
    const schedule = getDaySchedule(dayStr);
    if (!schedule || schedule.isClosed) return true;

    const [year, month, day] = dayStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const slotStart = new Date(year, month - 1, day, hours, minutes).getTime();
    const slotEnd = slotStart + serviceDurationMins * 60000;

    const [endH, endM] = schedule.endTime!.split(':').map(Number);
    const dayEndTime = new Date(year, month - 1, day, endH, endM).getTime();
    if (slotEnd > dayEndTime) return true;

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
    loadingSchedule,
    selectedDay,
    setSelectedDay,
    selectedTime,
    setSelectedTime,
    currentMonthDate,
    nextMonth,
    prevMonth,
    getCalendarDays,
    formatDateKey,
    timeSlots,
    getDaySchedule,
    isSlotOccupiedForClient,
    resetCalendar
  };
}
