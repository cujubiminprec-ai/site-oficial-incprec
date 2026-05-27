import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
  conteudo: string;
  image_url: string;
  criado_em: string;
  autor: string;
  tempoLeitura: string;
  tags: string[];
  images?: { id: string; url: string; isCover?: boolean; ativo?: boolean }[];
  documentos?: { label: string; url: string }[];
  publicada?: boolean;
};

function getTodasNoticiasLocal(): PublicNoticia[] {
  return noticiasMock.map((n: typeof noticiasMock[0]) => ({ ...n, publicada: true, images: n.images || [] }));
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
    conteudo: n.conteudo || n.resumo || "",
    image_url: n.image_url || n.imagem || "/uploads/noticias/placeholder.jpg",
    criado_em: n.publicado_em || n.criado_em || n.data || new Date().toISOString(),
    autor: n.autor || "INPREC",
    tempoLeitura: "3 min",
    tags: Array.isArray(n.tags) ? n.tags : [],
    images: Array.isArray(n.images) ? n.images : (n.image_url ? [{ id: `noticia-${n.id}`, url: n.image_url, isCover: true, ativo: true }] : []),
    documentos: [],
    publicada: true,
  };
}

export default function NoticiaDetalhePage() {
  const { id } = useParams();
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const [todasNoticias, setTodasNoticias] = useState<PublicNoticia[]>(getTodasNoticiasLocal);
  const [noticiaApi, setNoticiaApi] = useState<PublicNoticia | null>(null);
  const noticiaLocal = todasNoticias.find((n) => String(n.id) === String(id) || n.slug === id);
  const noticia = noticiaApi || noticiaLocal;
  const relacionadas = ordenarNoticiasRecentes(todasNoticias).filter((n) => String(n.id) !== String(noticia?.id)).slice(0, 3);
  const galeria = noticia?.images?.filter((img: { ativo?: boolean }) => img.ativo !== false) || [];
  const documentos = noticia?.documentos || [];

  useEffect(() => {
    let ativo = true;
    noticiasService
      .listar()
      .then((lista) => {
        if (ativo) setTodasNoticias(lista.length > 0 ? ordenarNoticiasRecentes(lista.map(normalizarNoticiaApi)) : ordenarNoticiasRecentes(getTodasNoticiasLocal()));
      })
      .catch(() => {
        if (ativo) setTodasNoticias(ordenarNoticiasRecentes(getTodasNoticiasLocal()));
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    noticiasService
      .obter(id)
      .then((n) => {
        if (ativo) setNoticiaApi(normalizarNoticiaApi(n));
      })
      .catch(() => {
        if (ativo) setNoticiaApi(null);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  if (!noticia) {
    return (
      <PageLayout>
        <div className="pt-40 pb-20 text-center">
          <i className="ri-newspaper-line text-6xl text-gray-300 mb-4 block"></i>
          <h2 className="text-xl font-semibold text-gray-700">Notícia não encontrada</h2>
          <Link to="/noticias" className="mt-4 inline-block text-sm" style={{ color: config.primaryColor }}>
            Voltar para Notícias
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero */}
      <div className="w-full h-[40vh] md:h-[55vh] relative">
        <img src={noticia.image_url} alt={noticia.titulo} className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 max-w-screen-xl mx-auto">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
            style={{ backgroundColor: config.primaryColor }}
          >
            {noticia.categoria}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white max-w-3xl leading-snug" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {noticia.titulo}
          </h1>
        </div>
      </div>

      {/* Content */}
      <section ref={ref as React.RefObject<HTMLElement>} className="py-12 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Article */}
            <article className={`lg:col-span-2 ${animClass(isVisible, "slide-up", 0)}`}>
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="ri-user-line text-gray-300"></i>
                  {noticia.autor}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="ri-calendar-line text-gray-300"></i>
                  {new Date(noticia.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="ri-time-line text-gray-300"></i>
                  {noticia.tempoLeitura} de leitura
                </div>
              </div>

              <p className="text-base text-gray-700 leading-relaxed mb-6 font-medium">{noticia.resumo}</p>

              <div className="prose prose-sm max-w-none">
                {noticia.conteudo.split("\n\n").map((parag, i) => (
                  parag.startsWith("**") ? (
                    <h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {parag.replace(/\*\*/g, "")}
                    </h3>
                  ) : parag.startsWith("- ") ? (
                    <ul key={i} className="list-disc pl-5 space-y-1 mb-4">
                      {parag.split("\n").map((item, j) => (
                        <li key={j} className="text-sm text-gray-600 leading-relaxed">{item.replace("- ", "")}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed mb-4">{parag}</p>
                  )
                ))}
              </div>

              {galeria.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Galeria de fotos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galeria.map((img: { id: string; url: string; isCover?: boolean }) => (
                      <div key={img.id} className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
                        <img src={img.url} alt={noticia.titulo} className="w-full aspect-video object-cover object-top" />
                        {img.isCover && (
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                            Foto de capa
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {documentos.length > 0 && (
                <div className="mt-6 flex flex-col gap-2">
                  {documentos.map((doc: { label: string; url: string }) => (
                    <a
                      key={doc.url}
                      href={doc.url}
                      className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                      style={{ color: config.primaryColor }}
                    >
                      <i className="ri-file-word-2-line"></i>
                      {doc.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                {noticia.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500">Compartilhar:</span>
                {["ri-facebook-fill", "ri-twitter-x-line", "ri-whatsapp-line", "ri-linkedin-fill"].map((ic) => (
                  <a key={ic} href="#" rel="nofollow" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all cursor-pointer">
                    <i className={`${ic} text-sm`}></i>
                  </a>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className={animClass(isVisible, "slide-right", 150)}>
              <div className="sticky top-24">
                <h3 className="text-sm font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Notícias Relacionadas</h3>
                <div className="flex flex-col gap-4">
                  {relacionadas.map((rel) => (
                    <Link key={rel.id} to={`/noticias/${rel.slug || rel.id}`} className="group flex gap-3 cursor-pointer">
                      <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <img src={rel.image_url} alt={rel.titulo} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <span className="text-xs font-medium" style={{ color: config.primaryColor }}>{rel.categoria}</span>
                        <p className="text-xs font-semibold text-gray-800 leading-snug mt-0.5 group-hover:text-gray-600 transition-colors">{rel.titulo}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{new Date(rel.criado_em).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 p-5 rounded-2xl border border-gray-100" style={{ backgroundColor: `${config.primaryColor}08` }}>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Receba as novidades</h4>
                  <p className="text-xs text-gray-500 mb-3">Assine nossa newsletter e fique por dentro de tudo.</p>
                  <input type="email" placeholder="seu@email.com" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 mb-2 focus:outline-none" />
                  <button
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Inscrever-se
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
