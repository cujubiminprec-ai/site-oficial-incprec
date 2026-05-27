import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
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
  tags: string[];
  images?: { id: string; url: string; isCover?: boolean; ativo?: boolean }[];
  documentos?: { label: string; url: string }[];
  publicada?: boolean;
};

const PLACEHOLDER = "/uploads/noticias/placeholder.jpg";

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
  const imageUrl = n.image_url || n.imagem || PLACEHOLDER;
  return {
    id: n.id,
    slug: n.slug,
    categoria: n.categoria || "Notícias",
    titulo: n.titulo,
    resumo: n.resumo || "",
    conteudo: n.conteudo || n.resumo || "",
    image_url: imageUrl,
    criado_em: n.publicado_em || n.criado_em || n.data || new Date().toISOString(),
    autor: n.autor || "INPREC",
    tags: Array.isArray(n.tags) ? n.tags : [],
    images: Array.isArray(n.images) ? n.images : [{ id: `noticia-${n.id}`, url: imageUrl, isCover: true, ativo: true }],
    documentos: [],
    publicada: true,
  };
}

function dataLonga(data: string): string {
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function normalizarConteudo(conteudo: string): string[] {
  return conteudo
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function ArticleContent({ conteudo }: { conteudo: string }) {
  const partes = normalizarConteudo(conteudo);
  return (
    <div className="space-y-4 text-[15px] leading-7 text-gray-700">
      {partes.map((parte, index) => {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          return (
            <h2 key={index} className="pt-2 text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {parte.replace(/\*\*/g, "")}
            </h2>
          );
        }
        if (parte.includes("\n- ") || parte.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc pl-6 space-y-1">
              {parte.split("\n").map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace(/^-\s*/, "")}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{parte}</p>;
      })}
    </div>
  );
}

export default function NoticiaDetalhePage() {
  const { id } = useParams();
  const [todasNoticias, setTodasNoticias] = useState<PublicNoticia[]>([]);
  const [noticiaApi, setNoticiaApi] = useState<PublicNoticia | null>(null);
  const [copiado, setCopiado] = useState(false);

  const noticiaLocal = todasNoticias.find((n) => String(n.id) === String(id) || n.slug === id);
  const noticia = noticiaApi || noticiaLocal;

  const relacionadas = useMemo(() => {
    if (!noticia) return [];
    return ordenarNoticiasRecentes(todasNoticias)
      .filter((n) => String(n.id) !== String(noticia.id))
      .filter((n) => !noticia.categoria || n.categoria === noticia.categoria || todasNoticias.length <= 3)
      .slice(0, 3);
  }, [todasNoticias, noticia]);

  const galeria = noticia?.images?.filter((img) => img.ativo !== false && img.url !== noticia.image_url) || [];
  const documentos = noticia?.documentos || [];

  useEffect(() => {
    let ativo = true;
    noticiasService
      .listar({ limite: 50 })
      .then((lista) => {
        if (ativo) setTodasNoticias(ordenarNoticiasRecentes(lista.map(normalizarNoticiaApi)));
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

  const compartilhar = async () => {
    const url = window.location.href;
    if (navigator.share && noticia) {
      await navigator.share({ title: noticia.titulo, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1800);
  };

  if (!noticia) {
    return (
      <PageLayout>
        <div className="px-4 md:px-8 py-20 text-center">
          <i className="ri-newspaper-line text-6xl text-gray-300 mb-4 block"></i>
          <h1 className="text-xl font-semibold text-gray-700">Notícia não encontrada</h1>
          <Link to="/noticias" className="mt-4 inline-block text-sm font-semibold text-emerald-700">
            Voltar para Notícias
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <article className="px-4 md:px-8 py-7 md:py-10 bg-white">
        <div className="max-w-screen-lg mx-auto">
          <div className="mb-6 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
            <img
              src={noticia.image_url}
              alt={noticia.titulo}
              className="w-full max-h-[520px] object-cover object-top"
            />
          </div>

          <div className="mb-3">
            <span className="inline-flex rounded-md border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800 bg-white">
              {noticia.categoria}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-950 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {noticia.titulo}
          </h1>

          {noticia.resumo && (
            <p className="text-lg leading-8 text-gray-600 mb-5">
              {noticia.resumo}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-5 mb-7 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <i className="ri-calendar-2-line text-emerald-600"></i>
              {dataLonga(noticia.criado_em)}
            </span>
            {noticia.autor && (
              <span className="inline-flex items-center gap-2">
                <i className="ri-user-line text-emerald-600"></i>
                {noticia.autor}
              </span>
            )}
            <button
              type="button"
              onClick={compartilhar}
              className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <i className="ri-share-forward-line text-emerald-600"></i>
              {copiado ? "Link copiado" : "Compartilhar"}
            </button>
          </div>

          <ArticleContent conteudo={noticia.conteudo} />

          {galeria.length > 0 && (
            <section className="mt-10 border-t border-gray-200 pt-7">
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Galeria de fotos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {galeria.map((img) => (
                  <img key={img.id} src={img.url} alt={noticia.titulo} className="w-full rounded-md border border-gray-200 aspect-video object-cover object-top" />
                ))}
              </div>
            </section>
          )}

          {documentos.length > 0 && (
            <section className="mt-8 flex flex-col gap-2">
              {documentos.map((doc) => (
                <a key={doc.url} href={doc.url} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline">
                  <i className="ri-file-word-2-line"></i>
                  {doc.label}
                </a>
              ))}
            </section>
          )}

          {noticia.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-200 pt-5">
              {noticia.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      {relacionadas.length > 0 && (
        <section className="px-4 md:px-8 pb-12 bg-white">
          <div className="max-w-screen-xl mx-auto border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Notícias Relacionadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relacionadas.map((rel) => (
                <Link key={rel.id} to={`/noticias/${rel.slug || rel.id}`} className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-3">
                    <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img src={rel.image_url} alt={rel.titulo} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-500">{dataLonga(rel.criado_em)}</span>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-blue-900 group-hover:text-blue-700">{rel.titulo}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
