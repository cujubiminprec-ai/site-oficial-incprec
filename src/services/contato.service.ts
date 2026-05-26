import { apiFetch, getToken } from "./api";

export const contatoService = {
  enviar(payload: Record<string, unknown>) {
    return apiFetch("/contato", { method: "POST", body: payload });
  },
  listar() {
    return apiFetch<Record<string, unknown>[]>("/contato", { token: getToken() });
  },
  atualizarStatus(id: number | string, status: string) {
    return apiFetch(`/contato/${id}/status`, { method: "PATCH", body: { status }, token: getToken() });
  },
};
