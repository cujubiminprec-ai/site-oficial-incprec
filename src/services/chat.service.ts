import { apiFetch, getToken } from "./api";

export interface ChatMensagem {
  id?: number;
  conversa_id?: number;
  origem: "visitante" | "bot" | "operador";
  mensagem: string;
  criado_em?: string;
}

export interface ChatConversa {
  id: number;
  session_id: string;
  nome?: string;
  email?: string;
  status: string;
  criado_em?: string;
  atualizado_em?: string;
  ultima_mensagem?: string;
  total_mensagens?: number;
  mensagens?: ChatMensagem[];
}

export const chatService = {
  iniciar(sessionId?: string): Promise<{ sessionId: string; conversa: ChatConversa }> {
    return apiFetch("/chat/conversas", { method: "POST", body: { sessionId } });
  },

  enviar(sessionId: string, mensagem: string): Promise<{ conversa: ChatConversa; mensagem: ChatMensagem; resposta: ChatMensagem }> {
    return apiFetch("/chat/mensagens", { method: "POST", body: { sessionId, mensagem } });
  },

  mensagens(sessionId: string): Promise<ChatMensagem[]> {
    return apiFetch(`/chat/conversas/${sessionId}/mensagens`);
  },

  listarAdmin(): Promise<ChatConversa[]> {
    return apiFetch("/chat/admin", { token: getToken() });
  },

  detalhar(id: number | string): Promise<ChatConversa> {
    return apiFetch(`/chat/admin/${id}`, { token: getToken() });
  },

  responder(id: number | string, mensagem: string): Promise<ChatMensagem> {
    return apiFetch(`/chat/admin/${id}/responder`, { method: "POST", body: { mensagem }, token: getToken() });
  },

  atualizarStatus(id: number | string, status: string): Promise<void> {
    return apiFetch(`/chat/admin/${id}/status`, { method: "PATCH", body: { status }, token: getToken() });
  },

  excluir(id: number | string): Promise<void> {
    return apiFetch(`/chat/admin/${id}`, { method: "DELETE", token: getToken() });
  },
};
