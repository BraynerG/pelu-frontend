import { useState, useEffect } from 'react';
import { useSchedulesQuery, useSchedulesMutations } from '@/hooks/useSchedules';
import { Button } from '@/components/ui/button';
import { Clock, CalendarOff, Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessSchedule } from '@/types';

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ScheduleManagement() {
  const { data: scheduleConfig, isLoading, error } = useSchedulesQuery();
  const { updateBusinessHours, createTimeOff, deleteTimeOff, isUpdating } = useSchedulesMutations();

  const [localHours, setLocalHours] = useState<BusinessSchedule[]>([]);
  const [newTimeOff, setNewTimeOff] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    if (scheduleConfig?.businessHours) {
      setLocalHours(JSON.parse(JSON.stringify(scheduleConfig.businessHours)));
    }
  }, [scheduleConfig]);

  const handleHourChange = (dayOfWeek: number, field: keyof BusinessSchedule, value: string | boolean) => {
    setLocalHours(prev =>
      prev.map(h => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveHours = async () => {
    try {
      const sanitizedHours = localHours.map(({ dayOfWeek, startTime, endTime, isClosed }) => ({
        dayOfWeek,
        startTime,
        endTime,
        isClosed,
      }));
      await updateBusinessHours(sanitizedHours);
      toast.success('Horarios guardados correctamente');
    } catch (err: any) {
      toast.error('Error al guardar horarios', { description: err.message });
    }
  };

  const handleAddTimeOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeOff.startDate || !newTimeOff.endDate) {
      toast.error('Selecciona las fechas de inicio y fin');
      return;
    }
    
    // Ensure start is before end
    if (new Date(newTimeOff.startDate) > new Date(newTimeOff.endDate)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      await createTimeOff(newTimeOff);
      toast.success('Vacaciones añadidas correctamente');
      setNewTimeOff({ startDate: '', endDate: '', reason: '' });
    } catch (err: any) {
      toast.error('Error al añadir vacaciones', { description: err.message });
    }
  };

  const handleDeleteTimeOff = (id: string) => {
    toast('¿Eliminar estas vacaciones?', {
      description: 'Esta acción volverá a abrir la disponibilidad en estas fechas.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            await deleteTimeOff(id);
            toast.success('Vacaciones eliminadas');
          } catch (err: any) {
            toast.error('Error al eliminar', { description: err.message });
          }
        }
      },
      cancel: { label: 'Cancelar', onClick: () => {} }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#8A8172]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A6241] mb-4" />
        <p className="font-light tracking-widest text-sm uppercase">Cargando configuración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAF3F3] p-6 border border-[#ECE7DC] text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-[#C62828] font-medium uppercase tracking-wider text-sm mb-1">Error de Conexión</p>
        <p className="text-sm text-[#8A8172] font-light">No se pudo cargar la configuración de horarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
        <h2 className="text-3xl font-serif text-[#1E1D1A]">Disponibilidad</h2>
        <div className="h-px w-16 bg-[#7A6241]"></div>
        <p className="text-[#8A8172] font-light max-w-lg text-sm leading-relaxed">
          Configura tus días laborables, horarios de atención y periodos de descanso. Los clientes no podrán reservar fuera de estos rangos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* BUSINESS HOURS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#ECE7DC] pb-4">
            <div className="bg-[#7A6241]/10 p-2">
              <Clock className="w-5 h-5 text-[#7A6241]" />
            </div>
            <h3 className="text-lg font-serif text-[#1E1D1A]">Horario Habitual</h3>
          </div>

          <div className="space-y-3">
            {localHours.map((schedule) => (
              <div 
                key={schedule.dayOfWeek}
                className={`flex items-center justify-between p-4 border transition-colors ${schedule.isClosed ? 'bg-[#FAF9F5]/50 border-[#ECE7DC]' : 'bg-white border-[#E5E0D8]'}`}
              >
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!schedule.isClosed}
                      onChange={(e) => handleHourChange(schedule.dayOfWeek, 'isClosed', !e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-[#ECE7DC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#ECE7DC] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7A6241]"></div>
                  </label>
                  <span className={`font-medium tracking-wide text-sm uppercase ${schedule.isClosed ? 'text-[#A3A3A3] line-through' : 'text-[#1E1D1A]'}`}>
                    {DAYS_OF_WEEK[schedule.dayOfWeek]}
                  </span>
                </div>

                {!schedule.isClosed ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={schedule.startTime}
                      onChange={(e) => handleHourChange(schedule.dayOfWeek, 'startTime', e.target.value)}
                      className="bg-transparent text-sm font-mono text-[#7A6241] border-b border-transparent focus:border-[#7A6241] focus:outline-none px-1 py-0.5"
                    />
                    <span className="text-[#8A8172] text-xs">a</span>
                    <input 
                      type="time" 
                      value={schedule.endTime}
                      onChange={(e) => handleHourChange(schedule.dayOfWeek, 'endTime', e.target.value)}
                      className="bg-transparent text-sm font-mono text-[#7A6241] border-b border-transparent focus:border-[#7A6241] focus:outline-none px-1 py-0.5"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold tracking-widest text-[#A3A3A3] uppercase">Cerrado</span>
                )}
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSaveHours}
            disabled={isUpdating}
            className="w-full bg-[#1E1D1A] hover:bg-[#7A6241] text-white rounded-none uppercase tracking-widest text-xs py-6 transition-colors"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Horarios
          </Button>
        </div>

        {/* TIME OFFS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#ECE7DC] pb-4">
            <div className="bg-[#7A6241]/10 p-2">
              <CalendarOff className="w-5 h-5 text-[#7A6241]" />
            </div>
            <h3 className="text-lg font-serif text-[#1E1D1A]">Vacaciones y Ausencias</h3>
          </div>

          <form onSubmit={handleAddTimeOff} className="bg-[#FAF9F5] p-5 border border-[#ECE7DC] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#8A8172]">Desde</label>
                <input 
                  type="date" 
                  value={newTimeOff.startDate}
                  onChange={e => setNewTimeOff(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border border-[#ECE7DC] p-2.5 text-sm font-mono text-[#1E1D1A] focus:outline-none focus:border-[#7A6241] bg-white rounded-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#8A8172]">Hasta</label>
                <input 
                  type="date" 
                  value={newTimeOff.endDate}
                  onChange={e => setNewTimeOff(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-[#ECE7DC] p-2.5 text-sm font-mono text-[#1E1D1A] focus:outline-none focus:border-[#7A6241] bg-white rounded-none"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#8A8172]">Motivo (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej. Vacaciones de verano"
                value={newTimeOff.reason}
                onChange={e => setNewTimeOff(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border border-[#ECE7DC] p-2.5 text-sm font-light text-[#1E1D1A] focus:outline-none focus:border-[#7A6241] bg-white rounded-none placeholder:text-[#C4B297]"
              />
            </div>

            <Button 
              type="submit"
              disabled={isUpdating}
              className="w-full bg-white border border-[#1E1D1A] text-[#1E1D1A] hover:bg-[#1E1D1A] hover:text-white rounded-none uppercase tracking-widest text-xs py-5 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Añadir Periodo
            </Button>
          </form>

          <div className="space-y-3 mt-6">
            {scheduleConfig?.timeOffs.length === 0 && (
              <p className="text-center text-[#8A8172] text-sm font-light py-8 border border-dashed border-[#ECE7DC]">
                No hay vacaciones programadas
              </p>
            )}
            
            {scheduleConfig?.timeOffs.map(to => {
              const start = new Date(to.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
              const end = new Date(to.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
              
              return (
                <div key={to.id} className="flex items-center justify-between p-4 bg-white border border-[#E5E0D8] group hover:border-[#7A6241] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#1E1D1A] tracking-wide">{start} - {end}</span>
                    {to.reason && <span className="text-xs text-[#8A8172] font-light mt-0.5">{to.reason}</span>}
                  </div>
                  <button 
                    onClick={() => handleDeleteTimeOff(to.id)}
                    className="p-2 text-[#C4B297] hover:text-[#C62828] transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
