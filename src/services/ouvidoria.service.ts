import { apiFetch, getToken } from "./api";

export interface Manifestacao {
  id?: string;
  protocolo: string;
  tipo: "reclamacao" | "sugestao" | "elogio" | "denuncia" | "informacao";
  assunto: string;
  descricao?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  anonimo: boolean;
  status?: string;
  resposta?: string;
  data_resposta?: string;
  criado_em?: string;
  respondido_em?: string;
  created_at?: string;
  [key: string]: any;
}

export interface ConsultaProtocoloResponse extends Partial<Manifestacao> {
  encontrado: boolean;
  manifestacao?: Manifestacao;
  diasRestantes?: number;
  prazoVencido?: boolean;
  [key: string]: any;
}

export const ouvidoriaService = {
  async registrar(manifestacao: Omit<Manifestacao, "id" | "protocolo" | "status" | "created_at">): Promise<Manifestacao> {
    return apiFetch<Manifestacao>("/ouvidoria", {
      method: "POST",
      body: manifestacao,
    });
  },

  async consultarProtocolo(protocolo: string): Promise<ConsultaProtocoloResponse> {
    return apiFetch<ConsultaProtocoloResponse>(`/ouvidoria/consultar/${protocolo}`);
  },

  async listar(): Promise<Manifestacao[]> {
    return apiFetch<Manifestacao[]>("/ouvidoria", { token: getToken() });
  },

  async detalhar(id: string | number): Promise<Manifestacao> {
    return apiFetch<Manifestacao>(`/ouvidoria/${id}`, { token: getToken() });
  },

  async responder(id: string | number, resposta: string, status = "respondida"): Promise<Manifestacao> {
    return apiFetch<Manifestacao>(`/ouvidoria/${id}/responder`, {
      method: "PATCH",
      body: { resposta, status },
      token: getToken(),
    });
  },

  async atualizarStatus(id: string | number, status: string): Promise<void> {
    return apiFetch<void>(`/ouvidoria/${id}/status`, {
      method: "PATCH",
      body: { status },
      token: getToken(),
    });
  },

  async excluir(id: string | number): Promise<void> {
    return apiFetch<void>(`/ouvidoria/${id}`, { method: "DELETE", token: getToken() });
  },
};
