import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { ServiceItem } from '@/services/api';
import type { Reservation } from '@/hooks/useReservations';

interface RescheduleModalProps {
  reschedulingId: string;
  reservations: Reservation[];
  services: ServiceItem[];
  selectedRescheduleDay: string;
  setSelectedRescheduleDay: (day: string) => void;
  selectedRescheduleTime: string;
  setSelectedRescheduleTime: (time: string) => void;
  onClose: () => void;
  handleReschedule: (id: string, dateToUse: string) => void | Promise<void>;
}

export function RescheduleModal({
  reschedulingId,
  reservations,
  services,
  selectedRescheduleDay,
  setSelectedRescheduleDay,
  selectedRescheduleTime,
  setSelectedRescheduleTime,
  onClose,
  handleReschedule,
}: RescheduleModalProps) {
  useEffect(() => {
    if (reschedulingId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [reschedulingId]);

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

  const isSlotOccupied = (dayStr: string, timeStr: string, currentResId: string) => {
    return reservations.some((res) => {
      if (res.id === currentResId) return false;
      if (res.status === 'CANCELLED') return false;
      
      const resDate = new Date(res.date);
      const resYear = resDate.getFullYear();
      const resMonth = String(resDate.getMonth() + 1).padStart(2, '0');
      const resDay = String(resDate.getDate()).padStart(2, '0');
      const resDayStr = `${resYear}-${resMonth}-${resDay}`;
      
      const resHours = String(resDate.getHours()).padStart(2, '0');
      const resMinutes = String(resDate.getMinutes()).padStart(2, '0');
      const resTimeStr = `${resHours}:${resMinutes}`;
      
      return resDayStr === dayStr && resTimeStr === timeStr;
    });
  };

  const res = reservations.find((r) => r.id === reschedulingId);
  if (!res) return null;
  const service = services.find((s) => s.id === res.serviceId);
  const variant = service?.variants?.find((v) => v.id === res.variantId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4 text-center">
        {/* Backdrop Layer */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
          aria-hidden="true"
          onClick={onClose} 
        />
        
        {/* Modal Content Panel */}
        <div className="relative bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none p-6 sm:p-8 animate-fade-in flex flex-col z-10">
          {/* Mobile drag handle */}
          <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mb-4 sm:hidden shrink-0" />
          
          <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] mb-4 font-serif pb-2 border-b border-[#ECE7DC] shrink-0">
            Programar / Reagendar Cita
          </h3>
          
          {/* Scrollable Modal Content */}
          <div className="space-y-4 flex-grow overflow-y-auto min-h-0 pr-1 pb-4">
            <div className="bg-[#FAF9F5] border border-[#ECE7DC] p-3 text-xs space-y-1.5 rounded-none">
              <div>
                <span className="text-[#8A8172] font-semibold uppercase tracking-wider text-[9px]">Cliente:</span>{' '}
                {res.customerName}
              </div>
              <div>
                <span className="text-[#8A8172] font-semibold uppercase tracking-wider text-[9px]">Servicio:</span>{' '}
                {service?.name} {variant && `(${variant.name})`}
              </div>
              <div>
                <span className="text-[#8A8172] font-semibold uppercase tracking-wider text-[9px]">Fecha actual:</span>{' '}
                {new Date(res.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>

            {/* Date Selector */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#1E1D1A] block">
                1. Selecciona el Día
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {getNext14Days().map((day, idx) => {
                  const dayKey = formatDateKey(day);
                  const isSelected = selectedRescheduleDay === dayKey;
                  const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
                  const dayNum = day.getDate();
                  const monthName = day.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRescheduleDay(dayKey)}
                      className={`flex flex-col items-center justify-center min-w-[65px] p-3 border transition-all duration-200 rounded-none snap-align-start ${
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

            {/* Time Slot Selector */}
            {selectedRescheduleDay && (
              <div className="space-y-2 animate-fade-in flex flex-col min-h-0">
                <label className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#1E1D1A] block">
                  2. Selecciona la Hora
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {timeSlots.map((slot) => {
                    const occupied = isSlotOccupied(selectedRescheduleDay, slot, reschedulingId);
                    const isSelected = selectedRescheduleTime === slot;
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={occupied}
                        onClick={() => setSelectedRescheduleTime(slot)}
                        className={`py-2 text-[10px] tracking-wider border text-center transition-all duration-150 rounded-none min-h-[38px] flex items-center justify-center flex-col ${
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
              </div>
            )}

            {/* Selection Summary */}
            {selectedRescheduleDay && selectedRescheduleTime && (
              <div className="bg-[#FAF3F3] border border-[#ECE7DC] p-3 text-xs text-center rounded-none animate-fade-in mt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8172] block mb-1">
                  Nueva Fecha Programada
                </span>
                <p className="font-serif font-bold text-[#1E1D1A]">
                  {(() => {
                    const [year, month, day] = selectedRescheduleDay.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    return dateObj.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    });
                  })()}{' '}
                  a las <span className="font-mono text-[#7A6241]">{selectedRescheduleTime}h</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex gap-4 mt-auto pt-4 border-t border-[#ECE7DC] shrink-0 bg-white">
            <Button
              type="button"
              variant="outline"
              className="flex-grow border-border text-muted-foreground hover:text-foreground rounded-none uppercase text-[10px] tracking-widest font-semibold py-3.5 h-auto flex items-center justify-center"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!selectedRescheduleDay || !selectedRescheduleTime}
              className="flex-grow bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-[10px] tracking-widest font-semibold py-3.5 h-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                const [year, month, day] = selectedRescheduleDay.split('-').map(Number);
                const [hours, minutes] = selectedRescheduleTime.split(':').map(Number);
                const localDate = new Date(year, month - 1, day, hours, minutes);
                handleReschedule(reschedulingId, localDate.toISOString());
              }}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
