import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";
import NotFound from "@/pages/NotFound";
import { BlocoConteudo, BlocoTipo } from "@/mocks/paginas-conteudo";
import { PaginaPublicaApi, paginasService } from "@/services/paginas.service";

function mapApiBloco(row: Record<string, unknown>): BlocoConteudo {
  return {
    id: String(row.bloco_id || row.id || `bloco-${Date.now()}`),
    tipo: String(row.tipo || "texto") as BlocoTipo,
    titulo: row.titulo ? String(row.titulo) : undefined,
    subtitulo: row.subtitulo ? String(row.subtitulo) : undefined,
    texto: row.texto ? String(row.texto) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    imageAlt: row.image_alt ? String(row.image_alt) : undefined,
    ctaLabel: row.cta_label ? String(row.cta_label) : undefined,
    ctaUrl: row.cta_url ? String(row.cta_url) : undefined,
    itens: Array.isArray(row.itens) ? row.itens.map(String) : undefined,
    colunas: Array.isArray(row.colunas) ? row.colunas as BlocoConteudo["colunas"] : undefined,
    cor: row.cor ? String(row.cor) : undefined,
    alinhamento: row.alinhamento ? String(row.alinhamento) as BlocoConteudo["alinhamento"] : undefined,
  };
}

export default function DynamicPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PaginaPublicaApi | null>(null);
  const [blocos, setBlocos] = useState<BlocoConteudo[]>([]);

  useEffect(() => {
    let active = true;
    const path = location.pathname.replace(/\/+$/, "") || "/";

    const load = async () => {
      setLoading(true);
      try {
        const pages = await paginasService.listarPublicas();
        const found = pages.find((item) => (item.rota.replace(/\/+$/, "") || "/") === path);
        if (!active) return;

        if (!found) {
          setPage(null);
          setBlocos([]);
          return;
        }

        const rows = await paginasService.listarBlocos(found.page_id);
        if (!active) return;
        setPage(found);
        setBlocos(rows.map(mapApiBloco));
      } catch {
        if (active) {
          setPage(null);
          setBlocos([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
          <i className="ri-loader-4-line animate-spin mr-2"></i>
          Carregando pagina...
        </div>
      </PageLayout>
    );
  }

  if (!page) return <NotFound />;

  return (
    <PageLayout>
      {blocos.length > 0 ? (
        <PaginaBlocosRenderer blocos={blocos} />
      ) : (
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-screen-xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {page.nome}
            </h1>
            <p className="text-gray-500 text-sm">Esta pagina ainda nao possui blocos de conteudo publicados.</p>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
