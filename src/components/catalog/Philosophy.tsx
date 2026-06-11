import { ShieldCheck, Sparkles, Clock } from 'lucide-react';

export function Philosophy() {
  return (
    <section className="bg-white py-20 border-b border-[#ECE7DC]">
      <div className="container mx-auto px-6 max-w-4xl text-center space-y-6">
        <span className="text-[11px] tracking-[0.4em] text-[#7A6241] font-medium uppercase block">
          Filosofía de Bienestar
        </span>
        <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#1E1D1A]">
          Alta Estética en Clave Minimalista
        </h2>
        <div className="h-[1px] w-16 bg-[#7A6241] mx-auto my-4" />
        <p className="text-base text-[#5C574F] font-light leading-relaxed max-w-2xl mx-auto">
          El salón boutique de Karen Mendez ofrece un refugio de diseño concebido para esculpir tu estilo de autor, 
          cuidar la salud de tu fibra capilar y mimar tu piel con exclusividad. 
          Fórmulas orgánicas seleccionadas y técnicas avanzadas de alta peluquería en un ambiente de total serenidad.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto text-left">
          <div className="flex gap-4 items-start p-4">
            <ShieldCheck className="h-6 w-6 text-[#7A6241] shrink-0" />
            <div>
              <h3 className="font-medium text-sm tracking-wide uppercase">Cuidado Limpio</h3>
              <p className="text-xs text-[#534C43] font-light mt-1">Cosmética 100% orgánica certificada de alta eficacia.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4">
            <Sparkles className="h-6 w-6 text-[#7A6241] shrink-0" />
            <div>
              <h3 className="font-medium text-sm tracking-wide uppercase">Diagnóstico Previo</h3>
              <p className="text-xs text-[#534C43] font-light mt-1">Estudio integral morfológico previo a cada servicio.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4">
            <Clock className="h-6 w-6 text-[#7A6241] shrink-0" />
            <div>
              <h3 className="font-medium text-sm tracking-wide uppercase">Atención sin Prisas</h3>
              <p className="text-xs text-[#534C43] font-light mt-1">Asignamos tiempo generoso para mimarte en total exclusividad.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
