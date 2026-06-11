import { Calendar, FileText, Sparkles, MessageSquare } from 'lucide-react';

export type AdminTab = 'reservations' | 'services' | 'lookbook' | 'whatsapp';

interface AdminTabsProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export function AdminTabs({ activeTab, setActiveTab }: AdminTabsProps) {
  return (
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
      <button
        onClick={() => setActiveTab('whatsapp')}
        className={`pb-4 text-xs tracking-[0.15em] sm:tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
          activeTab === 'whatsapp' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
        }`}
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 shrink-0 text-[#7A6241]" />
          WhatsApp<span className="hidden sm:inline"> Notificaciones</span>
        </span>
        {activeTab === 'whatsapp' && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241]" />
        )}
      </button>
    </div>
  );
}
