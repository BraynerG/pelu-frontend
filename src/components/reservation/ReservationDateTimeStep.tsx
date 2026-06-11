import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
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
  getNext14Days: () => Date[];
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
  getNext14Days,
  formatDateKey,
  timeSlots,
  isSlotOccupiedForClient
}: ReservationDateTimeStepProps) {
  return (
    <div className={`space-y-4 md:block md:border-t md:border-[#ECE7DC] md:pt-4 w-full max-w-full overflow-hidden flex flex-col flex-grow min-h-0 md:h-auto md:flex-none ${isActive ? 'block' : 'hidden'}`}>
      <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-[#7A6241]" />
        Fecha y Hora de la Cita
      </Label>

      {/* Day Selector */}
      <div className="space-y-1.5 w-full max-w-full overflow-hidden flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-[#8A8172] font-semibold">1. Selecciona el Día</span>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full max-w-full scrollbar-thin scrollbar-thumb-[#C4B297]">
          {getNext14Days().map((day, idx) => {
            const dayKey = formatDateKey(day);
            const isSelected = selectedDay === dayKey;
            const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
            const dayNum = day.getDate();
            const monthName = day.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedDay(dayKey);
                  setSelectedTime(''); // Reset time when day changes
                }}
                className={`flex flex-col items-center justify-center min-w-[68px] md:min-w-[55px] p-3 md:p-2 border transition-all duration-200 rounded-none ${
                  isSelected
                    ? 'border-[#7A6241] bg-[#7A6241]/5 text-[#7A6241] font-semibold shadow-sm'
                    : 'border-[#ECE7DC] bg-[#FAF9F5] text-[#8A8172] hover:border-[#1E1D1A] hover:text-[#1E1D1A]'
                }`}
              >
                <span className="text-[8px] tracking-widest font-medium opacity-80">{dayName}</span>
                <span className="text-xs font-serif font-bold my-0.5">{dayNum}</span>
                <span className="text-[8px] tracking-widest uppercase font-semibold">{monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selector */}
      {selectedDay && (
        <div className="space-y-1.5 animate-fade-in flex flex-col min-h-0">
          <span className="text-[10px] uppercase tracking-wider text-[#8A8172] font-semibold block flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#7A6241]" />
            2. Selecciona la Hora
          </span>
          {loadingOccupied ? (
            <div className="text-center py-4 text-xs text-[#8A8172] italic font-light">Cargando disponibilidad...</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[180px] md:max-h-[130px] overflow-y-auto pr-1">
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
