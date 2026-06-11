import { useState } from 'react';
import type { ServiceItem } from '@/services/api';
import type { Reservation } from '@/hooks/useReservations';

interface WeeklyAgendaProps {
  services: ServiceItem[];
  reservations: Reservation[];
}

export function WeeklyAgenda({ services, reservations }: WeeklyAgendaProps) {
  const [selectedAgendaDayIdx, setSelectedAgendaDayIdx] = useState(0);

  // Generate 8 days dynamically from today to the same day next week
  const getNext8Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getReservationsForDay = (date: Date) => {
    return reservations
      .filter((res) => {
        if (res.status !== 'CONFIRMED') return false;
        const resDate = new Date(res.date);
        return (
          resDate.getFullYear() === date.getFullYear() &&
          resDate.getMonth() === date.getMonth() &&
          resDate.getDate() === date.getDate()
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const next8Days = getNext8Days();

  return (
    <div className="mb-12">
      <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.2em] mb-6 font-serif flex items-center gap-2 border-b border-[#ECE7DC] pb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-[#BFA37A]" />
        Agenda Semanal de Citas Confirmadas
      </h3>

      {/* Desktop Agenda Grid */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-4">
        {next8Days.map((day, idx) => {
          const dayReservations = getReservationsForDay(day);
          const isToday = idx === 0;
          const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
          const dayNumber = day.getDate();
          const monthName = day.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();

          return (
            <div
              key={idx}
              className={`border transition-all duration-300 flex flex-col justify-between min-h-[190px] p-4 rounded-none ${
                isToday ? 'border-[#BFA37A] bg-[#BFA37A]/5 shadow-sm' : 'border-[#ECE7DC] bg-[#FAF9F5]'
              } hover:border-[#BFA37A]/50`}
            >
              {/* Day Header */}
              <div className="border-b border-[#ECE7DC] pb-2 mb-3 flex justify-between items-center">
                <span className={`text-[10px] tracking-widest font-semibold ${isToday ? 'text-[#BFA37A]' : 'text-[#8A8172]'}`}>
                  {dayName} {isToday && '(HOY)'}
                </span>
                <span className="text-xs font-serif font-bold text-[#1E1D1A]">
                  {dayNumber} {monthName}
                </span>
              </div>

              {/* Day Appointments List */}
              <div className="flex-grow space-y-2 overflow-y-auto max-h-[140px] pr-0.5">
                {dayReservations.length > 0 ? (
                  dayReservations.map((res) => {
                    const service = services.find((s) => s.id === res.serviceId);
                    const variant = service?.variants?.find((v) => v.id === res.variantId);
                    const serviceName = service
                      ? variant
                        ? `${service.name} (${variant.name})`
                        : service.name
                      : 'Tratamiento';

                    const timeStr = new Date(res.date).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={res.id}
                        className="text-left bg-white border border-[#ECE7DC] p-2 hover:border-[#BFA37A]/40 transition-colors rounded-none"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#BFA37A] tracking-wider">{timeStr}h</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#1E1D1A] truncate mt-0.5" title={res.customerName}>
                          {res.customerName}
                        </p>
                        <p className="text-[9px] text-[#5C574F] font-light truncate" title={serviceName}>
                          {serviceName}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full py-6">
                    <span className="text-[10px] text-[#8A8172] italic font-light">Sin citas</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Agenda (Horizontal Day Picker + List) */}
      <div className="md:hidden space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {next8Days.map((day, idx) => {
            const isSelected = selectedAgendaDayIdx === idx;
            const isToday = idx === 0;
            const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
            const dayNumber = day.getDate();
            const monthName = day.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
            const count = getReservationsForDay(day).length;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAgendaDayIdx(idx)}
                className={`flex flex-col items-center justify-center min-w-[65px] p-3 border transition-all rounded-none snap-align-start ${
                  isSelected
                    ? 'border-[#7A6241] bg-[#7A6241] text-white shadow-sm'
                    : isToday
                    ? 'border-[#BFA37A] bg-[#BFA37A]/5 text-[#7A6241]'
                    : 'border-[#ECE7DC] bg-[#FAF9F5] text-[#8A8172]'
                }`}
              >
                <span className={`text-[8px] tracking-wider font-semibold ${isSelected ? 'text-white' : 'opacity-80'}`}>
                  {dayName}
                </span>
                <span className="text-sm font-serif font-bold my-0.5">{dayNumber}</span>
                <span className={`text-[8px] uppercase font-semibold ${isSelected ? 'text-white/90' : 'text-[#8A8172]/90'}`}>
                  {monthName}
                </span>
                {count > 0 && (
                  <span
                    className={`mt-1.5 text-[8px] px-1 py-0.2 rounded-none font-bold font-mono ${
                      isSelected ? 'bg-white text-[#7A6241]' : 'bg-[#7A6241] text-white'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Appointments list for selected day */}
        <div className="bg-[#FAF9F5] border border-[#ECE7DC] p-4 rounded-none min-h-[120px] flex flex-col justify-center">
          {(() => {
            const day = next8Days[selectedAgendaDayIdx];
            const dayReservations = getReservationsForDay(day);

            if (dayReservations.length === 0) {
              return (
                <p className="text-xs text-[#8A8172] italic font-light text-center py-6">
                  No hay citas confirmadas para este día.
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {dayReservations.map((res) => {
                  const service = services.find((s) => s.id === res.serviceId);
                  const variant = service?.variants?.find((v) => v.id === res.variantId);
                  const serviceName = service ? (variant ? `${service.name} (${variant.name})` : service.name) : 'Tratamiento';

                  const timeStr = new Date(res.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={res.id} className="bg-white border border-[#ECE7DC] p-3 flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#7A6241] font-mono">{timeStr}h</span>
                          <span className="text-xs font-semibold text-[#1E1D1A] truncate">{res.customerName}</span>
                        </div>
                        <p className="text-[10px] text-[#5C574F] font-light truncate mt-0.5">
                          {serviceName}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{res.customerPhone}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
