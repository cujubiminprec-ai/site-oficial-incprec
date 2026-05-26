import { SlideAdmin } from "@/mocks/slides-admin";
import { CursoItem } from "@/mocks/cursos-admin";
import { apiFetch, getToken } from "./api";
import { uploadService } from "./upload.service";

export type FAQItem = {
  id: number;
  categoria: string;
  pergunta: string;
  resposta: string;
  ativo?: boolean;
  ordem?: number;
};

async function adminToken() {
  return getToken() || uploadService.ensureToken();
}

async function adminFetch<T>(endpoint: string, body?: unknown) {
  const token = await adminToken();
  return apiFetch<T>(endpoint, {
    method: body ? "PUT" : "GET",
    body,
    token,
  });
}

export const conteudoService = {
  listarSlidesPublicos() {
    return apiFetch<SlideAdmin[]>("/conteudo/slides");
  },

  listarSlidesAdmin() {
    return adminFetch<SlideAdmin[]>("/conteudo/slides/admin");
  },

  salvarSlides(slides: SlideAdmin[]) {
    return adminFetch<SlideAdmin[]>("/conteudo/slides/bulk", { slides });
  },

  listarFaqPublico() {
    return apiFetch<FAQItem[]>("/conteudo/faq");
  },

  listarFaqAdmin() {
    return adminFetch<FAQItem[]>("/conteudo/faq/admin");
  },

  salvarFaq(faqs: FAQItem[]) {
    return adminFetch<FAQItem[]>("/conteudo/faq/bulk", { faqs });
  },

  listarCursosPublicos() {
    return apiFetch<CursoItem[]>("/conteudo/cursos");
  },

  listarCursosAdmin() {
    return adminFetch<CursoItem[]>("/conteudo/cursos/admin");
  },

  salvarCursos(cursos: CursoItem[]) {
    return adminFetch<CursoItem[]>("/conteudo/cursos/bulk", { cursos });
  },

  inscreverCurso(cursoId: string | number, inscricao: Record<string, unknown>) {
    return apiFetch(`/conteudo/cursos/${cursoId}/inscrever`, {
      method: "POST",
      body: inscricao,
    });
  },
};
