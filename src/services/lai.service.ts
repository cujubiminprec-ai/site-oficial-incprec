import { apiFetch, getToken } from "./api";

export interface PedidoLAI {
  id?: string;
  protocolo: string;
  solicitante?: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  descricao?: string;
  classificacao?: "cidadao" | "jornalista" | "empresa" | "outro";
  formaResposta?: "email" | "correio" | "presencial";
  status?: string;
  resposta?: string;
  data_resposta?: string;
  criado_em?: string;
  respondido_em?: string;
  prazo_legal?: string;
  descricao_pedido?: string;
  prorrogado?: boolean;
  motivo_prorrogacao?: string;
  created_at?: string;
  [key: string]: any;
}

export interface ConsultaLAIResponse extends Partial<PedidoLAI> {
  encontrado: boolean;
  pedido?: PedidoLAI;
  diasRestantes?: number;
  prazoVencido?: boolean;
  prorrogado?: boolean;
  [key: string]: any;
}

export const laiService = {
  async registrar(pedido: Omit<PedidoLAI, "id" | "protocolo" | "status" | "created_at">): Promise<PedidoLAI> {
    return apiFetch<PedidoLAI>("/lai", {
      method: "POST",
      body: pedido,
    });
  },

  async consultarProtocolo(protocolo: string): Promise<ConsultaLAIResponse> {
    return apiFetch<ConsultaLAIResponse>(`/lai/consultar/${protocolo}`);
  },

  async listar(): Promise<PedidoLAI[]> {
    return apiFetch<PedidoLAI[]>("/lai", { token: getToken() });
  },

  async detalhar(id: string | number): Promise<PedidoLAI> {
    return apiFetch<PedidoLAI>(`/lai/${id}`, { token: getToken() });
  },

  async responder(id: string | number, resposta: string, status = "respondido"): Promise<PedidoLAI> {
    return apiFetch<PedidoLAI>(`/lai/${id}/responder`, {
      method: "PATCH",
      body: { resposta, status },
      token: getToken(),
    });
  },

  async atualizarStatus(id: string | number, status: string): Promise<void> {
    return apiFetch<void>(`/lai/${id}/status`, {
      method: "PATCH",
      body: { status },
      token: getToken(),
    });
  },

  async excluir(id: string | number): Promise<void> {
    return apiFetch<void>(`/lai/${id}`, { method: "DELETE", token: getToken() });
  },
};
