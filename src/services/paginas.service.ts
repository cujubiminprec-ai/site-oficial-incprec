import { apiFetch, getToken } from "./api";

export interface BlocoConteudoApi {
  id?: string;
  pagina_id?: string;
  tipo: string;
  ordem: number;
  conteudo?: Record<string, unknown>;
  ativo?: boolean;
  [key: string]: any;
}

export interface PaginaConteudoApi {
  id?: string;
  pageId?: string;
  titulo?: string;
  nome?: string;
  rota?: string;
  status?: string;
  menuLocal?: string;
  ordem?: number;
  editavel?: boolean;
  descricao?: string;
  metaTags?: Record<string, string>;
  blocos?: BlocoConteudoApi[];
  atualizado_em?: string;
  [key: string]: any;
}

export type PaginaPublicaApi = PaginaConteudoApi;

export const paginasService = {
  async listar(): Promise<any[]> {
    return apiFetch<any[]>("/paginas");
  },

  async listarAdmin(): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/paginas/admin", { token });
  },

  async listarPublicas(): Promise<any[]> {
    return apiFetch<any[]>("/paginas/publicas");
  },

  async obter(pageId: string): Promise<any> {
    return apiFetch<any>(`/paginas/${pageId}`);
  },

  async criar(pagina: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>("/paginas", {
      method: "POST",
      body: pagina,
      token,
    });
  },

  async atualizar(pageId: string, pagina: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>(`/paginas/${pageId}`, {
      method: "PUT",
      body: pagina,
      token,
    });
  },

  async listarBlocos(pageId: string): Promise<any[]> {
    return apiFetch<any[]>(`/paginas/${pageId}/blocos`);
  },

  async atualizarBlocos(pageId: string, blocos: any[]): Promise<any> {
    const token = getToken();
    return apiFetch<any>(`/paginas/${pageId}/blocos`, {
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
