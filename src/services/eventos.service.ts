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
}

export interface InscricaoEvento {
  id?: string;
  evento_id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  confirmado: boolean;
  created_at?: string;
}

export const eventosService = {
  async listar(): Promise<Evento[]> {
    return apiFetch<Evento[]>("/eventos");
  },

  async obter(id: string): Promise<Evento> {
    return apiFetch<Evento>(`/eventos/${id}`);
  },

  async criar(evento: Omit<Evento, "id" | "created_at">): Promise<Evento> {
    const token = getToken();
    return apiFetch<Evento>("/eventos", {
      method: "POST",
      body: evento,
      token,
    });
  },

  async atualizar(id: string, evento: Partial<Omit<Evento, "id" | "created_at">>): Promise<Evento> {
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

  async inscrever(eventoId: string, inscricao: Omit<InscricaoEvento, "id" | "evento_id" | "confirmado" | "created_at">): Promise<InscricaoEvento> {
    return apiFetch<InscricaoEvento>(`/eventos/${eventoId}/inscrever`, {
      method: "POST",
      body: inscricao,
    });
  },

  async listarInscricoes(eventoId: string): Promise<InscricaoEvento[]> {
    const token = getToken();
    return apiFetch<InscricaoEvento[]>(`/eventos/${eventoId}/inscricoes`, { token });
  },
};
