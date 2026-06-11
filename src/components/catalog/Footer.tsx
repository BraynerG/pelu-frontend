export function Footer() {
  return (
    <footer className="border-t border-[#ECE7DC] bg-white py-16">
      <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-12 text-[#5C574F]">
        <div className="space-y-4">
          <span className="text-lg font-serif font-bold tracking-widest text-[#1E1D1A] uppercase">
            KAREN MENDEZ <span className="text-[#7A6241] font-sans font-light">HAIR DESIGNER</span>
          </span>
          <p className="text-xs font-light leading-relaxed max-w-xs">
            Tu destino de belleza, alta peluquería y cuidado holístico premium bajo la dirección de Karen Mendez.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">HORARIO</h4>
          <div className="text-xs font-light space-y-1.5">
            <p>Lunes: Cerrado</p>
            <p>Martes - Viernes: 10:00h a 19:00h</p>
            <p>Sábados: 10:00h a 15:00h</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-[0.25em] text-[#1E1D1A] uppercase">DIRECCIÓN</h4>
          <div className="text-xs font-light space-y-1.5">
            <p>Calle Jiménez e Iglesias, 3</p>
            <p>28903 Getafe, Madrid</p>
            <p>Tlf: +34 603 120 838</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 max-w-6xl mt-12 pt-8 border-t border-[#FAF9F5] text-center text-[#534C43] text-[10px] tracking-widest font-light">
        <p>&copy; 2026 KAREN MENDEZ | HAIR DESIGNER. CONCEBIDO CON RIGOR Y DISTINCIÓN. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
    </footer>
  );
}
