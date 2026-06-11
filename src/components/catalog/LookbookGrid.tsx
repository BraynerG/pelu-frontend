export function LookbookGrid() {
  const looks = [
    { tag: 'Rubios de Lujo', name: 'Balayage Melocotón & Oro', img: '/images/service_balayage.webp' },
    { tag: 'Corte Geométrico', name: 'Bob Esculpido con Flequillo', img: '/images/service_haircut.webp' },
    { tag: 'Dermoestética', name: 'Ritual Facial Anti-Fatiga', img: '/images/service_facial.webp' },
    { tag: 'Glow Makeup', name: 'Maquillaje de Ocasión Natural', img: '/images/service_makeup.webp' }
  ];

  return (
    <section className="bg-[#FAF9F5] py-20 border-t border-b border-[#ECE7DC]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-[11px] tracking-[0.4em] text-[#7A6241] font-semibold uppercase block">
              Resultados de Autor
            </span>
            <h2 className="text-3xl font-serif tracking-tight text-[#1E1D1A]">
              Lookbook de Autor
            </h2>
          </div>
          <p className="text-xs text-[#534C43] font-light max-w-sm">
            Colección de acabados reales de nuestros estilistas y profesionales. Cada look es diseñado respetando la identidad única de la persona.
          </p>
        </div>

        {/* Lookbook Horizontal List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {looks.map((look, i) => (
            <div key={i} className="relative group overflow-hidden border border-[#ECE7DC] bg-white cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden relative">
                <img 
                  src={look.img} 
                  alt={look.name}
                  loading="lazy"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                  <span className="text-[9px] tracking-widest text-[#7A6241] font-semibold uppercase">{look.tag}</span>
                  <h3 className="text-white font-serif text-sm mt-1">{look.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
