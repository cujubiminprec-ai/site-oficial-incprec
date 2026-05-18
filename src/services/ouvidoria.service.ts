import { apiFetch } from "./api";

export interface Manifestacao {
  id?: string;
  protocolo: string;
  tipo: "reclamacao" | "sugestao" | "elogio" | "denuncia" | "informacao";
  assunto: string;
  descricao: string;
  nome?: string;
  email?: string;
  telefone?: string;
  anonimo: boolean;
  status?: "pendente" | "em_analise" | "respondida" | "arquivada";
  resposta?: string;
  data_resposta?: string;
  created_at?: string;
}

export interface ConsultaProtocoloResponse {
  encontrado: boolean;
  manifestacao?: Manifestacao;
  diasRestantes?: number;
  prazoVencido?: boolean;
}

export const ouvidoriaService = {
  async registrar(manifestacao: Omit<Manifestacao, "id" | "protocolo" | "status" | "created_at">): Promise<Manifestacao> {
    return apiFetch<Manifestacao>("/ouvidoria", {
      method: "POST",
      body: manifestacao,
    });
  },

  async consultarProtocolo(protocolo: string): Promise<ConsultaProtocoloResponse> {
    return apiFetch<ConsultaProtocoloResponse>(`/ouvidoria/protocolo/${protocolo}`);
  },

  async listar(): Promise<Manifestacao[]> {
    const token = localStorage.getItem("inprec_api_token");
    return apiFetch<Manifestacao[]>("/ouvidoria", { token });
  },

  async responder(id: string, resposta: string): Promise<Manifestacao> {
    const token = localStorage.getItem("inprec_api_token");
    return apiFetch<Manifestacao>(`/ouvidoria/${id}/responder`, {
      method: "PUT",
      body: { resposta },
      token,
    });
  },
};