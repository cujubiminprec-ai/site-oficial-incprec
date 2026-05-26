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

function mapCursoApi(curso: any): CursoGestor {
  return {
    ...curso,
    gestor_id: Number(curso.gestor_id ?? curso.gestorId ?? 0),
    cargaHoraria: curso.cargaHoraria ?? curso.carga_horaria ?? "",
  };
}

function mapDocumentoApi(doc: any): DocumentoGestor {
  return {
    ...doc,
    gestor_id: Number(doc.gestor_id ?? doc.gestorId ?? 0),
    url: doc.url ?? doc.arquivo_url ?? "",
  };
}

function mapGestorApi(gestor: any): Gestor {
  return {
    ...gestor,
    id: Number(gestor.id),
    foto: gestor.foto ?? gestor.foto_url ?? "",
    periodo: gestor.periodo ?? gestor.mandato ?? "",
    biografia: gestor.biografia ?? gestor.bio ?? "",
    bio: gestor.bio ?? gestor.biografia ?? "",
    ordem: Number(gestor.ordem ?? gestor.posicao ?? 0),
    ativo: gestor.ativo !== false && gestor.ativo !== 0,
    cursos: Array.isArray(gestor.cursos) ? gestor.cursos.map(mapCursoApi) : [],
    documentos: Array.isArray(gestor.documentos) ? gestor.documentos.map(mapDocumentoApi) : [],
  };
}

function mapGestorPayload(gestor: any) {
  return {
    ...gestor,
    foto_url: gestor.foto_url ?? gestor.foto ?? null,
    bio: gestor.bio ?? gestor.biografia ?? "",
    mandato: gestor.mandato ?? gestor.periodo ?? "",
    posicao: gestor.posicao ?? gestor.ordem ?? 0,
    cursos: Array.isArray(gestor.cursos) ? gestor.cursos : [],
    documentos: Array.isArray(gestor.documentos) ? gestor.documentos.map((doc: any) => ({ ...doc, arquivo_url: doc.arquivo_url ?? doc.url ?? "" })) : [],
  };
}

export const gestoresService = {
  async listar(options?: Record<string, unknown>): Promise<any[]> {
    const query = options?.incluirInativos ? "?incluirInativos=true" : "";
    const data = await apiFetch<any[]>(`/gestores${query}`);
    return data.map(mapGestorApi);
  },

  async obter(id: string): Promise<any> {
    return apiFetch<any>(`/gestores/${id}`).then(mapGestorApi);
  },

  async criar(gestor: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>("/gestores", {
      method: "POST",
      body: mapGestorPayload(gestor),
      token,
    }).then(mapGestorApi);
  },

  async atualizar(id: string | number, gestor: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>(`/gestores/${id}`, {
      method: "PUT",
      body: mapGestorPayload(gestor),
      token,
    }).then(mapGestorApi);
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
