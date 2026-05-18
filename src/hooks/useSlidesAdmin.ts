import { useState } from "react";
import { SlideAdmin, slidesAdminDefault } from "@/mocks/slides-admin";
import { conteudoService } from "@/services/conteudo.service";

const SLIDES_STORAGE_KEY = "inprec_slides";

export type PromoteType = "noticia" | "evento" | "curso" | "audiencia";

export function useSlidesAdmin() {
  const [loading, setLoading] = useState(false);

  const getSlides = (): SlideAdmin[] => {
    try {
      const saved = localStorage.getItem(SLIDES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : slidesAdminDefault;
    } catch {
      return slidesAdminDefault;
    }
  };

  const smartTruncate = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    const truncated = text.substring(0, limit);
    // Try to truncate at the last full sentence if possible
    const lastPoint = truncated.lastIndexOf(".");
    if (lastPoint > limit * 0.7) {
      return truncated.substring(0, lastPoint + 1);
    }
    // Fallback to last space
    const lastSpace = truncated.lastIndexOf(" ");
    return truncated.substring(0, lastSpace) + "...";
  };

  const getCtaLabel = (type: PromoteType) => {
    switch (type) {
      case "noticia": return "Ler notícia completa";
      case "evento": return "Ver detalhes do evento";
      case "audiencia": return "Participar da audiência";
      case "curso": return "Ver informações do curso";
      default: return "Saiba mais";
    }
  };

  const promoteToSlide = (item: {
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
      const currentSlides = getSlides();
      
      // Check if a slide for this item already exists
      const existingIndex = currentSlides.findIndex(s => s.cta_url === item.cta_url);

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
        ordem: 0, // Will be re-calculated
        use_tint: false // Better for photos with black gradient overlay
      };

      let updatedSlides: SlideAdmin[];
      if (existingIndex >= 0) {
        // Replace existing and keep others
        updatedSlides = currentSlides.map((s, i) => i === existingIndex ? newSlide : s);
      } else {
        // Add at the beginning
        updatedSlides = [newSlide, ...currentSlides];
      }

      // Re-calculate orders (1-based) ensuring the new/updated one is first
      updatedSlides = updatedSlides
        .sort((a, b) => {
          if (a.cta_url === item.cta_url) return -1;
          if (b.cta_url === item.cta_url) return 1;
          return a.ordem - b.ordem;
        })
        .map((s, i) => ({ ...s, ordem: i + 1 }));

      localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(updatedSlides));
      conteudoService.salvarSlides(updatedSlides).catch(() => {
        // Fallback local ja foi salvo; a sincronizacao acontece quando a API voltar.
      });
      
      // Trigger storage event
      window.dispatchEvent(new Event("storage"));
      
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
