import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { todasNoticias as noticiasMock } from "@/mocks/noticias-extra";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { noticiasService, Noticia as ApiNoticia } from "@/services/noticias.service";

type HomeNoticia = {
  id: string | number;
  slug?: string;
  titulo: string;
  resumo: string;
  image_url: string;
  categoria: string;
  criado_em: string;
  autor: string;
  publicada?: boolean;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function ordenarNoticiasRecentes<T extends { criado_em?: string; publicado_em?: string; data?: string }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => {
    const dataA = new Date(a.criado_em || a.publicado_em || a.data || 0).getTime();
    const dataB = new Date(b.criado_em || b.publicado_em || b.data || 0).getTime();
    return dataB - dataA;
  });
}

type NoticiaEntrada = Partial<Omit<HomeNoticia, "id"> & Omit<ApiNoticia, "id">> & { id?: string | number };

function normalizarNoticia(n: NoticiaEntrada): HomeNoticia {
  return {
    id: n.id || Date.now(),
    slug: n.slug,
    titulo: n.titulo || "Noticia",
    resumo: n.resumo || "",
    image_url: n.image_url || n.imagem || "/uploads/noticias/placeholder.jpg",
    categoria: n.categoria || "Noticia",
    criado_em: n.publicado_em || n.criado_em || n.data || new Date().toISOString(),
    autor: n.autor || "INPREC",
    publicada: n.publicada !== false,
  };
}

export default function NoticiasSection() {
  const { config } = useSiteConfig();
  const [noticias, setNoticias] = useState<HomeNoticia[]>([]);

  useEffect(() => {
    let ativo = true;
    const carregar = () => {
      noticiasService
        .listar()
        .then((apiLista: ApiNoticia[]) => {
          if (!ativo) return;
          const apiNormalizada = apiLista.map(normalizarNoticia);
          setNoticias(ordenarNoticiasRecentes(apiNormalizada.filter((n) => n.publicada !== false)));
        })
        .catch(() => {
          if (ativo) setNoticias(ordenarNoticiasRecentes(noticiasMock.map((n) => normalizarNoticia({ ...n, publicada: true }))));
        });
    };

    carregar();
    window.addEventListener("inprec-noticias-updated", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-noticias-updated", carregar);
    };
  }, []);

  return (
    <section className="py-12 md:py-16 bg-white" id="noticias">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-3 border"
              style={{ borderColor: `${config.primaryColor}40`, color: config.primaryColor }}
            >
              Noticias
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", color: config.secondaryColor }}>
              Ultimas noticias
            </h2>
          </div>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 font-semibold text-sm hover:gap-3 transition-all duration-200 cursor-pointer whitespace-nowrap self-end"
            style={{ color: config.primaryColor }}
          >
            Ver todas as noticias
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        {noticias.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-gray-100 rounded-2xl">
            <i className="ri-newspaper-line text-4xl mb-3 block"></i>
            <p className="text-sm">Nenhuma noticia publicada no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <Link
                to={`/noticias/${noticia.slug || noticia.id}`}
                key={noticia.id}
                className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:border-gray-200"
              >
                <div className="h-44 w-full overflow-hidden">
                  <img
                    src={noticia.image_url}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold mb-2"
                    style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                  >
                    {noticia.categoria}
                  </span>
                  <h3
                    className="text-sm font-bold leading-snug mb-2 transition-colors duration-200"
                    style={{ fontFamily: "'Poppins', sans-serif", color: config.secondaryColor }}
                  >
                    {noticia.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{noticia.resumo}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <i className="ri-calendar-line"></i>
                      {formatDate(noticia.criado_em)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="truncate">{noticia.autor}</span>
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
