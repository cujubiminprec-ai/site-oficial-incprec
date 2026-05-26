import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { todasNoticias as noticiasMock } from "@/mocks/noticias-extra";
import { noticiasService, Noticia as ApiNoticia } from "@/services/noticias.service";

type PublicNoticia = {
  id: string | number;
  slug?: string;
  categoria: string;
  titulo: string;
  resumo: string;
  conteudo?: string;
  image_url: string;
  criado_em: string;
  autor: string;
  tempoLeitura: string;
  tags: string[];
  publicada?: boolean;
  images?: unknown[];
};

function getNoticiasPublicadasLocal(): PublicNoticia[] {
  return noticiasMock.map((n) => ({ ...n, publicada: true, images: n.images || [] }));
}

function ordenarNoticiasRecentes<T extends { criado_em?: string; publicado_em?: string; data?: string }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => {
    const dataA = new Date(a.criado_em || a.publicado_em || a.data || 0).getTime();
    const dataB = new Date(b.criado_em || b.publicado_em || b.data || 0).getTime();
    return dataB - dataA;
  });
}

function normalizarNoticiaApi(n: ApiNoticia): PublicNoticia {
  return {
    id: n.id,
    slug: n.slug,
    categoria: n.categoria || "Noticia",
    titulo: n.titulo,
    resumo: n.resumo || "",
    conteudo: n.conteudo || "",
    image_url: n.image_url || n.imagem || "/uploads/noticias/placeholder.jpg",
    criado_em: n.publicado_em || n.criado_em || n.data || new Date().toISOString(),
    autor: n.autor || "INPREC",
    tempoLeitura: "3 min",
    tags: Array.isArray(n.tags) ? n.tags : [],
    publicada: true,
    images: [],
  };
}

function getCategoriasDisponiveis(lista: { categoria: string }[]) {
  const cats = [...new Set(lista.map((n) => n.categoria))];
  return ["Todos", ...cats];
}

function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="pt-28 md:pt-32 pb-14 md:pb-20 px-4"
      style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
    >
      <div className="max-w-screen-xl mx-auto text-center">
        <div className={animClass(isVisible, "slide-up", 0)}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4 md:mb-5">
            Notícias & Comunicados
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Fique por Dentro
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto">
            Acompanhe as últimas notícias, comunicados e novidades do INPREC.
          </p>
        </div>
      </div>
    </section>
  );
}

function NoticiasGrid() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { config } = useSiteConfig();
  const [categoria, setCategoria] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [todasNoticias, setTodasNoticias] = useState<PublicNoticia[]>(getNoticiasPublicadasLocal);

  useEffect(() => {
    let ativo = true;
    noticiasService
      .listar()
      .then((apiLista) => {
        if (!ativo) return;
        const apiNormalizada = apiLista.map(normalizarNoticiaApi);
        setTodasNoticias(apiNormalizada.length > 0 ? ordenarNoticiasRecentes(apiNormalizada) : getNoticiasPublicadasLocal());
      })
      .catch(() => {
        if (ativo) setTodasNoticias(getNoticiasPublicadasLocal());
      });

    return () => {
      ativo = false;
    };
  }, []);

  const categorias = getCategoriasDisponiveis(todasNoticias);

  const filtered = ordenarNoticiasRecentes(todasNoticias).filter((n: { categoria: string; titulo: string; resumo: string }) => {
    const matchCat = categoria === "Todos" || n.categoria === categoria;
    const matchBusca = n.titulo.toLowerCase().includes(busca.toLowerCase()) || n.resumo.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-10 md:py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Search + Filters */}
        <div className={`flex flex-col gap-3 mb-8 md:mb-10 ${animClass(isVisible, "slide-up", 0)}`}>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar notícias..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-300 bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200"
                style={
                  categoria === cat
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
        {filtered.length === 0 ? (
          <div className="text-center py-16 md:py-20 text-gray-400">
            <i className="ri-newspaper-line text-4xl md:text-5xl mb-3 block"></i>
            <p className="text-sm">Nenhuma notícia encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((noticia, i) => (
              <Link
                key={noticia.id}
                to={`/noticias/${noticia.slug || noticia.id}`}
                className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer ${animClass(isVisible, "slide-up", (i % 3) * 80)}`}
              >
                <div className="w-full h-40 md:h-48 overflow-hidden">
                  <img
                    src={noticia.image_url}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                    >
                      {noticia.categoria}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="ri-time-line"></i>
                      {noticia.tempoLeitura}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {noticia.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 md:mb-4 line-clamp-2">{noticia.resumo}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100">
                        <i className="ri-user-line text-xs text-gray-400"></i>
                      </div>
                      <span className="text-xs text-gray-400 truncate max-w-[100px]">{noticia.autor}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(noticia.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function NoticiasPage() {
  return (
    <PageLayout>
      <HeroSection />
      <NoticiasGrid />
    </PageLayout>
  );
}
