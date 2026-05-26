import { apiFetch, getToken } from "./api";

export interface Gestor {
  id: number;
  nome: string;
  cargo: string;
  grupo: "diretoria" | "comite" | "fiscal" | "deliberativo";
  periodo: string;
  foto: string;
  biografia?: string;
  email: string;
  telefone?: string;
  matricula?: string;
  bio: string;
  formacao: string;
  cursos: CursoGestor[];
  documentos: DocumentoGestor[];
  mandato?: string;
  ativo: boolean;
  ordem: number;
  created_at?: string;
}

export interface CursoGestor {
  id: number;
  gestor_id: number;
  titulo: string;
  instituicao: string;
  ano: number;
  tipo: string;
  cargaHoraria?: string;
}

export interface DocumentoGestor {
  id: number;
  gestor_id: number;
  titulo: string;
  tipo: string;
  tamanho?: string;
  url: string;
  data: string;
}

export const gestoresService = {
  async listar(_options?: Record<string, unknown>): Promise<any[]> {
    return apiFetch<any[]>("/gestores");
  },

  async obter(id: string): Promise<any> {
    return apiFetch<any>(`/gestores/${id}`);
  },

  async criar(gestor: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>("/gestores", {
      method: "POST",
      body: gestor,
      token,
    });
  },

  async atualizar(id: string | number, gestor: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>(`/gestores/${id}`, {
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
