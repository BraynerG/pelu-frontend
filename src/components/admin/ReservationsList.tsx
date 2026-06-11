import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, User, MessageSquare, Phone, Clock, Check } from 'lucide-react';
import { RescheduleModal } from './RescheduleModal';
import type { ServiceItem } from '@/services/api';
import type { Reservation } from '@/hooks/useReservations';

interface ReservationsListProps {
  services: ServiceItem[];
  reservations: Reservation[];
  filteredReservations: Reservation[];
  statusFilter: 'ALL' | 'PENDING' | 'CONFIRMED' | 'MODIFIED' | 'CANCELLED';
  setStatusFilter: (status: 'ALL' | 'PENDING' | 'CONFIRMED' | 'MODIFIED' | 'CANCELLED') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  updateStatus: (id: string, status: 'CONFIRMED' | 'CANCELLED') => void | Promise<void>;
  reschedulingId: string | null;
  openRescheduleModal: (res: Reservation) => void;
  closeRescheduleModal: () => void;
  handleReschedule: (id: string, dateToUse: string) => void | Promise<void>;
  selectedRescheduleDay: string;
  setSelectedRescheduleDay: (day: string) => void;
  selectedRescheduleTime: string;
  setSelectedRescheduleTime: (time: string) => void;
}

export function ReservationsList({
  services,
  reservations,
  filteredReservations,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  updateStatus,
  reschedulingId,
  openRescheduleModal,
  closeRescheduleModal,
  handleReschedule,
  selectedRescheduleDay,
  setSelectedRescheduleDay,
  selectedRescheduleTime,
  setSelectedRescheduleTime,
}: ReservationsListProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Cancelada';
      case 'MODIFIED': return 'Reagendada';
      default: return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-[#2e7d32] bg-[#e8f5e9] border-[#c8e6c9]';
      case 'CANCELLED': return 'text-[#c62828] bg-[#ffebee] border-[#ffcdd2]';
      case 'MODIFIED': return 'text-[#1565c0] bg-[#e3f2fd] border-[#bbdefb]';
      default: return 'text-[#ef6c00] bg-[#fff3e0] border-[#ffe0b2]';
    }
  };

  return (
    <>
      {/* Search & Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#ECE7DC] pb-6">
        {/* Status Filters (Quiet Luxury Tabs) */}
        <div className="flex flex-wrap gap-1.5">
          {(['ALL', 'PENDING', 'CONFIRMED', 'MODIFIED', 'CANCELLED'] as const).map((status) => {
            const label = {
              ALL: 'Todas',
              PENDING: 'Pendientes',
              CONFIRMED: 'Confirmadas',
              MODIFIED: 'Reagendadas',
              CANCELLED: 'Canceladas',
            }[status];
            
            const count = reservations.filter(
              (r) => (status === 'ALL' ? r.status !== 'CANCELLED' : r.status === status)
            ).length;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-2 text-[9px] tracking-wider font-bold uppercase transition-all duration-200 border rounded-none min-h-[36px] ${
                  statusFilter === status
                    ? 'border-[#7A6241] bg-[#7A6241] text-white'
                    : 'border-[#ECE7DC] bg-white text-[#8A8172] hover:border-[#1E1D1A] hover:text-[#1E1D1A]'
                }`}
              >
                {label}{' '}
                <span
                  className={`ml-0.5 text-[8px] ${
                    statusFilter === status ? 'text-white/80' : 'text-[#8A8172]'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A8172]" />
          <Input
            type="text"
            placeholder="Buscar por cliente o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#FAF9F5] border-border text-xs rounded-none h-10 md:h-9 font-light placeholder:text-[#8A8172]/70 focus-visible:ring-[#7A6241]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8172] hover:text-[#1E1D1A]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-foreground">
          <thead className="text-xs uppercase bg-muted text-muted-foreground font-medium tracking-wide">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Servicio</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {filteredReservations.map((res, rowIdx) => {
              const service = services.find((s) => s.id === res.serviceId);
              const variant = service?.variants?.find((v) => v.id === res.variantId);
              const isCancelled = res.status === 'CANCELLED';
              const isModified = res.status === 'MODIFIED';
              
              return (
                <tr 
                  key={res.id} 
                  className={`border-b border-border hover:bg-[#FAF9F5]/40 transition-colors ${
                    isCancelled 
                      ? 'bg-[#FAF9F5]/30 opacity-60 text-muted-foreground' 
                      : isModified
                      ? 'bg-[#FAF9F5]/60 border-l-2 border-l-[#7A6241]'
                      : rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F5]/20'
                  }`}
                >
                  {/* Cliente */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-none flex items-center justify-center border ${
                        isCancelled 
                          ? 'bg-[#E5E5E5]/40 text-[#A3A3A3] border-[#ECE7DC]' 
                          : 'bg-[#FAF3F3] text-[#7A6241] border-[#ECE7DC]'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`font-semibold text-[#1E1D1A] ${isCancelled ? 'line-through opacity-70' : ''}`}>{res.customerName}</div>
                        {res.notes && (
                          <div className="mt-1.5 flex items-start gap-1.5 bg-[#FAF3F3]/80 border border-[#ECE7DC] p-2 text-[10px] text-[#7A6241] max-w-[240px] rounded-none">
                            <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[#7A6241]" />
                            <div className="leading-normal font-light italic">
                              <span className="font-semibold not-italic block text-[8px] uppercase tracking-wider text-[#8A8172] mb-0.5">Nota de Cliente:</span>
                              "{res.notes}"
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Servicio */}
                  <td className="px-6 py-5">
                    <div className={`font-medium text-foreground text-xs md:text-sm ${isCancelled ? 'line-through opacity-70' : ''}`}>
                      {service?.name || 'Desconocido'}
                    </div>
                    {variant && (
                      <span className="inline-flex mt-1.5 px-2 py-0.5 text-[9px] bg-[#7A6241]/10 text-[#7A6241] border border-[#7A6241]/20 tracking-wider uppercase font-semibold">
                        {variant.name} ({variant.price}€)
                      </span>
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                      <Phone className="h-3.5 w-3.5 text-[#8A8172]" />
                      {res.customerPhone}
                    </div>
                  </td>

                  {/* Fecha y Hora */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col text-left">
                      <span className={`font-semibold text-foreground text-xs uppercase tracking-wider ${isCancelled ? 'line-through opacity-70' : ''}`}>
                        {new Date(res.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        }).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[#7A6241] font-mono mt-0.5">
                        {new Date(res.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}h
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] tracking-wider font-bold border uppercase ${getStatusColor(res.status)}`}>
                      {getStatusLabel(res.status)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      {!isCancelled && (
                        <>
                          {(res.status === 'PENDING' || res.status === 'MODIFIED') && (
                            <Button
                              size="sm"
                              className="bg-[#7A6241] hover:bg-[#1E1D1A] text-white flex items-center gap-1 rounded-none text-xs uppercase font-semibold tracking-wider px-3.5"
                              onClick={() => updateStatus(res.id, 'CONFIRMED')}
                            >
                              <Check className="h-3.5 w-3.5" /> Confirmar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-red-500 hover:bg-red-50 flex items-center gap-1 rounded-none text-xs uppercase font-semibold tracking-wider px-3.5"
                            onClick={() => updateStatus(res.id, 'CANCELLED')}
                          >
                            <X className="h-3.5 w-3.5" /> Cancelar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-[#7A6241] hover:bg-muted flex items-center gap-1 rounded-none text-xs uppercase font-semibold tracking-wider px-3.5"
                            onClick={() => openRescheduleModal(res)}
                          >
                            <Clock className="h-3.5 w-3.5" /> Reagendar
                          </Button>
                        </>
                      )}
                      {isCancelled && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-[#7A6241] hover:bg-muted flex items-center gap-1 rounded-none text-xs uppercase font-semibold tracking-wider px-3.5"
                          onClick={() => openRescheduleModal(res)}
                        >
                          <Clock className="h-3.5 w-3.5" /> Programar Cita
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredReservations.length === 0 && (
          <div className="text-center text-muted-foreground py-12 font-light">
            No se encontraron reservas con estos criterios.
          </div>
        )}
      </div>

      {/* Mobile Card List View */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredReservations.map((res) => {
          const service = services.find((s) => s.id === res.serviceId);
          const variant = service?.variants?.find((v) => v.id === res.variantId);
          const isCancelled = res.status === 'CANCELLED';
          const isModified = res.status === 'MODIFIED';
          const dateObj = new Date(res.date);
          
          return (
            <div 
              key={res.id} 
              className={`bg-white border border-[#ECE7DC] p-4 flex flex-col gap-3.5 transition-colors ${
                isCancelled 
                  ? 'bg-[#FAF9F5]/30 opacity-60 text-muted-foreground' 
                  : isModified
                  ? 'border-l-2 border-l-[#7A6241]'
                  : ''
              }`}
            >
              {/* Client name and status */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-none flex items-center justify-center border shrink-0 ${
                    isCancelled ? 'bg-[#E5E5E5]/40 text-[#A3A3A3]' : 'bg-[#FAF3F3] text-[#7A6241] border-[#ECE7DC]'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-xs text-[#1E1D1A] truncate ${isCancelled ? 'line-through opacity-70' : ''}`}>
                      {res.customerName}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground font-mono">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{res.customerPhone}</span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 text-[8px] tracking-wider font-bold border uppercase shrink-0 ${getStatusColor(res.status)}`}>
                  {getStatusLabel(res.status)}
                </span>
              </div>

              {/* Service details and date */}
              <div className="bg-[#FAF9F5] border border-[#ECE7DC] p-3 text-[11px] space-y-1.5">
                <div>
                  <span className="text-[#8A8172] text-[8px] uppercase tracking-wider font-bold block mb-0.5">Servicio</span>
                  <span className={`font-semibold text-[#1E1D1A] ${isCancelled ? 'line-through opacity-70' : ''}`}>
                    {service?.name || 'Desconocido'}
                  </span>
                  {variant && (
                    <span className="ml-2 inline-flex px-1.5 py-0.2 text-[8px] bg-[#7A6241]/10 text-[#7A6241] border border-[#7A6241]/20 font-bold uppercase">
                      {variant.name} ({variant.price}€)
                    </span>
                  )}
                </div>
                <div className="pt-1.5 border-t border-[#ECE7DC]/40">
                  <span className="text-[#8A8172] text-[8px] uppercase tracking-wider font-bold block mb-0.5">Fecha y Hora</span>
                  <span className="font-semibold text-[#1E1D1A]">
                    {dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}{' '}
                    a las <span className="font-mono text-[#7A6241]">{dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h</span>
                  </span>
                </div>
                {res.notes && (
                  <div className="pt-1.5 border-t border-[#ECE7DC]/40 flex gap-1.5 text-[10px] italic text-[#7A6241]">
                    <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>"{res.notes}"</span>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex gap-2">
                {!isCancelled && (
                  <>
                    {(res.status === 'PENDING' || res.status === 'MODIFIED') && (
                      <Button
                        size="sm"
                        className="bg-[#7A6241] hover:bg-[#1E1D1A] text-white flex-1 text-[9px] uppercase font-bold tracking-wider h-10 rounded-none"
                        onClick={() => updateStatus(res.id, 'CONFIRMED')}
                      >
                        <Check className="h-3.5 w-3.5 mr-0.5" /> Confirmar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-red-500 hover:bg-red-50 flex-1 text-[9px] uppercase font-bold tracking-wider h-10 rounded-none"
                      onClick={() => updateStatus(res.id, 'CANCELLED')}
                    >
                      <X className="h-3.5 w-3.5 mr-0.5" /> Cancelar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-[#7A6241] hover:bg-muted flex-1 text-[9px] uppercase font-bold tracking-wider h-10 rounded-none"
                      onClick={() => openRescheduleModal(res)}
                    >
                      <Clock className="h-3.5 w-3.5 mr-0.5" /> Reagendar
                    </Button>
                  </>
                )}
                {isCancelled && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-[#7A6241] hover:bg-muted w-full text-[9px] uppercase font-bold tracking-wider h-10 rounded-none"
                    onClick={() => openRescheduleModal(res)}
                  >
                    <Clock className="h-3.5 w-3.5 mr-0.5" /> Programar Cita
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {filteredReservations.length === 0 && (
          <div className="text-center text-muted-foreground py-12 font-light">
            No se encontraron reservas con estos criterios.
          </div>
        )}
      </div>

      {reschedulingId && (
        <RescheduleModal
          reschedulingId={reschedulingId}
          reservations={reservations}
          services={services}
          selectedRescheduleDay={selectedRescheduleDay}
          setSelectedRescheduleDay={setSelectedRescheduleDay}
          selectedRescheduleTime={selectedRescheduleTime}
          setSelectedRescheduleTime={setSelectedRescheduleTime}
          onClose={closeRescheduleModal}
          handleReschedule={handleReschedule}
        />
      )}
    </>
  );
}
