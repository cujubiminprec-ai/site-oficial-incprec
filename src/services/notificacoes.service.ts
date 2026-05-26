import { apiFetch } from "./api";

export const notificacoesService = {
  listar() {
    return apiFetch<Record<string, unknown>[]>("/notificacoes");
  },
  marcarLida(id: number | string) {
    return apiFetch(`/notificacoes/${id}/lida`, { method: "PATCH" });
  },
  marcarTodasLidas() {
    return apiFetch("/notificacoes/lidas", { method: "PATCH" });
  },
  remover(id: number | string) {
    return apiFetch(`/notificacoes/${id}`, { method: "DELETE" });
  },
  limparTodas() {
    return apiFetch("/notificacoes", { method: "DELETE" });
  },
};
