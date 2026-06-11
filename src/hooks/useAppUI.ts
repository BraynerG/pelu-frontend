import { useState } from 'react';
import type { CategoryTabId } from '@/components/catalog/CategoryTabs';
import type { ServiceItem } from '@/types';

export function useAppUI() {
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');
  const [activeTab, setActiveTab] = useState<CategoryTabId>('hair-cut');
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quickViewService, setQuickViewService] = useState<ServiceItem | null>(null);

  const handleOpenModal = (service: ServiceItem, variantId?: string | null) => {
    setSelectedService(service);
    setSelectedVariantId(variantId || null);
    setIsModalOpen(true);
    setQuickViewService(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setSelectedVariantId(null);
  };

  const handleOpenQuickView = (service: ServiceItem) => {
    setQuickViewService(service);
  };

  const closeQuickView = () => {
    setQuickViewService(null);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return {
    currentView,
    setCurrentView,
    activeTab,
    setActiveTab,
    isAuthModalOpen,
    setIsAuthModalOpen,
    closeAuthModal,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    selectedService,
    selectedVariantId,
    quickViewService,
    handleOpenQuickView,
    closeQuickView
  };
}
