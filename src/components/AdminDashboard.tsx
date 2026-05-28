import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/services/api';
import { Clock, Check, X, Phone, User } from 'lucide-react';
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

interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

interface AdminDashboardProps {
  services: ServiceItem[];
}

export function AdminDashboard({ services }: AdminDashboardProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const { token } = useAuth();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-700 bg-green-50';
      case 'CANCELLED': return 'text-red-700 bg-red-50';
      case 'MODIFIED': return 'text-blue-700 bg-blue-50';
      default: return 'text-yellow-700 bg-yellow-50';
    }
  };

  if (loading) return <div className="text-center text-muted-foreground py-12 font-light">Cargando reservas...</div>;
  if (error) return <div className="text-center text-red-500 py-12 font-light">Error: {error}</div>;

  return (
    <div className="p-8 bg-white border border-border shadow-sm rounded-none">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Panel de Gestión de Reservas</h2>
        <Button onClick={fetchReservations} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-none font-light text-sm">
          Refrescar
        </Button>
      </div>

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
    </div>
  );
}
