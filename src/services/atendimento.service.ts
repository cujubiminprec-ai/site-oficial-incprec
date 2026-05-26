import { apiFetch, getToken } from "./api";

export interface ContatoMensagem {
  [key: string]: any;
}

export interface PesquisaResposta {
  ratings?: Record<string, any>;
  comentario?: string;
  nota?: number;
  [key: string]: any;
}

export interface FormularioResposta {
  [key: string]: any;
}

export const atendimentoService = {
  listarContato() {
    return apiFetch<ContatoMensagem[]>("/contato", { token: getToken() });
  },
  atualizarContato(id: number | string, payload: Record<string, unknown>) {
    return apiFetch<Record<string, unknown>>(`/contato/${id}/status`, { method: "PATCH", body: payload, token: getToken() });
  },
  listarPesquisas() {
    return apiFetch<PesquisaResposta[]>("/pesquisa", { token: getToken() });
  },
  listarFormularios() {
    return apiFetch<FormularioResposta[]>("/formularios/admin", { token: getToken() });
  },
  marcarFormularioComoLido(id: number | string) {
    return apiFetch(`/formularios/admin/${id}/lida`, { method: "PATCH", token: getToken() });
  },
};
