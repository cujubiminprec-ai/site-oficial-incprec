import { apiFetch, getToken } from "./api";

export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem?: string;
  image_url?: string;
  image_alt?: string;
  images?: { id: string; url: string; isCover?: boolean; ativo?: boolean }[];
  categoria: string;
  data?: string;
  criado_em?: string;
  publicado_em?: string;
  destaque: boolean;
  autor: string;
  tags: string[];
  visualizacoes: number;
  slug?: string;
  atualizado_em?: string;
  publicada?: boolean;
  publicado?: boolean;
  [key: string]: any;
}

export interface NoticiaCreate {
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem?: string;
  image_url?: string;
  image_alt?: string;
  images?: { id: string; url: string; isCover?: boolean; ativo?: boolean }[];
  categoria: string;
  destaque?: boolean;
  autor?: string;
  tags?: string[];
  publicada?: boolean;
  publicado?: boolean;
  [key: string]: any;
}

export interface NoticiaUpdate extends Partial<NoticiaCreate> {
  id: string;
}

export const noticiasService = {
  async listar(params?: { pagina?: number; limite?: number; categoria?: string; busca?: string }): Promise<Noticia[]> {
    const query = new URLSearchParams();
    if (params?.pagina) query.set("pagina", String(params.pagina));
    if (params?.limite) query.set("limite", String(params.limite));
    if (params?.categoria) query.set("categoria", params.categoria);
    if (params?.busca) query.set("busca", params.busca);
    const suffix = query.toString() ? "?" + query.toString() : "";
    return apiFetch<Noticia[]>("/noticias" + suffix);
  },

  async listarAdmin(): Promise<Noticia[]> {
    const token = getToken();
    return apiFetch<Noticia[]>("/noticias/admin", { token });
  },

  async obter(id: string): Promise<Noticia> {
    return apiFetch<Noticia>(`/noticias/${id}`);
  },

  async criar(noticia: NoticiaCreate): Promise<Noticia> {
    const token = getToken();
    return apiFetch<Noticia>("/noticias", {
      method: "POST",
      body: noticia,
      token,
    });
  },

  async atualizar(id: string, noticia: Partial<NoticiaCreate>): Promise<Noticia> {
    const token = getToken();
    return apiFetch<Noticia>(`/noticias/${id}`, {
      method: "PUT",
      body: noticia,
      token,
    });
  },

  async deletar(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/noticias/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async incrementarVisualizacoes(id: string): Promise<void> {
    return apiFetch<void>(`/noticias/${id}/visualizacoes`, {
      method: "PATCH",
    });
  },
};
