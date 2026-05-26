import { useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

interface MediaItem {
  id: number;
  tipo: "foto" | "video";
  titulo: string;
  categoria: string;
  url: string;
  thumb: string;
  data: string;
}

const galeria: MediaItem[] = [
  {
    id: 1,
    tipo: "foto",
    titulo: "Cerimônia de Posse da Diretoria 2023",
    categoria: "Eventos Institucionais",
    url: "https://readdy.ai/api/search-image?query=government%20institution%20inauguration%20ceremony%20formal%20event%20hall%20official%20public%20servants%20gathering%20professional%20photography%20institutional%20interior&width=900&height=600&seq=gal1&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=government%20institution%20inauguration%20ceremony%20formal%20event%20hall%20official%20public%20servants%20gathering%20professional%20photography%20institutional%20interior&width=900&height=600&seq=gal1&orientation=landscape",
    data: "Jan 2023",
  },
  {
    id: 2,
    tipo: "foto",
    titulo: "Audiência Pública — Prestação de Contas 2023",
    categoria: "Transparência",
    url: "https://readdy.ai/api/search-image?query=public%20audience%20accountability%20government%20official%20meeting%20presentation%20audience%20conference%20room%20formal%20professional%20institutional%20photography&width=900&height=600&seq=gal2&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=public%20audience%20accountability%20government%20official%20meeting%20presentation%20audience%20conference%20room%20formal%20professional%20institutional%20photography&width=900&height=600&seq=gal2&orientation=landscape",
    data: "Mar 2023",
  },
  {
    id: 3,
    tipo: "foto",
    titulo: "Capacitação de Servidores — Módulo Previdenciário",
    categoria: "Capacitação",
    url: "https://readdy.ai/api/search-image?query=government%20training%20seminar%20classroom%20public%20servants%20professional%20development%20workshop%20institutional%20photography%20meeting%20room%20projector&width=900&height=600&seq=gal3&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=government%20training%20seminar%20classroom%20public%20servants%20professional%20development%20workshop%20institutional%20photography%20meeting%20room%20projector&width=900&height=600&seq=gal3&orientation=landscape",
    data: "Abr 2023",
  },
  {
    id: 4,
    tipo: "video",
    titulo: "INPREC 18 Anos — Retrospectiva Institucional",
    categoria: "Vídeos Institucionais",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumb: "https://readdy.ai/api/search-image?query=institutional%20video%20production%20government%20RPPS%20social%20security%20anniversary%20retrospective%20documentary%20cover%20professional%20institutional%20photography&width=900&height=600&seq=gal4&orientation=landscape",
    data: "Jun 2023",
  },
  {
    id: 5,
    tipo: "foto",
    titulo: "Assinatura do Contrato Pró-Gestão — Fase III",
    categoria: "Eventos Institucionais",
    url: "https://readdy.ai/api/search-image?query=government%20officials%20signing%20contract%20agreement%20official%20ceremony%20formal%20meeting%20desk%20documents%20institutional%20professional%20photography&width=900&height=600&seq=gal5&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=government%20officials%20signing%20contract%20agreement%20official%20ceremony%20formal%20meeting%20desk%20documents%20institutional%20professional%20photography&width=900&height=600&seq=gal5&orientation=landscape",
    data: "Ago 2023",
  },
  {
    id: 6,
    tipo: "foto",
    titulo: "Seminário RPPS — Reunião de Gestores Regionais",
    categoria: "Capacitação",
    url: "https://readdy.ai/api/search-image?query=RPPS%20seminar%20regional%20government%20managers%20meeting%20conference%20room%20professional%20institutional%20photography%20Brazilian%20public%20servants&width=900&height=600&seq=gal6&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=RPPS%20seminar%20regional%20government%20managers%20meeting%20conference%20room%20professional%20institutional%20photography%20Brazilian%20public%20servants&width=900&height=600&seq=gal6&orientation=landscape",
    data: "Set 2023",
  },
  {
    id: 7,
    tipo: "foto",
    titulo: "Reunião do Comitê de Investimentos",
    categoria: "Gestão",
    url: "https://readdy.ai/api/search-image?query=investment%20committee%20meeting%20boardroom%20professional%20business%20people%20financial%20discussion%20documents%20formal%20institutional%20photography%20government%20finance&width=900&height=600&seq=gal7&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=investment%20committee%20meeting%20boardroom%20professional%20business%20people%20financial%20discussion%20documents%20formal%20institutional%20photography%20government%20finance&width=900&height=600&seq=gal7&orientation=landscape",
    data: "Out 2023",
  },
  {
    id: 8,
    tipo: "video",
    titulo: "Depoimentos — Servidores Aposentados INPREC",
    categoria: "Vídeos Institucionais",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumb: "https://readdy.ai/api/search-image?query=retired%20public%20servant%20testimonial%20interview%20government%20pension%20RPPS%20documentary%20professional%20institutional%20video%20cover%20photography&width=900&height=600&seq=gal8&orientation=landscape",
    data: "Nov 2023",
  },
  {
    id: 9,
    tipo: "foto",
    titulo: "Atendimento ao Servidor — Balcão INPREC",
    categoria: "Atendimento",
    url: "https://readdy.ai/api/search-image?query=government%20public%20service%20desk%20counter%20attendant%20staff%20serving%20citizen%20municipal%20institution%20interior%20professional%20institutional%20photography&width=900&height=600&seq=gal9&orientation=landscape",
    thumb: "https://readdy.ai/api/search-image?query=government%20public%20service%20desk%20counter%20attendant%20staff%20serving%20citizen%20municipal%20institution%20interior%20professional%20institutional%20photography&width=900&height=600&seq=gal9&orientation=landscape",
    data: "Dez 2023",
  },
];

const categorias = ["Todos", ...Array.from(new Set(galeria.map(g => g.categoria)))];

export default function GaleriaSection() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [catAtiva, setCatAtiva] = useState("Todos");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "foto" | "video">("todos");
  const [itemAberto, setItemAberto] = useState<MediaItem | null>(null);

  const galeriaFiltrada = galeria.filter(item => {
    const matchCat = catAtiva === "Todos" || item.categoria === catAtiva;
    const matchTipo = tipoFiltro === "todos" || item.tipo === tipoFiltro;
    return matchCat && matchTipo;
  });

  return (
    <>
      <section
        id="galeria"
        ref={ref as React.RefObject<HTMLElement>}
        className="py-20 px-4"
      >
        <div className="max-w-screen-xl mx-auto">
          <div className={`text-center mb-10 ${animClass(isVisible, "fade", 0)}`}>
            <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: config.primaryColor }}>
              Galeria
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Fotos &amp; Vídeos Institucionais
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Momentos, eventos e realizações do INPREC ao longo dos anos
            </p>
          </div>

          {/* Filtros */}
          <div className={`flex flex-wrap items-center justify-center gap-3 mb-10 ${animClass(isVisible, "slide-up", 100)}`}>
            {/* Tipo */}
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              {(["todos", "foto", "video"] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoFiltro(tipo)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    tipoFiltro === tipo ? "bg-white text-gray-900" : "text-gray-500"
                  }`}
                >
                  {tipo === "todos" && <i className="ri-grid-line text-xs"></i>}
                  {tipo === "foto" && <i className="ri-image-line text-xs"></i>}
                  {tipo === "video" && <i className="ri-play-circle-line text-xs"></i>}
                  {tipo === "todos" ? "Todos" : tipo === "foto" ? "Fotos" : "Vídeos"}
                </button>
              ))}
            </div>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatAtiva(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
                  style={
                    catAtiva === cat
                      ? { backgroundColor: config.primaryColor, color: "white" }
                      : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${animClass(isVisible, "slide-up", 150)}`}>
            {galeriaFiltrada.map((item) => (
              <button
                key={item.id}
                onClick={() => setItemAberto(item)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group text-left"
              >
                <div className="w-full h-52 overflow-hidden bg-gray-100">
                  <img
                    src={item.thumb}
                    alt={item.titulo}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-xs font-semibold leading-snug">{item.titulo}</p>
                    <p className="text-white/60 text-[10px] mt-0.5">{item.data} • {item.categoria}</p>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      {item.tipo === "video"
                        ? <i className="ri-play-fill text-white text-lg"></i>
                        : <i className="ri-zoom-in-line text-white text-lg"></i>
                      }
                    </div>
                  </div>
                </div>
                {item.tipo === "video" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                    <i className="ri-play-fill text-xs"></i>
                    Vídeo
                  </div>
                )}
              </button>
            ))}
          </div>

          {galeriaFiltrada.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <i className="ri-image-line text-4xl block mb-3"></i>
              <p className="text-sm">Nenhum item encontrado</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox/Modal */}
      {itemAberto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setItemAberto(null)}
        >
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white text-sm font-semibold">{itemAberto.titulo}</p>
                <p className="text-white/50 text-xs mt-0.5">{itemAberto.data} • {itemAberto.categoria}</p>
              </div>
              <button
                onClick={() => setItemAberto(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20 transition-colors"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="w-full rounded-2xl overflow-hidden bg-black">
              {itemAberto.tipo === "video" ? (
                <iframe
                  src={itemAberto.url}
                  title={itemAberto.titulo}
                  className="w-full aspect-video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              ) : (
                <img
                  src={itemAberto.url}
                  alt={itemAberto.titulo}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
            {/* Navegação */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => {
                  const idx = galeriaFiltrada.findIndex(g => g.id === itemAberto.id);
                  if (idx > 0) setItemAberto(galeriaFiltrada[idx - 1]);
                }}
                disabled={galeriaFiltrada.findIndex(g => g.id === itemAberto.id) === 0}
                className="flex items-center gap-1 text-white/60 text-xs cursor-pointer disabled:opacity-30 hover:text-white transition-colors"
              >
                <i className="ri-arrow-left-s-line"></i>
                Anterior
              </button>
              <span className="text-white/40 text-xs">
                {galeriaFiltrada.findIndex(g => g.id === itemAberto.id) + 1} / {galeriaFiltrada.length}
              </span>
              <button
                onClick={() => {
                  const idx = galeriaFiltrada.findIndex(g => g.id === itemAberto.id);
                  if (idx < galeriaFiltrada.length - 1) setItemAberto(galeriaFiltrada[idx + 1]);
                }}
                disabled={galeriaFiltrada.findIndex(g => g.id === itemAberto.id) === galeriaFiltrada.length - 1}
                className="flex items-center gap-1 text-white/60 text-xs cursor-pointer disabled:opacity-30 hover:text-white transition-colors"
              >
                Próximo
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
