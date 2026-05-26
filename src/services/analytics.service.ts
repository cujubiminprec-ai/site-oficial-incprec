import { apiFetch, getToken } from "./api";

export interface AnalyticsPageStat {
  path: string;
  name?: string;
  pageName?: string;
  visits: number;
  clicks: number;
  [key: string]: any;
}

export interface AnalyticsMonthStat {
  mes: string;
  total: number;
  visitas?: number;
  cliques?: number;
  [key: string]: any;
}

export const analyticsService = {
  track(payload: Record<string, unknown>) {
    return apiFetch("/analytics/track", { method: "POST", body: payload });
  },
  listarAdmin() {
    return apiFetch<{
      totalVisitas: number;
      totalCliques: number;
      totalEventos: number;
      paginas: AnalyticsPageStat[];
      meses: AnalyticsMonthStat[];
    }>("/analytics/admin", { token: getToken() });
  },
};
