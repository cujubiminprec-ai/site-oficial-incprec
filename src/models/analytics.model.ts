import { query, queryOne } from "../config/database";

export type AnalyticsPayload = Record<string, unknown> & {
  tipo?: string;
  path?: string;
};

export const analyticsModel = {
  async track(payload: AnalyticsPayload, ip?: string, userAgent?: string | string[]) {
    const { tipo, path, pageName, page_name, referrer, elementLabel, element_label, elementHref, element_href } = payload;
    await query(`
      INSERT INTO analytics_eventos (tipo, path, page_name, referrer, element_label, element_href, ip_origem, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      tipo,
      path,
      pageName ?? page_name ?? null,
      referrer ?? null,
      elementLabel ?? element_label ?? null,
      elementHref ?? element_href ?? null,
      ip,
      Array.isArray(userAgent) ? userAgent.join(" ") : userAgent ?? null
    ]);
    return { gravado: true };
  },

  async resumoAdmin() {
    const totals = await queryOne<{ total: number; page_views: number; clicks: number }>(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN tipo = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN tipo = 'click' THEN 1 ELSE 0 END) AS clicks
      FROM analytics_eventos
    `) ?? { total: 0, page_views: 0, clicks: 0 };

    const paginas = (await query(`
      SELECT path, COALESCE(page_name, path) AS name, COALESCE(page_name, path) AS pageName,
        SUM(CASE WHEN tipo = 'page_view' THEN 1 ELSE 0 END) AS visits,
        SUM(CASE WHEN tipo = 'click' THEN 1 ELSE 0 END) AS clicks
      FROM analytics_eventos
      GROUP BY path, page_name
      ORDER BY visits DESC, clicks DESC
      LIMIT 50
    `)).rows;

    const meses = (await query(`
      SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes,
        SUM(CASE WHEN tipo = 'page_view' THEN 1 ELSE 0 END) AS visitas,
        SUM(CASE WHEN tipo = 'click' THEN 1 ELSE 0 END) AS cliques,
        COUNT(*) AS total
      FROM analytics_eventos
      GROUP BY DATE_FORMAT(criado_em, '%Y-%m')
      ORDER BY mes ASC
      LIMIT 12
    `)).rows;

    return {
      totalVisitas: Number(totals.page_views || 0),
      totalCliques: Number(totals.clicks || 0),
      totalEventos: Number(totals.total || 0),
      paginas,
      meses,
    };
  },

  async onlineAgora() {
    const row = await queryOne<{ online: number }>(`
      SELECT COUNT(DISTINCT ip_origem) AS online
      FROM analytics_eventos
      WHERE criado_em >= NOW() - INTERVAL 5 MINUTE
        AND ip_origem IS NOT NULL
        AND ip_origem != ''
    `);
    return { online: Number(row?.online || 0) };
  },

  async dashboardMensal() {
    const meses = (await query(`
      SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes,
        DATE_FORMAT(criado_em, '%b/%y') AS mesLabel,
        SUM(CASE WHEN tipo = 'page_view' THEN 1 ELSE 0 END) AS visitas,
        SUM(CASE WHEN tipo = 'click' THEN 1 ELSE 0 END) AS cliques,
        COUNT(DISTINCT ip_origem) AS visitantes_unicos
      FROM analytics_eventos
      WHERE criado_em >= NOW() - INTERVAL 12 MONTH
      GROUP BY DATE_FORMAT(criado_em, '%Y-%m'), DATE_FORMAT(criado_em, '%b/%y')
      ORDER BY mes ASC
    `)).rows;

    const totals = await queryOne<{ total_views: number; total_clicks: number; hoje: number; semana: number }>(`
      SELECT
        SUM(CASE WHEN tipo = 'page_view' THEN 1 ELSE 0 END) AS total_views,
        SUM(CASE WHEN tipo = 'click' THEN 1 ELSE 0 END) AS total_clicks,
        SUM(CASE WHEN DATE(criado_em) = CURDATE() AND tipo = 'page_view' THEN 1 ELSE 0 END) AS hoje,
        SUM(CASE WHEN criado_em >= NOW() - INTERVAL 7 DAY AND tipo = 'page_view' THEN 1 ELSE 0 END) AS semana
      FROM analytics_eventos
    `) ?? { total_views: 0, total_clicks: 0, hoje: 0, semana: 0 };

    return {
      meses: meses.map((m) => ({
        mes: String(m.mes || ""),
        mesLabel: String(m.mesLabel || m.mes || ""),
        visitas: Number(m.visitas || 0),
        cliques: Number(m.cliques || 0),
        visitantesUnicos: Number(m.visitantes_unicos || 0),
      })),
      totalVisitas: Number(totals.total_views || 0),
      totalCliques: Number(totals.total_clicks || 0),
      hoje: Number(totals.hoje || 0),
      semana: Number(totals.semana || 0),
    };
  },
};
