import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ServiceFormModal } from './ServiceFormModal';
import { useAuth } from '@/context/AuthContext';
import { API_URL, type ServiceItem } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

interface ServicesManagementProps {
  services: ServiceItem[];
  onServicesChange?: () => void;
}

export function ServicesManagement({ services, onServicesChange }: ServicesManagementProps) {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const handleOpenCreateService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al eliminar');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      onServicesChange?.();
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingService ? `${API_URL}/services/${editingService.id}` : `${API_URL}/services`;
      const method = editingService ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error?.message || 'Error al guardar');
    },
    onSuccess: () => {
      setIsServiceModalOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      onServicesChange?.();
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const handleDeleteService = (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;
    deleteMutation.mutate(id);
  };

  const handleSaveService = (payload: any) => {
    saveMutation.mutate(payload);
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

  return (
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
                      {service.variants.map((v) => (
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
                    `${Math.min(...service.variants.map((v) => v.duration))}-${Math.max(
                      ...service.variants.map((v) => v.duration)
                    )} min`
                  ) : (
                    `${service.duration} min`
                  )}
                </td>
                <td className="px-6 py-5 text-right font-serif font-semibold text-foreground text-base">
                  {service.variants && service.variants.length > 0 ? (
                    `Desde ${Math.min(...service.variants.map((v) => v.price))}€`
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
                  `Desde ${Math.min(...service.variants.map((v) => v.price))}€`
                ) : (
                  `${service.price}€`
                )}
              </span>
            </div>

            <p className="text-xs text-[#5C574F] font-light leading-relaxed">
              {service.description || 'Sin descripción'}
            </p>

            <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-[#FAF9F5] pt-2">
              <span>
                Duración:{' '}
                {service.variants && service.variants.length > 0 ? (
                  `${Math.min(...service.variants.map((v) => v.duration))}-${Math.max(
                    ...service.variants.map((v) => v.duration)
                  )} min`
                ) : (
                  `${service.duration} min`
                )}
              </span>
              <span>Pasos: {service.steps?.length || 0}</span>
            </div>

            {service.variants && service.variants.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 bg-[#FAF9F5] p-2 border border-[#ECE7DC]">
                <div className="text-[8px] uppercase tracking-wider font-bold text-[#8A8172] w-full mb-1">
                  Variantes:
                </div>
                {service.variants.map((v) => (
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

      <ServiceFormModal
        isOpen={isServiceModalOpen}
        editingService={editingService}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveService}
      />
    </>
  );
}
