import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { API_URL, type ServiceItem, type LookbookSlide } from '@/services/api';
import { Clock, Check, X, Phone, User, Calendar, FileText, Plus, Pencil, Trash2, Sparkles, Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';


interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'MODIFIED';
  notes: string | null;
  serviceId: string;
  variantId?: string | null;
}

interface AdminDashboardProps {
  services: ServiceItem[];
  lookbookSlides: LookbookSlide[];
  onServicesChange?: () => void;
}

export function AdminDashboard({ services, lookbookSlides, onServicesChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'lookbook'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const { token } = useAuth();

  // Search and filter states for reservations
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'MODIFIED' | 'CANCELLED'>('ALL');
  
  // Rescheduling states
  const [selectedRescheduleDay, setSelectedRescheduleDay] = useState<string>('');
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>('');

  // Service form state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('hair-cut');
  const [stepsList, setStepsList] = useState<string[]>([]);
  const [variantsList, setVariantsList] = useState<{ id?: string; name: string; price: number; duration: number }[]>([]);

  // Lookbook form state
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookSlide | null>(null);
  const [lookbookTitle, setLookbookTitle] = useState('');
  const [lookbookSubtitle, setLookbookSubtitle] = useState('');
  const [lookbookTag, setLookbookTag] = useState('');
  const [lookbookUrl, setLookbookUrl] = useState('');
  const [lookbookAccent, setLookbookAccent] = useState('');

  // Mobile weekly agenda selector index
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
    return reservations.filter(res => {
      if (res.status !== 'CONFIRMED') return false;
      const resDate = new Date(res.date);
      return resDate.getFullYear() === date.getFullYear() &&
             resDate.getMonth() === date.getMonth() &&
             resDate.getDate() === date.getDate();
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al cargar reservas');
      setReservations(result.data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReservations();
    }
  }, [token]);

  const updateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      const response = await fetch(`${API_URL}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al actualizar');
      
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReschedule = async (id: string, dateToUse: string) => {
    try {
      const response = await fetch(`${API_URL}/reservations/${id}/reschedule`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateToUse }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al reagendar');
      
      setReservations(reservations.map(r => r.id === id ? { ...r, date: dateToUse, status: 'MODIFIED' } : r));
      setReschedulingId(null);
      setSelectedRescheduleDay('');
      setSelectedRescheduleTime('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openRescheduleModal = (res: Reservation) => {
    setReschedulingId(res.id);
    const d = new Date(res.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedRescheduleDay(`${year}-${month}-${day}`);
    
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setSelectedRescheduleTime(`${hours}:${minutes}`);
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormDuration('');
    setFormImageUrl('');
    setFormCategory('hair-cut');
    setStepsList([]);
    setVariantsList([]);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setFormName(service.name);
    setFormDescription(service.description || '');
    setFormPrice(service.price.toString());
    setFormDuration(service.duration.toString());
    setFormImageUrl(service.imageUrl || '');
    setFormCategory(service.category);
    setStepsList(service.steps || []);
    setVariantsList(service.variants || []);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al eliminar');
      
      if (onServicesChange) {
        onServicesChange();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formDuration) {
      alert('Nombre, precio y duración son obligatorios');
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      duration: parseInt(formDuration),
      imageUrl: formImageUrl || null,
      category: formCategory,
      steps: stepsList.filter(s => s.trim() !== ''),
      variants: variantsList.map(v => ({
        name: v.name,
        price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
        duration: typeof v.duration === 'string' ? parseInt(v.duration) : v.duration
      }))
    };

    try {
      const url = editingService ? `${API_URL}/services/${editingService.id}` : `${API_URL}/services`;
      const method = editingService ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al guardar');

      setIsServiceModalOpen(false);
      if (onServicesChange) {
        onServicesChange();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Lookbook slide handlers
  const handleOpenCreateLookbook = () => {
    setEditingLookbook(null);
    setLookbookTitle('');
    setLookbookSubtitle('');
    setLookbookTag('');
    setLookbookUrl('');
    setLookbookAccent('');
    setIsLookbookModalOpen(true);
  };

  const handleOpenEditLookbook = (slide: LookbookSlide) => {
    setEditingLookbook(slide);
    setLookbookTitle(slide.title);
    setLookbookSubtitle(slide.subtitle || '');
    setLookbookTag(slide.tag);
    setLookbookUrl(slide.url);
    setLookbookAccent(slide.accent || '');
    setIsLookbookModalOpen(true);
  };

  const handleDeleteLookbook = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta diapositiva del carrusel?')) return;
    try {
      const response = await fetch(`${API_URL}/services/lookbook/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al eliminar');
      
      if (onServicesChange) {
        onServicesChange();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookbookTitle || !lookbookUrl || !lookbookTag) {
      alert('Título, imagen y etiqueta son obligatorios');
      return;
    }

    const payload = {
      title: lookbookTitle,
      subtitle: lookbookSubtitle,
      tag: lookbookTag,
      url: lookbookUrl,
      accent: lookbookAccent || null
    };

    try {
      const url = editingLookbook ? `${API_URL}/services/lookbook/${editingLookbook.id}` : `${API_URL}/services/lookbook`;
      const method = editingLookbook ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al guardar');

      setIsLookbookModalOpen(false);
      if (onServicesChange) {
        onServicesChange();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hair-cut': return 'Cabello - Cortes';
      case 'hair-style': return 'Cabello - Peinados';
      case 'hair-color': return 'Cabello - Color/Mechas';
      case 'hair-treatment': return 'Cabello - Tratamientos';
      case 'hair-straightening': return 'Cabello - Alisados';
      case 'hair-addon': return 'Cabello - Adicionales';
      case 'makeup': return 'Maquillaje';
      case 'spa': return 'Spa / Facial';
      default: return category;
    }
  };

  const filteredReservations = reservations.filter((res) => {
    if (statusFilter === 'ALL') {
      if (res.status === 'CANCELLED') return false;
    } else if (res.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = res.customerName.toLowerCase().includes(query);
      const phoneMatch = res.customerPhone.toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    }
    return true;
  });

  if (loading) return <div className="text-center text-muted-foreground py-12 font-light">Cargando reservas...</div>;
  if (error) return <div className="text-center text-red-500 py-12 font-light">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-8 bg-white border border-border shadow-sm rounded-none">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-base sm:text-xl font-bold text-foreground uppercase tracking-wide">Panel de Gestión Administrativa</h2>
        <Button onClick={fetchReservations} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-none font-light text-xs sm:text-sm px-3 py-1.5 h-auto">
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
          {/* Immersive Weekly Calendar Grid (Quiet Luxury Boutique Style) */}
          <div className="mb-12">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.2em] mb-6 font-serif flex items-center gap-2 border-b border-[#ECE7DC] pb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#BFA37A]" />
              Agenda Semanal de Citas Confirmadas
            </h3>
            
            {/* Desktop Agenda Grid */}
            <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-4">
              {getNext8Days().map((day, idx) => {
                const dayReservations = getReservationsForDay(day);
                const isToday = idx === 0;
                const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
                const dayNumber = day.getDate();
                const monthName = day.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();

                return (
                  <div 
                    key={idx} 
                    className={`border transition-all duration-300 flex flex-col justify-between min-h-[190px] p-4 rounded-none ${
                      isToday 
                        ? 'border-[#BFA37A] bg-[#BFA37A]/5 shadow-sm' 
                        : 'border-[#ECE7DC] bg-[#FAF9F5]'
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
                          const service = services.find(s => s.id === res.serviceId);
                          const variant = service?.variants?.find(v => v.id === res.variantId);
                          const serviceName = service ? (variant ? `${service.name} (${variant.name})` : service.name) : 'Tratamiento';
                          
                          const timeStr = new Date(res.date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div key={res.id} className="text-left bg-white border border-[#ECE7DC] p-2 hover:border-[#BFA37A]/40 transition-colors rounded-none">
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
                {getNext8Days().map((day, idx) => {
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
                        <span className={`mt-1.5 text-[8px] px-1 py-0.2 rounded-none font-bold font-mono ${isSelected ? 'bg-white text-[#7A6241]' : 'bg-[#7A6241] text-white'}`}>
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
                  const day = getNext8Days()[selectedAgendaDayIdx];
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
                        const service = services.find(s => s.id === res.serviceId);
                        const variant = service?.variants?.find(v => v.id === res.variantId);
                        const serviceName = service ? (variant ? `${service.name} (${variant.name})` : service.name) : 'Tratamiento';
                        
                        const timeStr = new Date(res.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
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
                
                const count = reservations.filter(r => status === 'ALL' ? r.status !== 'CANCELLED' : r.status === status).length;

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
                    {label} <span className={`ml-0.5 text-[8px] ${statusFilter === status ? 'text-white/80' : 'text-[#8A8172]'}`}>({count})</span>
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
                  const service = services.find(s => s.id === res.serviceId);
                  const variant = service?.variants?.find(v => v.id === res.variantId);
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
              <div className="text-center text-muted-foreground py-12 font-light">No se encontraron reservas con estos criterios.</div>
            )}
          </div>

          {/* Mobile Card List View */}
          <div className="flex flex-col gap-4 md:hidden">
            {filteredReservations.map((res) => {
              const service = services.find(s => s.id === res.serviceId);
              const variant = service?.variants?.find(v => v.id === res.variantId);
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
              <div className="text-center text-muted-foreground py-12 font-light">No se encontraron reservas con estos criterios.</div>
            )}
          </div>

          {/* Dialog Modal for Rescheduling Citas */}
          {reschedulingId && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => { setReschedulingId(null); setSelectedRescheduleDay(''); setSelectedRescheduleTime(''); }} />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none p-6 sm:p-8 animate-fade-in fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col">
                  {/* Mobile drag handle */}
                  <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mb-4 sm:hidden shrink-0" />
                  
                  <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] mb-4 font-serif pb-2 border-b border-[#ECE7DC] shrink-0">Programar / Reagendar Cita</h3>
                  
                  {/* Scrollable Modal Content */}
                  <div className="space-y-4 flex-grow overflow-y-auto min-h-0 pr-1 pb-4">
                    {(() => {
                      const res = reservations.find(r => r.id === reschedulingId);
                      if (!res) return null;
                      const service = services.find(s => s.id === res.serviceId);
                      const variant = service?.variants?.find(v => v.id === res.variantId);
                      return (
                        <div className="space-y-4">
                          <div className="bg-[#FAF9F5] border border-[#ECE7DC] p-3 text-xs space-y-1.5 rounded-none">
                            <div><span className="text-[#8A8172] font-semibold uppercase tracking-wider text-[9px]">Cliente:</span> {res.customerName}</div>
                            <div><span className="text-[#8A8172] font-semibold uppercase tracking-wider text-[9px]">Servicio:</span> {service?.name} {variant && `(${variant.name})`}</div>
                            <div>
                              <span className="text-[#8A8172] font-semibold uppercase tracking-wider text-[9px]">Fecha actual:</span> {new Date(res.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Date Selector */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#1E1D1A] block">1. Selecciona el Día</label>
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
                              onClick={() => {
                                setSelectedRescheduleDay(dayKey);
                              }}
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
                        <label className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#1E1D1A] block">2. Selecciona la Hora</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {timeSlots.map((slot) => {
                            const occupied = isSlotOccupied(selectedRescheduleDay, slot, reschedulingId!);
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
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8172] block mb-1">Nueva Fecha Programada</span>
                        <p className="font-serif font-bold text-[#1E1D1A]">
                          {(() => {
                            const [year, month, day] = selectedRescheduleDay.split('-').map(Number);
                            const dateObj = new Date(year, month - 1, day);
                            return dateObj.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
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
                      onClick={() => {
                        setReschedulingId(null);
                        setSelectedRescheduleDay('');
                        setSelectedRescheduleTime('');
                      }}
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
                        handleReschedule(reschedulingId!, localDate.toISOString());
                      }}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'services' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.2em] font-serif flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#BFA37A]" />
              Catálogo Actual de Rituales
            </h3>
            <Button
              onClick={handleOpenCreateService}
              className="bg-[#1E1D1A] hover:bg-[#7A6241] text-white flex items-center gap-1.5 rounded-none text-xs uppercase font-medium tracking-wider px-4"
            >
              <Plus className="h-4 w-4" /> Nuevo Servicio
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-foreground">
              <thead className="text-xs uppercase bg-muted text-muted-foreground font-medium tracking-wide">
                <tr>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-center">Duración</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-6 py-4 text-center">Pasos</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light">
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-medium text-foreground">{service.name}</div>
                      <div className="text-xs text-muted-foreground max-w-sm truncate mt-1" title={service.description}>
                        {service.description || 'Sin descripción'}
                      </div>
                      {service.variants && service.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {service.variants.map(v => (
                            <span key={v.id} className="px-1.5 py-0.5 text-[9px] bg-[#FAF9F5] text-[#7A6241] border border-[#ECE7DC]">
                              {v.name}: {v.price}€
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 text-xs bg-[#FAF9F5] border border-[#ECE7DC] text-[#5C574F]">
                        {getCategoryLabel(service.category)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-muted-foreground font-mono text-xs">
                      {service.variants && service.variants.length > 0 ? (
                        `${Math.min(...service.variants.map(v => v.duration))}-${Math.max(...service.variants.map(v => v.duration))} min`
                      ) : (
                        `${service.duration} min`
                      )}
                    </td>
                    <td className="px-6 py-5 text-right font-serif font-semibold text-foreground text-base">
                      {service.variants && service.variants.length > 0 ? (
                        `Desde ${Math.min(...service.variants.map(v => v.price))}€`
                      ) : (
                        `${service.price}€`
                      )}
                    </td>
                    <td className="px-6 py-5 text-center text-muted-foreground font-mono text-xs">
                      {service.steps?.length || 0}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded-none text-xs uppercase"
                          onClick={() => handleOpenEditService(service)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-red-500 hover:text-white hover:bg-red-600 flex items-center gap-1 rounded-none text-xs uppercase"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div className="text-center text-muted-foreground py-12 font-light">No hay servicios registrados.</div>
            )}
          </div>

          {/* Mobile Card List View */}
          <div className="flex flex-col gap-4 md:hidden">
            {services.map((service) => (
              <div key={service.id} className="bg-white border border-[#ECE7DC] p-4 flex flex-col gap-3 rounded-none luxury-shadow-sm">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-serif font-semibold text-[#1E1D1A]">{service.name}</h4>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] bg-[#FAF9F5] border border-[#ECE7DC] text-[#5C574F]">
                      {getCategoryLabel(service.category)}
                    </span>
                  </div>
                  <span className="text-sm font-serif font-bold text-[#1E1D1A]">
                    {service.variants && service.variants.length > 0 ? (
                      `Desde ${Math.min(...service.variants.map(v => v.price))}€`
                    ) : (
                      `${service.price}€`
                    )}
                  </span>
                </div>

                <p className="text-xs text-[#5C574F] font-light leading-relaxed">
                  {service.description || 'Sin descripción'}
                </p>

                <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-[#FAF9F5] pt-2">
                  <span>Duración: {service.variants && service.variants.length > 0 ? (
                    `${Math.min(...service.variants.map(v => v.duration))}-${Math.max(...service.variants.map(v => v.duration))} min`
                  ) : (
                    `${service.duration} min`
                  )}</span>
                  <span>Pasos: {service.steps?.length || 0}</span>
                </div>

                {service.variants && service.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 bg-[#FAF9F5] p-2 border border-[#ECE7DC]">
                    <div className="text-[8px] uppercase tracking-wider font-bold text-[#8A8172] w-full mb-1">Variantes:</div>
                    {service.variants.map(v => (
                      <span key={v.id} className="px-1.5 py-0.5 text-[9px] bg-white text-[#7A6241] border border-[#ECE7DC]">
                        {v.name}: {v.price}€ ({v.duration}m)
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2 pt-2 border-t border-[#ECE7DC]/40">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center gap-1 rounded-none text-xs uppercase h-10"
                    onClick={() => handleOpenEditService(service)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border text-red-500 hover:text-white hover:bg-red-600 flex items-center justify-center gap-1 rounded-none text-xs uppercase h-10"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="text-center text-muted-foreground py-12 font-light">No hay servicios registrados.</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'lookbook' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.2em] font-serif flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#BFA37A]" />
              Diapositivas del Carrusel Hero
            </h3>
            <Button
              onClick={handleOpenCreateLookbook}
              className="bg-[#1E1D1A] hover:bg-[#7A6241] text-white flex items-center gap-1.5 rounded-none text-xs uppercase font-medium tracking-wider px-4"
            >
              <Plus className="h-4 w-4" /> Nueva Diapositiva
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lookbookSlides.map((slide) => (
              <div key={slide.id} className="border border-[#ECE7DC] bg-[#FAF9F5] flex flex-col justify-between rounded-none overflow-hidden hover:border-[#7A6241]/40 transition-colors">
                <div className="aspect-video relative overflow-hidden bg-black/10">
                  <img 
                    src={slide.url} 
                    alt={slide.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero_salon.webp';
                    }}
                  />
                  <span className="absolute top-2 left-2 bg-[#1E1D1A]/80 backdrop-blur-sm text-white text-[9px] tracking-widest uppercase font-semibold py-0.5 px-2">
                    {slide.tag}
                  </span>
                </div>
                
                <div className="p-4 space-y-2 flex-grow">
                  <h4 className="font-serif text-[#1E1D1A] font-bold text-sm leading-tight">{slide.title}</h4>
                  <p className="text-xs text-[#5C574F] font-light line-clamp-2">{slide.subtitle || 'Sin subtítulo'}</p>
                  {slide.accent && (
                    <div className="text-[10px] text-[#5C574F] flex items-center gap-1">
                      <span>Acento:</span>
                      <span className="inline-block h-3 w-3 border border-border" style={{ backgroundColor: slide.accent }} />
                      <span className="font-mono text-[9px]">{slide.accent}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 pt-0 border-t border-[#ECE7DC]/40 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-none text-xs uppercase"
                    onClick={() => handleOpenEditLookbook(slide)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border text-red-500 hover:text-white hover:bg-red-600 rounded-none text-xs uppercase"
                    onClick={() => handleDeleteLookbook(slide.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {lookbookSlides.length === 0 && (
            <div className="text-center text-muted-foreground py-12 font-light">No hay diapositivas registradas.</div>
          )}
        </>
      )}

      {/* Service Editor Modal (Overlay) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop Layer */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
              aria-hidden="true"
              onClick={() => setIsServiceModalOpen(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Content Panel */}
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none animate-fade-in fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col">
              {/* Mobile drag handle */}
              <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mt-4 sm:hidden shrink-0" />
              
              <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] font-serif">
                  {editingService ? 'Editar Servicio de Autor' : 'Nuevo Servicio de Autor'}
                </h3>
                <button 
                  onClick={() => setIsServiceModalOpen(false)}
                  className="h-8 w-8 text-[#8A8172] hover:text-[#1E1D1A] flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="flex flex-col flex-grow min-h-0 overflow-hidden sm:block sm:h-auto sm:overflow-visible">
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Nombre del Ritual</label>
                      <Input
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ej. Balayage Signature Gold"
                        className="bg-white border-border text-xs rounded-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Categoría</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-white border border-border text-xs rounded-none h-10 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                      >
                        <option value="hair-cut">Cabello - Cortes</option>
                        <option value="hair-style">Cabello - Peinados & Novias</option>
                        <option value="hair-color">Cabello - Color & Mechas</option>
                        <option value="hair-treatment">Cabello - Tratamientos & Botox</option>
                        <option value="hair-straightening">Cabello - Alisados</option>
                        <option value="hair-addon">Cabello - Adicionales</option>
                        <option value="makeup">Maquillaje & Mirada</option>
                        <option value="spa">Facial & Dermoestética</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Precio (€)</label>
                      <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="Ej. 85.00"
                        className="bg-white border-border text-xs rounded-none"
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Duración (minutos)</label>
                      <Input
                        required
                        type="number"
                        min="5"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        placeholder="Ej. 60"
                        className="bg-white border-border text-xs rounded-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Descripción del Servicio</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe los beneficios principales, texturas o resultados de este ritual..."
                      className="w-full bg-white border border-border text-xs rounded-none p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-light leading-relaxed"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <ImageUpload
                      label="Imagen de Portada"
                      value={formImageUrl}
                      onChange={setFormImageUrl}
                    />
                    <p className="text-[10px] text-muted-foreground font-light">
                      Opcional. Carga una foto representativa del servicio. Si se deja en blanco, se utilizará una imagen por defecto elegante.
                    </p>
                  </div>

                  {/* Dynamic Steps Management */}
                  <div className="space-y-3.5 pt-4 border-t border-[#ECE7DC]">
                    <div className="flex justify-between items-center gap-4">
                      <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Pasos del Ritual / Tratamiento</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#BFA37A] text-[#7A6241] hover:bg-[#FAF9F5] rounded-none text-xs tracking-wider"
                        onClick={() => setStepsList([...stepsList, ''])}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Paso
                      </Button>
                    </div>
                    
                    {stepsList.length > 0 ? (
                      <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                        {stepsList.map((step, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs text-[#7A6241] font-bold font-mono w-6 text-right">{idx + 1}.</span>
                            <Input
                              value={step}
                              onChange={(e) => {
                                const updated = [...stepsList];
                                updated[idx] = e.target.value;
                                setStepsList(updated);
                              }}
                              placeholder={`Describir paso del tratamiento ${idx + 1}...`}
                              className="flex-grow bg-white border-border text-xs rounded-none font-light"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-[#ECE7DC] text-[#8A8172] hover:text-red-600 rounded-none h-10 w-10 p-0"
                              onClick={() => setStepsList(stepsList.filter((_, i) => i !== idx))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-[#ECE7DC] text-xs text-muted-foreground font-light italic">
                        No hay pasos descritos para este ritual capilar o estético.
                      </div>
                    )}
                  </div>

                  {/* Dynamic Variants Management */}
                  <div className="space-y-3.5 pt-4 border-t border-[#ECE7DC]">
                    <div className="flex justify-between items-center gap-4">
                      <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Variantes del Servicio (Opcional)</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#BFA37A] text-[#7A6241] hover:bg-[#FAF9F5] rounded-none text-xs tracking-wider"
                        onClick={() => setVariantsList([...variantsList, { name: '', price: 0, duration: 60 }])}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Variante
                      </Button>
                    </div>
                    
                    {variantsList.length > 0 ? (
                      <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                        {variantsList.map((variant, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              value={variant.name}
                              onChange={(e) => {
                                const updated = [...variantsList];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setVariantsList(updated);
                              }}
                              placeholder="Nombre (ej. Cabello Corto)"
                              className="w-1/2 bg-white border-border text-xs rounded-none font-light"
                              required
                            />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => {
                                const updated = [...variantsList];
                                updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 };
                                setVariantsList(updated);
                              }}
                              placeholder="Precio (€)"
                              className="w-1/4 bg-white border-border text-xs rounded-none font-light"
                              required
                            />
                            <Input
                              type="number"
                              min="5"
                              value={variant.duration}
                              onChange={(e) => {
                                const updated = [...variantsList];
                                updated[idx] = { ...updated[idx], duration: parseInt(e.target.value) || 0 };
                                setVariantsList(updated);
                              }}
                              placeholder="Duración (min)"
                              className="w-1/4 bg-white border-border text-xs rounded-none font-light"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-[#ECE7DC] text-[#8A8172] hover:text-red-600 rounded-none h-10 w-10 p-0"
                              onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-[#ECE7DC] text-xs text-muted-foreground font-light italic">
                        No hay variantes definidas. El servicio usará el precio y duración base.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Footer Actions */}
                <div className="p-6 sm:p-8 pt-4 sm:pt-6 border-t border-[#ECE7DC] flex gap-4 shrink-0 bg-white mt-auto">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
                    onClick={() => setIsServiceModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
                  >
                    Guardar Ritual
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lookbook Slide Editor Modal (Overlay) */}
      {isLookbookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop Layer */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
              aria-hidden="true"
              onClick={() => setIsLookbookModalOpen(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Content Panel */}
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#ECE7DC] rounded-t-[20px] sm:rounded-none animate-fade-in fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex flex-col">
              {/* Mobile drag handle */}
              <div className="w-12 h-1 bg-[#ECE7DC] rounded-full mx-auto mt-4 sm:hidden shrink-0" />
              
              <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-[#1E1D1A] uppercase tracking-[0.25em] font-serif">
                  {editingLookbook ? 'Editar Diapositiva Hero' : 'Nueva Diapositiva Hero'}
                </h3>
                <button 
                  onClick={() => setIsLookbookModalOpen(false)}
                  className="h-8 w-8 text-[#8A8172] hover:text-[#1E1D1A] flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLookbook} className="flex flex-col flex-grow min-h-0 overflow-hidden sm:block sm:h-auto sm:overflow-visible">
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow min-h-0">
                  {/* Tag */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Etiqueta (Tag)</label>
                    <Input
                      required
                      value={lookbookTag}
                      onChange={(e) => setLookbookTag(e.target.value)}
                      placeholder="Ej. NUEVA COLECCIÓN"
                      className="bg-white border-border text-xs rounded-none"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Título Principal</label>
                    <Input
                      required
                      value={lookbookTitle}
                      onChange={(e) => setLookbookTitle(e.target.value)}
                      placeholder="Ej. Estilo Esculpido"
                      className="bg-white border-border text-xs rounded-none"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={lookbookSubtitle}
                      onChange={(e) => setLookbookSubtitle(e.target.value)}
                      placeholder="Ej. Cortes geométricos de alta precisión que respetan el movimiento natural del cabello..."
                      className="w-full bg-white border border-border text-xs rounded-none p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-light leading-relaxed"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <ImageUpload
                      label="Imagen de Fondo"
                      value={lookbookUrl}
                      onChange={setLookbookUrl}
                    />
                  </div>

                  {/* Accent (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">Color de Acento (Hexadecimal Opcional)</label>
                    <Input
                      value={lookbookAccent}
                      onChange={(e) => setLookbookAccent(e.target.value)}
                      placeholder="Ej. #BFA37A"
                      className="bg-white border-border text-xs rounded-none"
                    />
                  </div>
                </div>

                {/* Form Footer Actions */}
                <div className="p-6 sm:p-8 pt-4 sm:pt-6 border-t border-[#ECE7DC] flex gap-4 shrink-0 bg-white mt-auto">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
                    onClick={() => setIsLookbookModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-3.5 h-auto flex items-center justify-center"
                  >
                    Guardar Diapositiva
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
