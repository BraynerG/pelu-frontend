import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Sparkles } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { WeeklyAgenda } from './admin/WeeklyAgenda';
import { ReservationsList } from './admin/ReservationsList';
import { ServicesManagement } from './admin/ServicesManagement';
import { LookbookManagement } from './admin/LookbookManagement';
import type { ServiceItem, LookbookSlide } from '@/services/api';

interface AdminDashboardProps {
  services: ServiceItem[];
  lookbookSlides: LookbookSlide[];
  onServicesChange?: () => void;
}

export function AdminDashboard({ services, lookbookSlides, onServicesChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'lookbook'>('reservations');
  const reservationsState = useReservations();

  if (reservationsState.loading) {
    return <div className="text-center text-muted-foreground py-12 font-light">Cargando reservas...</div>;
  }
  
  if (reservationsState.error) {
    return <div className="text-center text-red-500 py-12 font-light">Error: {reservationsState.error}</div>;
  }

  return (
    <div className="p-4 sm:p-8 bg-white border border-border shadow-sm rounded-none">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-base sm:text-xl font-bold text-foreground uppercase tracking-wide">
          Panel de Gestión Administrativa
        </h2>
        <Button 
          onClick={() => reservationsState.fetchReservations()} 
          variant="outline" 
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-none font-light text-xs sm:text-sm px-3 py-1.5 h-auto"
        >
          Refrescar
        </Button>
      </div>

      {/* Tabs System (Boutique Style) */}
      <div className="flex gap-4 sm:gap-8 border-b border-[#ECE7DC] mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-4 text-xs tracking-[0.15em] sm:tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
            activeTab === 'reservations' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#7A6241]" />
            Reservas<span className="hidden sm:inline"> de Clientes</span>
          </span>
          {activeTab === 'reservations' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-4 text-xs tracking-[0.15em] sm:tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
            activeTab === 'services' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#7A6241]" />
            Servicios<span className="hidden sm:inline"> de Autor</span>
          </span>
          {activeTab === 'services' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('lookbook')}
          className={`pb-4 text-xs tracking-[0.15em] sm:tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
            activeTab === 'lookbook' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#7A6241]" />
            Carrusel<span className="hidden sm:inline"> Hero</span>
          </span>
          {activeTab === 'lookbook' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241]" />
          )}
        </button>
      </div>

      {activeTab === 'reservations' && (
        <>
          <WeeklyAgenda 
            services={services} 
            reservations={reservationsState.reservations} 
          />
          <ReservationsList 
            services={services}
            reservations={reservationsState.reservations}
            filteredReservations={reservationsState.filteredReservations}
            statusFilter={reservationsState.statusFilter}
            setStatusFilter={reservationsState.setStatusFilter}
            searchQuery={reservationsState.searchQuery}
            setSearchQuery={reservationsState.setSearchQuery}
            updateStatus={reservationsState.updateStatus}
            reschedulingId={reservationsState.reschedulingId}
            openRescheduleModal={reservationsState.openRescheduleModal}
            closeRescheduleModal={reservationsState.closeRescheduleModal}
            handleReschedule={reservationsState.handleReschedule}
            selectedRescheduleDay={reservationsState.selectedRescheduleDay}
            setSelectedRescheduleDay={reservationsState.setSelectedRescheduleDay}
            selectedRescheduleTime={reservationsState.selectedRescheduleTime}
            setSelectedRescheduleTime={reservationsState.setSelectedRescheduleTime}
          />
        </>
      )}

      {activeTab === 'services' && (
        <ServicesManagement 
          services={services} 
          onServicesChange={onServicesChange} 
        />
      )}

      {activeTab === 'lookbook' && (
        <LookbookManagement 
          lookbookSlides={lookbookSlides} 
          onServicesChange={onServicesChange} 
        />
      )}
    </div>
  );
}
