import { useState, useEffect } from "react";
import { BlocoConteudo, paginasConteudoDefault } from "@/mocks/paginas-conteudo";
import { paginasService } from "@/services/paginas.service";

const PAGE_CONTENT_UPDATED_EVENT = "inprec-page-content-updated";

function mapApiBloco(row: Record<string, unknown>): BlocoConteudo {
  return {
    id: String(row.bloco_id || row.id || `bloco-${Date.now()}`),
    tipo: String(row.tipo || "texto") as BlocoConteudo["tipo"],
    titulo: row.titulo ? String(row.titulo) : undefined,
    subtitulo: row.subtitulo ? String(row.subtitulo) : undefined,
    texto: row.texto ? String(row.texto) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    imageAlt: row.image_alt ? String(row.image_alt) : undefined,
    ctaLabel: row.cta_label ? String(row.cta_label) : undefined,
    ctaUrl: row.cta_url ? String(row.cta_url) : undefined,
    itens: Array.isArray(row.itens) ? row.itens.map(String) : undefined,
    colunas: Array.isArray(row.colunas)
      ? row.colunas as BlocoConteudo["colunas"]
      : undefined,
    cor: row.cor ? String(row.cor) : undefined,
    alinhamento: row.alinhamento ? String(row.alinhamento) as BlocoConteudo["alinhamento"] : undefined,
  };
}

function fallbackBlocos(pageId: string): BlocoConteudo[] {
  return paginasConteudoDefault.find((pagina) => pagina.pageId === pageId)?.blocos ?? [];
}

export function usePageContent(pageId: string): BlocoConteudo[] {
  const [blocos, setBlocos] = useState<BlocoConteudo[]>(fallbackBlocos(pageId));

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const rows = await paginasService.listarBlocos(pageId);
        if (!ativo) return;
        if (rows.length > 0) {
          setBlocos(rows.map(mapApiBloco));
        } else {
          setBlocos(fallbackBlocos(pageId));
        }
      } catch {
        if (ativo) {
          setBlocos(fallbackBlocos(pageId));
        }
      }
    };

    const handle = (event: Event) => {
      const customEvent = event as CustomEvent<{ pageId?: string }>;
      if (!customEvent.detail?.pageId || customEvent.detail.pageId === pageId) {
        carregar();
      }
    };

    carregar();
    window.addEventListener(PAGE_CONTENT_UPDATED_EVENT, handle);
    return () => {
      ativo = false;
      window.removeEventListener(PAGE_CONTENT_UPDATED_EVENT, handle);
    };
  }, [pageId]);

  return blocos;
}

export function notifyPageContentUpdated(pageId: string) {
  window.dispatchEvent(new CustomEvent(PAGE_CONTENT_UPDATED_EVENT, { detail: { pageId } }));
}
