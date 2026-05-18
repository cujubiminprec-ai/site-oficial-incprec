import { apiFetch, getToken } from "./api";

export interface BlocoConteudoApi {
  id?: string;
  pagina_id: string;
  tipo: string;
  ordem: number;
  conteudo: Record<string, unknown>;
  ativo: boolean;
}

export interface PaginaConteudoApi {
  id?: string;
  pageId: string;
  titulo: string;
  descricao?: string;
  metaTags?: Record<string, string>;
  blocos: BlocoConteudoApi[];
  atualizado_em?: string;
}

export const paginasService = {
  async listar(): Promise<PaginaConteudoApi[]> {
    return apiFetch<PaginaConteudoApi[]>("/paginas");
  },

  async obter(pageId: string): Promise<PaginaConteudoApi> {
    return apiFetch<PaginaConteudoApi>(`/paginas/${pageId}`);
  },

  async criar(pagina: Omit<PaginaConteudoApi, "id" | "atualizado_em">): Promise<PaginaConteudoApi> {
    const token = getToken();
    return apiFetch<PaginaConteudoApi>("/paginas", {
      method: "POST",
      body: pagina,
      token,
    });
  },

  async atualizar(pageId: string, pagina: Partial<Omit<PaginaConteudoApi, "id" | "atualizado_em">>): Promise<PaginaConteudoApi> {
    const token = getToken();
    return apiFetch<PaginaConteudoApi>(`/paginas/${pageId}`, {
      method: "PUT",
      body: pagina,
      token,
    });
  },

  async atualizarBlocos(pageId: string, blocos: BlocoConteudoApi[]): Promise<PaginaConteudoApi> {
    const token = getToken();
    return apiFetch<PaginaConteudoApi>(`/paginas/${pageId}/blocos`, {
      method: "PUT",
      body: { blocos },
      token,
    });
  },

  async deletar(pageId: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/paginas/${pageId}`, {
      method: "DELETE",
      token,
    });
  },
};