import { apiFetch } from "./api";

export interface PedidoLAI {
  id?: string;
  protocolo: string;
  solicitante: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  descricao: string;
  classificacao: "cidadao" | "jornalista" | "empresa" | "outro";
  formaResposta: "email" | "correio" | "presencial";
  status?: "pendente" | "em_analise" | "respondida" | "arquivada" | "prorrogada";
  resposta?: string;
  data_resposta?: string;
  prorrogado?: boolean;
  motivo_prorrogacao?: string;
  created_at?: string;
}

export interface ConsultaLAIResponse {
  encontrado: boolean;
  pedido?: PedidoLAI;
  diasRestantes?: number;
  prazoVencido?: boolean;
  prorrogado?: boolean;
}

export const laiService = {
  async registrar(pedido: Omit<PedidoLAI, "id" | "protocolo" | "status" | "created_at">): Promise<PedidoLAI> {
    return apiFetch<PedidoLAI>("/lai", {
      method: "POST",
      body: pedido,
    });
  },

  async consultarProtocolo(protocolo: string): Promise<ConsultaLAIResponse> {
    return apiFetch<ConsultaLAIResponse>(`/lai/protocolo/${protocolo}`);
  },

  async listar(): Promise<PedidoLAI[]> {
    const token = localStorage.getItem("inprec_api_token");
    return apiFetch<PedidoLAI[]>("/lai", { token });
  },

  async responder(id: string, resposta: string): Promise<PedidoLAI> {
    const token = localStorage.getItem("inprec_api_token");
    return apiFetch<PedidoLAI>(`/lai/${id}/responder`, {
      method: "PUT",
      body: { resposta },
      token,
    });
  },
};