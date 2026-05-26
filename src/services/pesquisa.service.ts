import { apiFetch, getToken } from "./api";

export const pesquisaService = {
  enviar(payload: Record<string, unknown>) {
    return apiFetch("/pesquisa", { method: "POST", body: payload });
  },
  listar() {
    return apiFetch<Record<string, unknown>[]>("/pesquisa", { token: getToken() });
  },
};
