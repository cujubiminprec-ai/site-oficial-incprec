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

export interface AnalyticsDashboard {
  meses: { mes: string; mesLabel: string; visitas: number; cliques: number; visitantesUnicos: number }[];
  totalVisitas: number;
  totalCliques: number;
  hoje: number;
  semana: number;
}

export const analyticsService = {
  track(payload: Record<string, unknown>) {
    return apiFetch("/analytics/track", { method: "POST", body: payload });
  },

  async onlineAgora(): Promise<number> {
    const data = await apiFetch<{ online: number }>("/analytics/online", { token: getToken() }).catch(() => ({ online: 0 }));
    return Number(data.online || 0);
  },

  async dashboardMensal(): Promise<AnalyticsDashboard> {
    return apiFetch<AnalyticsDashboard>("/analytics/dashboard", { token: getToken() }).catch(() => ({
      meses: [], totalVisitas: 0, totalCliques: 0, hoje: 0, semana: 0,
    }));
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
