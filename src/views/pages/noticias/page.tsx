import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
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
  tags: string[];
  publicada?: boolean;
  images?: unknown[];
};

const PLACEHOLDER = "/uploads/noticias/placeholder.jpg";

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
  const imageUrl = n.image_url || n.imagem || PLACEHOLDER;
  return {
    id: n.id,
    slug: n.slug,
    categoria: n.categoria || "Notícias",
    titulo: n.titulo,
    resumo: n.resumo || "",
    conteudo: n.conteudo || "",
    image_url: imageUrl,
    criado_em: n.publicado_em || n.criado_em || n.data || new Date().toISOString(),
    autor: n.autor || "INPREC",
    tags: Array.isArray(n.tags) ? n.tags : [],
    publicada: true,
    images: Array.isArray(n.images) ? n.images : [{ id: `noticia-${n.id}`, url: imageUrl, isCover: true, ativo: true }],
  };
}

function dataIso(noticia: PublicNoticia): string {
  const data = new Date(noticia.criado_em);
  return Number.isNaN(data.getTime()) ? "" : data.toISOString().slice(0, 10);
}

function dataCurta(data: string): string {
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("pt-BR");
}

function getCategoriasDisponiveis(lista: { categoria: string }[]) {
  const cats = [...new Set(lista.map((n) => n.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return ["Todas", ...cats];
}

function NoticiasListagem() {
  const [categoria, setCategoria] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [todasNoticias, setTodasNoticias] = useState<PublicNoticia[]>(getNoticiasPublicadasLocal);

  useEffect(() => {
    let ativo = true;
    noticiasService
      .listar({ limite: 50 })
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

  const categorias = useMemo(() => getCategoriasDisponiveis(todasNoticias), [todasNoticias]);

  const filtered = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ordenarNoticiasRecentes(todasNoticias).filter((n) => {
      const iso = dataIso(n);
      const matchCat = categoria === "Todas" || n.categoria === categoria;
      const matchBusca = !termo || [n.titulo, n.resumo, n.categoria, n.conteudo || ""].some((campo) => campo.toLowerCase().includes(termo));
      const matchInicio = !dataInicio || (iso && iso >= dataInicio);
      const matchFim = !dataFim || (iso && iso <= dataFim);
      return matchCat && matchBusca && matchInicio && matchFim;
    });
  }, [todasNoticias, categoria, busca, dataInicio, dataFim]);

  const limparFiltros = () => {
    setBusca("");
    setCategoria("Todas");
    setDataInicio("");
    setDataFim("");
  };

  return (
    <section className="px-4 md:px-8 py-7 md:py-10 bg-white">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6" style={{ color: "#214f8f", fontFamily: "'Poppins', sans-serif" }}>
          Notícias
        </h1>

        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1.4fr_0.7fr_0.7fr] gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-gray-900 mb-1.5">Buscar</span>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Título, conteúdo ou categoria..."
                className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-gray-900 mb-1.5">Categoria</span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-gray-900 mb-1.5">De</span>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-gray-900 mb-1.5">Até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <button
              type="button"
              onClick={limparFiltros}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-50 px-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <i className="ri-delete-bin-line text-base"></i>
              Limpar filtros
            </button>
            <span>{filtered.length} resultado(s)</span>
          </div>
        </div>

        <div className="h-px bg-gray-200 mb-4"></div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <i className="ri-newspaper-line text-4xl mb-3 block"></i>
            <p className="text-sm">Nenhuma notícia encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((noticia) => (
              <Link
                key={noticia.id}
                to={`/noticias/${noticia.slug || noticia.id}`}
                className="group min-h-[104px] rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-[110px] h-[80px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={noticia.image_url}
                      alt={noticia.titulo}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                        <i className="ri-calendar-2-line text-emerald-600"></i>
                        {dataCurta(noticia.criado_em)}
                      </span>
                      <span className="max-w-[135px] truncate rounded-md border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-800 bg-white">
                        {noticia.categoria}
                      </span>
                    </div>
                    <h2 className="text-[15px] font-semibold leading-snug text-blue-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {noticia.titulo}
                    </h2>
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
      <NoticiasListagem />
    </PageLayout>
  );
}
