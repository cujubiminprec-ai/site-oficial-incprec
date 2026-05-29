import { apiFetch, getToken } from "./api";

export interface AtalhoRapido {
  id: number;
  label: string;
  descricao?: string;
  href: string;
  icone: string;
  iconeImg?: string;
  cor: string;
  locais: string[];
  externo: boolean;
  ordem: number;
  ativo: boolean;
}

export const LOCAIS_DISPONIVEIS = [
  { key: "rodape",    label: "Rodapé",    icon: "ri-layout-bottom-2-line" },
  { key: "inicio",    label: "Início",    icon: "ri-home-4-line" },
  { key: "cabecalho", label: "Cabeçalho", icon: "ri-layout-top-2-line" },
];

export const ICONES_ATALHOS = [
  "ri-link-line", "ri-home-4-line", "ri-user-line", "ri-shield-user-line",
  "ri-speak-line", "ri-question-answer-line", "ri-survey-line", "ri-file-text-line",
  "ri-newspaper-line", "ri-calendar-event-line", "ri-mail-line", "ri-phone-line",
  "ri-map-pin-line", "ri-building-2-line", "ri-government-line", "ri-bank-line",
  "ri-file-chart-line", "ri-bar-chart-box-line", "ri-funds-line", "ri-medal-2-line",
  "ri-graduation-cap-line", "ri-book-open-line", "ri-service-line", "ri-group-line",
  "ri-lock-2-line", "ri-information-line", "ri-star-line", "ri-heart-line",
  "ri-search-line", "ri-arrow-right-line", "ri-external-link-line", "ri-download-line",
];

export const atalhosService = {
  listar(): Promise<AtalhoRapido[]> {
    return apiFetch<AtalhoRapido[]>("/atalhos").catch(() => []);
  },

  listarAdmin(): Promise<AtalhoRapido[]> {
    const token = getToken();
    return apiFetch<AtalhoRapido[]>("/atalhos/admin", { token }).catch(() => []);
  },

  criar(atalho: Omit<AtalhoRapido, "id">): Promise<AtalhoRapido> {
    const token = getToken();
    return apiFetch<AtalhoRapido>("/atalhos", { method: "POST", body: atalho, token });
  },

  atualizar(id: number, atalho: Partial<AtalhoRapido>): Promise<AtalhoRapido> {
    const token = getToken();
    return apiFetch<AtalhoRapido>(`/atalhos/${id}`, { method: "PUT", body: atalho, token });
  },

  deletar(id: number): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/atalhos/${id}`, { method: "DELETE", token });
  },
};
