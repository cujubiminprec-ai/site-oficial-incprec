import { apiFetch, getToken } from "./api";

export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem?: string;
  image_url?: string;
  image_alt?: string;
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
}

export interface NoticiaCreate {
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem?: string;
  image_url?: string;
  image_alt?: string;
  categoria: string;
  destaque?: boolean;
  autor?: string;
  tags?: string[];
}

export interface NoticiaUpdate extends Partial<NoticiaCreate> {
  id: string;
}

export const noticiasService = {
  async listar(): Promise<Noticia[]> {
    return apiFetch<Noticia[]>("/noticias");
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
