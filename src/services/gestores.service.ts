import { apiFetch, getToken } from "./api";

export interface Gestor {
  id: string;
  nome: string;
  cargo: string;
  periodo: string;
  foto?: string;
  biografia?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  ordem: number;
  created_at?: string;
}

export interface CursoGestor {
  id?: string;
  gestor_id: string;
  titulo: string;
  instituicao: string;
  ano: string;
  tipo: string;
}

export interface DocumentoGestor {
  id?: string;
  gestor_id: string;
  titulo: string;
  tipo: string;
  url: string;
  data: string;
}

export const gestoresService = {
  async listar(): Promise<Gestor[]> {
    return apiFetch<Gestor[]>("/gestores");
  },

  async obter(id: string): Promise<Gestor> {
    return apiFetch<Gestor>(`/gestores/${id}`);
  },

  async criar(gestor: Omit<Gestor, "id" | "created_at">): Promise<Gestor> {
    const token = getToken();
    return apiFetch<Gestor>("/gestores", {
      method: "POST",
      body: gestor,
      token,
    });
  },

  async atualizar(id: string, gestor: Partial<Omit<Gestor, "id" | "created_at">>): Promise<Gestor> {
    const token = getToken();
    return apiFetch<Gestor>(`/gestores/${id}`, {
      method: "PUT",
      body: gestor,
      token,
    });
  },

  async deletar(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/gestores/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async listarCursos(gestorId: string): Promise<CursoGestor[]> {
    return apiFetch<CursoGestor[]>(`/gestores/${gestorId}/cursos`);
  },

  async listarDocumentos(gestorId: string): Promise<DocumentoGestor[]> {
    return apiFetch<DocumentoGestor[]>(`/gestores/${gestorId}/documentos`);
  },
};