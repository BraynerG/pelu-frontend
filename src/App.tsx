import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { useAuth } from './context/AuthContext';
import { useHeroCarousel } from './hooks/useHeroCarousel';
import { useAppUI } from './hooks/useAppUI';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

// Components
import { Header } from '@/components/catalog/Header';
import { HeroCarousel } from '@/components/catalog/HeroCarousel';
import { Philosophy } from '@/components/catalog/Philosophy';
import { CategoryTabs } from '@/components/catalog/CategoryTabs';
import { ServiceCardGrid } from '@/components/catalog/ServiceCardGrid';
import { LookbookGrid } from '@/components/catalog/LookbookGrid';
import { Footer } from '@/components/catalog/Footer';
import { ServiceQuickView } from '@/components/catalog/ServiceQuickView';
import { ReservationForm } from '@/components/ReservationForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthModal } from '@/components/AuthModal';

function AppContent() {
  const { services, lookbookSlides } = useCatalog();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Custom hook for UI state
  const ui = useAppUI();

  // Carousel Hook
  const {
    currentHeroSlide,
    nextHeroSlide,
    prevHeroSlide,
    goToSlide,
  } = useHeroCarousel(lookbookSlides.length, ui.currentView === 'catalog');

  // Invalidate services + lookbook cache after admin CRUD operations
  const handleServicesChange = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.lookbook.all });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1D1A] antialiased">
      {/* Header */}
      <Header
        currentView={ui.currentView}
        setCurrentView={ui.setCurrentView}
        setIsAuthModalOpen={ui.setIsAuthModalOpen}
      />

      {ui.currentView === 'catalog' ? (
        <>
          {/* Hero Carousel */}
          <HeroCarousel
            lookbookSlides={lookbookSlides}
            currentHeroSlide={currentHeroSlide}
            nextHeroSlide={nextHeroSlide}
            prevHeroSlide={prevHeroSlide}
            goToSlide={goToSlide}
          />

          {/* Philosophy Section */}
          <Philosophy />

          {/* Menú de Experiencias (Catalog) */}
          <section id="catalog-services" className="container mx-auto px-6 py-20 max-w-6xl scroll-mt-20">
            <div className="text-center mb-16 space-y-4">
              <span className="text-[11px] tracking-[0.4em] text-[#7A6241] font-semibold uppercase block">
                Nuestra Colección
              </span>
              <h2 className="text-4xl font-serif text-foreground uppercase tracking-wider">
                Menú de Experiencias
              </h2>
              <p className="text-[#534C43] text-sm font-light max-w-md mx-auto">
                Selecciona la categoría y haz clic en los rituales para conocer los pasos o realizar tu reserva online instantánea.
              </p>
            </div>

            {/* Category Tabs */}
            <CategoryTabs
              activeTab={ui.activeTab}
              setActiveTab={ui.setActiveTab}
            />

            {/* Services Cards (Desktop / Mobile) */}
            <ServiceCardGrid
              activeTab={ui.activeTab}
              handleOpenModal={ui.handleOpenModal}
              handleOpenQuickView={ui.handleOpenQuickView}
            />
          </section>

          {/* Lookbook Results Section */}
          <LookbookGrid />
        </>
      ) : (
        isAdmin && (
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            <AdminDashboard
              services={services}
              lookbookSlides={lookbookSlides}
              onServicesChange={handleServicesChange}
            />
          </div>
        )
      )}

      {/* Footer */}
      <Footer />

      {/* Reservation Form Modal */}
      {ui.selectedService && (
        <ReservationForm
          isOpen={ui.isModalOpen}
          onClose={ui.handleCloseModal}
          serviceId={ui.selectedService.id}
          serviceName={ui.selectedService.name}
          serviceDuration={ui.selectedService.duration}
          initialVariantId={ui.selectedVariantId}
          variants={ui.selectedService.variants || []}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={ui.isAuthModalOpen}
        onClose={ui.closeAuthModal}
      />

      {/* Service Quick-View Drawer Modal */}
      {ui.quickViewService && (
        <ServiceQuickView
          service={ui.quickViewService}
          onClose={ui.closeQuickView}
          handleOpenModal={ui.handleOpenModal}
        />
      )}
    </div>
  );
}

import { Toaster } from 'sonner';

function App() {
  return (
    <CatalogProvider>
      <AppContent />
      <Toaster position="top-center" richColors />
    </CatalogProvider>
  );
}

export default App;
