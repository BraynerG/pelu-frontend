import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { API_URL, type ServiceItem, type LookbookSlide } from '@/services/api';
import { Clock, Check, X, Phone, User, Calendar, FileText, Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'MODIFIED';
  notes: string | null;
  serviceId: string;
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
  const [newDate, setNewDate] = useState('');
  const { token } = useAuth();

  // Service form state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('hair');
  const [stepsList, setStepsList] = useState<string[]>([]);

  // Lookbook form state
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookSlide | null>(null);
  const [lookbookTitle, setLookbookTitle] = useState('');
  const [lookbookSubtitle, setLookbookSubtitle] = useState('');
  const [lookbookTag, setLookbookTag] = useState('');
  const [lookbookUrl, setLookbookUrl] = useState('');
  const [lookbookAccent, setLookbookAccent] = useState('');

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

  const handleReschedule = async (id: string) => {
    if (!newDate) return;
    try {
      const response = await fetch(`${API_URL}/reservations/${id}/reschedule`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Error al reagendar');
      
      setReservations(reservations.map(r => r.id === id ? { ...r, date: newDate, status: 'MODIFIED' } : r));
      setReschedulingId(null);
      setNewDate('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormDuration('');
    setFormImageUrl('');
    setFormCategory('hair');
    setStepsList([]);
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
      steps: stepsList.filter(s => s.trim() !== '')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-700 bg-green-50';
      case 'CANCELLED': return 'text-red-700 bg-red-50';
      case 'MODIFIED': return 'text-blue-700 bg-blue-50';
      default: return 'text-yellow-700 bg-yellow-50';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hair': return 'Cabello';
      case 'makeup': return 'Maquillaje';
      case 'spa': return 'Spa / Facial';
      default: return category;
    }
  };

  if (loading) return <div className="text-center text-muted-foreground py-12 font-light">Cargando reservas...</div>;
  if (error) return <div className="text-center text-red-500 py-12 font-light">Error: {error}</div>;

  return (
    <div className="p-8 bg-white border border-border shadow-sm rounded-none">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Panel de Gestión Administrativa</h2>
        <Button onClick={fetchReservations} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-none font-light text-sm">
          Refrescar
        </Button>
      </div>

      {/* Tabs System (Boutique Style) */}
      <div className="flex gap-8 border-b border-[#ECE7DC] mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-4 text-xs tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
            activeTab === 'reservations' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reservas de Clientes
          </span>
          {activeTab === 'reservations' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-4 text-xs tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
            activeTab === 'services' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Catálogo de Servicios
          </span>
          {activeTab === 'services' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A6241]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('lookbook')}
          className={`pb-4 text-xs tracking-[0.2em] font-bold uppercase transition-all duration-300 relative rounded-none ${
            activeTab === 'lookbook' ? 'text-[#1E1D1A]' : 'text-[#8A8172] hover:text-[#1E1D1A]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Carrusel Hero
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
                          const serviceName = services.find(s => s.id === res.serviceId)?.name || 'Tratamiento';
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
          </div>

          <div className="overflow-x-auto">
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
                {reservations.filter(res => res.status !== 'CANCELLED').map((res) => (
                  <tr key={res.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-5 flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{res.customerName}</span>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">
                      {services.find(s => s.id === res.serviceId)?.name || 'Desconocido'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {res.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(res.date).toLocaleString('es-ES', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-none text-xs font-medium uppercase tracking-wide ${getStatusColor(res.status)}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        {reschedulingId === res.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="datetime-local"
                              className="bg-white border-border text-foreground text-xs w-40 rounded-none font-light"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                            />
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-xs uppercase"
                              onClick={() => handleReschedule(res.id)}
                            >
                              Ok
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground rounded-none text-xs"
                              onClick={() => {
                                setReschedulingId(null);
                                setNewDate('');
                              }}
                            >
                              X
                            </Button>
                          </div>
                        ) : (
                          <>
                            {(res.status === 'PENDING' || res.status === 'MODIFIED') && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1 rounded-none text-xs uppercase font-medium"
                                  onClick={() => updateStatus(res.id, 'CONFIRMED')}
                                >
                                  <Check className="h-3.5 w-3.5" /> Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded-none text-xs uppercase font-medium"
                                  onClick={() => updateStatus(res.id, 'CANCELLED')}
                                >
                                  <X className="h-3.5 w-3.5" /> Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded-none text-xs uppercase font-medium"
                                  onClick={() => setReschedulingId(res.id)}
                                >
                                  <Clock className="h-3.5 w-3.5" /> Reagendar
                                </Button>
                              </>
                            )}
                            {res.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded-none text-xs uppercase font-medium"
                                onClick={() => updateStatus(res.id, 'CANCELLED')}
                              >
                                <X className="h-3.5 w-3.5" /> Cancelar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reservations.filter(res => res.status !== 'CANCELLED').length === 0 && (
              <div className="text-center text-muted-foreground py-12 font-light">No hay reservas activas.</div>
            )}
          </div>
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

          <div className="overflow-x-auto">
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
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 text-xs bg-[#FAF9F5] border border-[#ECE7DC] text-[#5C574F]">
                        {getCategoryLabel(service.category)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-muted-foreground font-mono text-xs">
                      {service.duration} min
                    </td>
                    <td className="px-6 py-5 text-right font-serif font-semibold text-foreground text-base">
                      {service.price}€
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
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-[#ECE7DC] rounded-none animate-fade-in">
              <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center">
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

              <form onSubmit={handleSaveService} className="p-8 space-y-6">
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
                      <option value="hair">Cabello & Peinado</option>
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

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">URL de Imagen de Portada</label>
                  <Input
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagenes/servicio.jpg"
                    className="bg-white border-border text-xs rounded-none"
                  />
                  <p className="text-[10px] text-muted-foreground font-light">
                    Opcional. Si se deja en blanco, se utilizará una imagen por defecto elegante.
                  </p>
                </div>

                {/* Dynamic Steps Management */}
                <div className="space-y-3.5 pt-4 border-t border-[#ECE7DC]">
                  <div className="flex justify-between items-center">
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

                {/* Form Footer Actions */}
                <div className="pt-6 border-t border-[#ECE7DC] flex gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground rounded-none uppercase text-xs tracking-wider font-semibold py-4"
                    onClick={() => setIsServiceModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-4"
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
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#ECE7DC] rounded-none animate-fade-in">
              <div className="bg-[#FAF9F5] border-b border-[#ECE7DC] px-6 py-4 flex justify-between items-center">
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

              <form onSubmit={handleSaveLookbook} className="p-8 space-y-6">
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

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#1E1D1A]">URL de Imagen de Fondo</label>
                  <Input
                    required
                    value={lookbookUrl}
                    onChange={(e) => setLookbookUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagenes/slider1.jpg"
                    className="bg-white border-border text-xs rounded-none"
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

                {/* Form Footer Actions */}
                <div className="pt-6 border-t border-[#ECE7DC] flex gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-muted-foreground hover:text-foreground rounded-none uppercase text-xs tracking-wider font-semibold py-4"
                    onClick={() => setIsLookbookModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase text-xs tracking-wider font-semibold py-4"
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
