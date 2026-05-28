import { apiFetch, getToken } from "./api";

export interface PesquisaResumo {
  total: number;
  media: number;
  recomendacao: number;
  distribuicao: { stars: number; count: number; percent: number }[];
  criterios: { chave: string; media: number; percent: number }[];
}

export const pesquisaService = {
  enviar(payload: Record<string, unknown>) {
    return apiFetch("/pesquisa", { method: "POST", body: payload });
  },
  resumo() {
    return apiFetch<PesquisaResumo | null>("/pesquisa/resumo");
  },
  listar() {
    return apiFetch<Record<string, unknown>[]>("/pesquisa", { token: getToken() });
  },
};
