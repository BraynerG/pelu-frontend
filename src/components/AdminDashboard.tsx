import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReservations } from '@/hooks/useReservations';
import { WeeklyAgenda } from './admin/WeeklyAgenda';
import { ReservationsList } from './admin/ReservationsList';
import { ServicesManagement } from './admin/ServicesManagement';
import { LookbookManagement } from './admin/LookbookManagement';
import { AdminTabs, type AdminTab } from './admin/AdminTabs';
import type { ServiceItem, LookbookSlide } from '@/types';

interface AdminDashboardProps {
  services: ServiceItem[];
  lookbookSlides: LookbookSlide[];
  onServicesChange?: () => void;
}

export function AdminDashboard({ services, lookbookSlides, onServicesChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('reservations');
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

      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
