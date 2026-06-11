import { Label } from '@/components/ui/label';
import type { ServiceVariant } from '@/types';

interface ReservationOptionsStepProps {
  variants: ServiceVariant[];
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string) => void;
  isActive: boolean;
}

export function ReservationOptionsStep({
  variants,
  selectedVariantId,
  setSelectedVariantId,
  isActive
}: ReservationOptionsStepProps) {
  if (variants.length === 0) return null;

  return (
    <div className={`space-y-2 md:block ${isActive ? 'block' : 'hidden'}`}>
      <Label className="text-foreground font-medium text-sm">Opción / Tipo de Cabello</Label>
      <div className="grid grid-cols-2 gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedVariantId(v.id)}
            className={`px-3 py-2 text-xs border tracking-wider transition-all rounded-none text-left flex justify-between items-center min-h-[44px] ${
              selectedVariantId === v.id
                ? 'border-[#7A6241] bg-[#7A6241]/5 text-[#7A6241] font-semibold'
                : 'border-border text-muted-foreground hover:border-[#1E1D1A] hover:text-foreground'
            }`}
          >
            <span>{v.name}</span>
            <span className="font-serif font-bold">{v.price}€</span>
          </button>
        ))}
      </div>
    </div>
  );
}
