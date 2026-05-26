import { useState } from "react";
import { SlideAdmin, slidesAdminDefault } from "@/mocks/slides-admin";
import { conteudoService } from "@/services/conteudo.service";

export type PromoteType = "noticia" | "evento" | "curso" | "audiencia";

async function carregarSlides(): Promise<SlideAdmin[]> {
  try {
    const remotos = await conteudoService.listarSlidesAdmin();
    return Array.isArray(remotos) && remotos.length > 0 ? remotos : slidesAdminDefault;
  } catch {
    return slidesAdminDefault;
  }
}

export function useSlidesAdmin() {
  const [loading, setLoading] = useState(false);

  const smartTruncate = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    const truncated = text.substring(0, limit);
    const lastPoint = truncated.lastIndexOf(".");
    if (lastPoint > limit * 0.7) {
      return truncated.substring(0, lastPoint + 1);
    }
    const lastSpace = truncated.lastIndexOf(" ");
    return truncated.substring(0, lastSpace) + "...";
  };

  const getCtaLabel = (type: PromoteType) => {
    switch (type) {
      case "noticia": return "Ler noticia completa";
      case "evento": return "Ver detalhes do evento";
      case "audiencia": return "Participar da audiencia";
      case "curso": return "Ver informacoes do curso";
      default: return "Saiba mais";
    }
  };

  const promoteToSlide = async (item: {
    id: number | string;
    titulo: string;
    resumo: string;
    image_url: string;
    tag: string;
    cta_url: string;
    type?: PromoteType;
  }) => {
    setLoading(true);
    try {
      const currentSlides = await carregarSlides();
      const existingIndex = currentSlides.findIndex((s) => s.cta_url === item.cta_url);
      const type = item.type || "noticia";

      const newSlide: SlideAdmin = {
        id: existingIndex >= 0 ? currentSlides[existingIndex].id : Date.now(),
        tag: item.tag.toUpperCase(),
        titulo: item.titulo,
        subtitulo: smartTruncate(item.resumo, 180),
        cta_label: getCtaLabel(type),
        cta_url: item.cta_url,
        image_url: item.image_url || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920&h=900",
        ativo: true,
        ordem: 0,
        use_tint: false,
      };

      let updatedSlides = existingIndex >= 0
        ? currentSlides.map((s, i) => (i === existingIndex ? newSlide : s))
        : [newSlide, ...currentSlides];

      updatedSlides = updatedSlides
        .sort((a, b) => {
          if (a.cta_url === item.cta_url) return -1;
          if (b.cta_url === item.cta_url) return 1;
          return a.ordem - b.ordem;
        })
        .map((s, i) => ({ ...s, ordem: i + 1 }));

      await conteudoService.salvarSlides(updatedSlides);
      window.dispatchEvent(new Event("inprec-slides-updated"));
      return true;
    } catch (error) {
      console.error("Error promoting to slide:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { promoteToSlide, loading };
}
