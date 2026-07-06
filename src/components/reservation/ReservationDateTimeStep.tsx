import { Label } from '@/components/ui/label';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import type { FormValues } from '@/hooks/useReservationForm';

interface ReservationDateTimeStepProps {
  isActive: boolean;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  loadingOccupied: boolean;
  activeDuration: number;
  errors: FieldErrors<FormValues>;
  currentMonthDate: Date;
  nextMonth: () => void;
  prevMonth: () => void;
  getCalendarDays: () => { date: Date; isCurrentMonth: boolean }[];
  formatDateKey: (d: Date) => string;
  timeSlots: string[];
  isSlotOccupiedForClient: (dayStr: string, timeStr: string, duration: number) => boolean;
}

export function ReservationDateTimeStep({
  isActive,
  selectedDay,
  setSelectedDay,
  selectedTime,
  setSelectedTime,
  loadingOccupied,
  activeDuration,
  errors,
  currentMonthDate,
  nextMonth,
  prevMonth,
  getCalendarDays,
  formatDateKey,
  timeSlots,
  isSlotOccupiedForClient
}: ReservationDateTimeStepProps) {
  const todayDateKey = formatDateKey(new Date());
  return (
    <div className={`space-y-4 md:block md:border-t md:border-[#ECE7DC] md:pt-4 w-full max-w-full overflow-hidden flex flex-col flex-grow min-h-0 md:h-auto md:flex-none ${isActive ? 'block' : 'hidden'}`}>
      <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-[#7A6241]" />
        Fecha y Hora de la Cita
      </Label>

      {/* Day Selector */}
      <div className="space-y-2 w-full max-w-full overflow-hidden flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-[#8A8172] font-semibold">1. Selecciona el Día</span>
        
        <div className="border border-[#ECE7DC] bg-[#FAF9F5] p-3 md:p-4 rounded-none">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button" 
              onClick={prevMonth}
              className="p-1 hover:bg-[#ECE7DC] transition-colors rounded-none text-[#8A8172]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-serif font-bold text-[#1E1D1A] uppercase tracking-widest">
              {currentMonthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              type="button" 
              onClick={nextMonth}
              className="p-1 hover:bg-[#ECE7DC] transition-colors rounded-none text-[#8A8172]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
              <span key={day} className="text-[10px] font-semibold text-[#8A8172]">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {getCalendarDays().map((dayObj, idx) => {
              const dayKey = formatDateKey(dayObj.date);
              const isSelected = selectedDay === dayKey;
              const isPast = dayKey < todayDateKey;
              
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast || !dayObj.isCurrentMonth}
                  onClick={() => {
                    setSelectedDay(dayKey);
                    setSelectedTime('');
                  }}
                  className={`aspect-square flex items-center justify-center text-xs font-serif transition-all duration-200 rounded-none ${
                    !dayObj.isCurrentMonth 
                      ? 'text-transparent cursor-default' 
                      : isPast
                        ? 'text-[#C4B297]/50 cursor-not-allowed line-through decoration-[#C4B297]/30'
                        : isSelected
                          ? 'bg-[#7A6241] text-white font-bold shadow-sm'
                          : 'bg-white border border-[#ECE7DC] text-[#1E1D1A] hover:border-[#1E1D1A]'
                  }`}
                >
                  {dayObj.isCurrentMonth ? dayObj.date.getDate() : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Selector */}
      {selectedDay && (
        <div className="space-y-1.5 animate-fade-in flex flex-col mt-4">
          <span className="text-[10px] uppercase tracking-wider text-[#8A8172] font-semibold block flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#7A6241]" />
            2. Selecciona la Hora
          </span>
          {loadingOccupied ? (
            <div className="text-center py-4 text-xs text-[#8A8172] italic font-light">Cargando disponibilidad...</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const occupied = isSlotOccupiedForClient(selectedDay, slot, activeDuration);
                const isSelected = selectedTime === slot;
                
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={occupied}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 md:py-1.5 text-xs md:text-[10px] tracking-wider border text-center transition-all duration-150 rounded-none min-h-[40px] flex items-center justify-center flex-col ${
                      occupied
                        ? 'bg-[#E5E5E5]/20 text-[#A3A3A3] border-dashed border-[#ECE7DC] cursor-not-allowed line-through'
                        : isSelected
                          ? 'border-[#7A6241] bg-[#7A6241] text-white font-bold'
                          : 'border-[#ECE7DC] text-[#1E1D1A] bg-white hover:border-[#1E1D1A]'
                    }`}
                  >
                    <span>{slot}</span>
                    {occupied && <span className="text-[6.5px] text-[#C62828] font-bold tracking-tight not-italic">Ocupado</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedDay && selectedTime && (
        <div className="bg-[#FAF3F3] border border-[#ECE7DC] p-3 text-xs text-center rounded-none animate-fade-in mt-auto md:mt-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8172] block mb-0.5">Fecha y Hora Seleccionada</span>
          <p className="font-serif font-bold text-[#1E1D1A]">
            {(() => {
              const [year, month, day] = selectedDay.split('-').map(Number);
              const dateObj = new Date(year, month - 1, day);
              return dateObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              });
            })()}{' '}
            a las <span className="font-mono text-[#7A6241]">{selectedTime}h</span>
          </p>
        </div>
      )}
      
      {errors.date && (
        <p className="text-red-500 text-xs font-light">{errors.date?.message?.toString()}</p>
      )}
    </div>
  );
}
