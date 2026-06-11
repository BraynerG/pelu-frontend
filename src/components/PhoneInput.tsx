import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountryOption {
  code: string;
  flag: string;
  name: string;
}

const COUNTRIES: CountryOption[] = [
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+33', flag: '🇫🇷', name: 'Francia' },
  { code: '+39', flag: '🇮🇹', name: 'Italia' },
  { code: '+49', flag: '🇩🇪', name: 'Alemania' },
];

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isDark?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'Teléfono',
  isDark = false,
}: PhoneInputProps) {
  // Detectar código y número local de la cadena de entrada
  const detectCountry = (val: string) => {
    if (!val) return { code: '+34', local: '' };
    const cleanVal = val.replace(/[\s-]/g, '');
    for (const c of COUNTRIES) {
      if (cleanVal.startsWith(c.code)) {
        return { code: c.code, local: cleanVal.slice(c.code.length) };
      }
    }
    // Si empieza con + pero no está en la lista principal
    if (cleanVal.startsWith('+')) {
      const match = cleanVal.match(/^\+(\d{1,3})/);
      if (match) {
        const code = `+${match[1]}`;
        return { code, local: cleanVal.slice(code.length) };
      }
    }
    return { code: '+34', local: cleanVal };
  };

  const { code: initialCode, local: initialLocal } = detectCountry(value);
  const [selectedCode, setSelectedCode] = useState(initialCode);
  const [numberPart, setNumberPart] = useState(initialLocal);

  // Sincronizar cambios externos (por ejemplo, cuando el formulario se resetea o carga datos del perfil)
  useEffect(() => {
    const { code, local } = detectCountry(value);
    setSelectedCode(code);
    setNumberPart(local);
  }, [value]);

  const handleCodeChange = (newCode: string) => {
    setSelectedCode(newCode);
    onChange(`${newCode}${numberPart}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d]/g, ''); // Permitir únicamente números
    setNumberPart(num);
    onChange(`${selectedCode}${num}`);
  };

  const currentCountry = COUNTRIES.find((c) => c.code === selectedCode) || {
    code: selectedCode,
    flag: '🌐',
    name: 'Internacional',
  };

  return (
    <div
      className={`flex items-stretch border transition-all duration-200 select-none ${
        isDark
          ? 'bg-neutral-800 border-neutral-700 text-white focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500'
          : 'bg-white border-border text-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
      }`}
    >
      {/* Selector de código de país */}
      <div
        className={`relative flex items-center gap-1.5 px-3 border-r cursor-pointer ${
          isDark 
            ? 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900' 
            : 'border-[#ECE7DC] bg-[#FAF9F5] hover:bg-[#F2EFE9]'
        }`}
      >
        <span className="text-base leading-none select-none">{currentCountry.flag}</span>
        <span className="text-xs font-light tracking-wider select-none">{currentCountry.code}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground select-none shrink-0" />
        
        {/* Select nativo oculto superpuesto para perfecto soporte móvil/desktop */}
        <select
          value={selectedCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ WebkitAppearance: 'none' }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Input de número telefónico */}
      <input
        type="tel"
        disabled={disabled}
        value={numberPart}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className={`w-full min-h-[44px] px-3 font-light text-xs focus:outline-none bg-transparent ${
          isDark ? 'text-white placeholder:text-neutral-500' : 'text-foreground placeholder:text-muted-foreground/60'
        }`}
      />
    </div>
  );
}
