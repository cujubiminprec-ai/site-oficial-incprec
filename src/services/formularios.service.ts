import { apiFetch, getToken } from "./api";

export const formulariosService = {
  enviar(payload: Record<string, unknown>) {
    return apiFetch("/formularios", { method: "POST", body: payload });
  },
  listarAdmin() {
    return apiFetch<Record<string, unknown>[]>("/formularios/admin", { token: getToken() });
  },
  marcarComoLido(id: number | string) {
    return apiFetch(`/formularios/admin/${id}/lida`, { method: "PATCH", token: getToken() });
  },
};
