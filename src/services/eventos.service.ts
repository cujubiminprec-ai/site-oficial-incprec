import { apiFetch, getToken } from "./api";

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data?: string;
  data_inicio?: string;
  hora?: string;
  hora_inicio?: string;
  local: string;
  tipo: string;
  imagem?: string;
  imagem_url?: string;
  vagas?: number;
  vagas_restantes?: number;
  inscricoes?: number;
  encerrado?: boolean;
  status?: string;
  online?: boolean;
  link?: string;
  link_online?: string;
  palestrante?: string;
  categoria?: string;
  certificado?: boolean;
  carga_horaria?: string;
  created_at?: string;
  publicado?: boolean;
  [key: string]: any;
}

export interface InscricaoEvento {
  id?: string;
  evento_id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  matricula?: string;
  cargo?: string;
  status?: string;
  confirmado: boolean;
  created_at?: string;
  [key: string]: any;
}

export const eventosService = {
  async listar(): Promise<any[]> {
    return apiFetch<any[]>("/eventos");
  },

  async listarAdmin(): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/eventos/admin", { token });
  },

  async obter(id: string): Promise<Evento> {
    return apiFetch<Evento>(`/eventos/${id}`);
  },

  async criar(evento: any): Promise<any> {
    const token = getToken();
    return apiFetch<Evento>("/eventos", {
      method: "POST",
      body: evento,
      token,
    });
  },

  async atualizar(id: string, evento: any): Promise<any> {
    const token = getToken();
    return apiFetch<Evento>(`/eventos/${id}`, {
      method: "PUT",
      body: evento,
      token,
    });
  },

  async deletar(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/eventos/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async inscrever(eventoId: string, inscricao: any): Promise<any> {
    return apiFetch<InscricaoEvento>(`/eventos/${eventoId}/inscrever`, {
      method: "POST",
      body: inscricao,
    });
  },

  async listarInscricoes(eventoId: string): Promise<InscricaoEvento[]> {
    const token = getToken();
    return apiFetch<InscricaoEvento[]>(`/eventos/${eventoId}/inscricoes`, { token });
  },

  async listarInscricoesAdmin(): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/eventos/inscricoes/admin", { token });
  },

  async criarInscricaoAdmin(eventoIdOrPayload: any, payload?: any): Promise<any> {
    const token = getToken();
    const body = payload ? { ...payload, eventoId: eventoIdOrPayload } : eventoIdOrPayload;
    return apiFetch<any>("/eventos/inscricoes/admin", { method: "POST", body, token });
  },

  async atualizarInscricao(eventoIdOrId: string | number, idOrPayload: any, payload?: any): Promise<any> {
    const token = getToken();
    const id = payload ? idOrPayload : eventoIdOrId;
    const body = payload ?? idOrPayload;
    return apiFetch<any>(`/eventos/inscricoes/${id}`, { method: "PUT", body, token });
  },

  async deletarInscricao(eventoIdOrId: string | number, idMaybe?: string | number): Promise<void> {
    const token = getToken();
    const id = idMaybe ?? eventoIdOrId;
    return apiFetch<void>(`/eventos/inscricoes/${id}`, { method: "DELETE", token });
  },
};
