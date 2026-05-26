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
      SELECT path, COALESCE(page_name, path) AS pageName,
        SUM(CASE WHEN tipo = 'page_view' THEN 1 ELSE 0 END) AS visits,
        SUM(CASE WHEN tipo = 'click' THEN 1 ELSE 0 END) AS clicks
      FROM analytics_eventos
      GROUP BY path, page_name
      ORDER BY visits DESC, clicks DESC
      LIMIT 50
    `)).rows;

    const meses = (await query(`
      SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes, COUNT(*) AS total
      FROM analytics_eventos
      GROUP BY DATE_FORMAT(criado_em, '%Y-%m')
      ORDER BY mes DESC
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
};
