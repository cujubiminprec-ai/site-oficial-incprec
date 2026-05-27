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
  async listarAdmin() {
    const data = await apiFetch<{
      totalVisitas: number;
      totalCliques: number;
      totalEventos: number;
      paginas: AnalyticsPageStat[];
      meses: AnalyticsMonthStat[];
    }>("/analytics/admin", { token: getToken() });

    return {
      ...data,
      paginas: (data.paginas || []).map((p) => ({
        ...p,
        name: p.name || p.pageName || p.path || "Pagina",
        visits: Number(p.visits || 0),
        clicks: Number(p.clicks || 0),
      })),
      meses: (data.meses || []).map((m) => ({
        ...m,
        visitas: Number(m.visitas || 0),
        cliques: Number(m.cliques || 0),
        total: Number(m.total || 0),
      })),
    };
  },
};
