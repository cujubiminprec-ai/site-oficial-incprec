import { query } from "../config/database";

export type PesquisaPayload = {
  nota?: number | string | null;
  nome?: string | null;
  email?: string | null;
  comentario?: string | null;
  servico?: string | null;
  ratings?: Record<string, number> | null;
};

function calcularNota(payload: PesquisaPayload): number {
  if (payload.nota !== undefined && payload.nota !== null && String(payload.nota).trim() !== "") {
    const n = Number(payload.nota);
    if (!Number.isNaN(n) && n >= 1 && n <= 5) return n;
  }
  if (payload.ratings && typeof payload.ratings === "object") {
    const valores = Object.values(payload.ratings).map(Number).filter((v) => !Number.isNaN(v) && v >= 1 && v <= 5);
    if (valores.length > 0) return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
  }
  return 0;
}

export const pesquisaModel = {
  async criar(payload: PesquisaPayload, ip?: string) {
    const nota = calcularNota(payload);
    const ratings = payload.ratings && typeof payload.ratings === "object" ? payload.ratings : null;
    const info = await query(
      "INSERT INTO pesquisa_satisfacao (nota, nome, email, comentario, servico, ratings, ip_origem) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        nota,
        payload.nome ? String(payload.nome).slice(0, 120) : null,
        payload.email ? String(payload.email).slice(0, 150) : null,
        payload.comentario ? String(payload.comentario).slice(0, 1000) : null,
        payload.servico ? String(payload.servico).slice(0, 100) : null,
        ratings ? JSON.stringify(ratings) : null,
        ip ?? null,
      ]
    );
    return { id: info.insertId, nota };
  },

  async listarRecentes() {
    return (await query("SELECT id, nota, nome, email, comentario, servico, ratings, criado_em FROM pesquisa_satisfacao ORDER BY criado_em DESC LIMIT 500")).rows;
  },

  async resumoPublico() {
    const rows = (await query("SELECT nota, ratings FROM pesquisa_satisfacao WHERE nota > 0")).rows as Array<{ nota: number; ratings: unknown }>;
    if (rows.length === 0) return null;

    const total = rows.length;
    const soma = rows.reduce((acc, r) => acc + Number(r.nota), 0);
    const media = Math.round((soma / total) * 10) / 10;

    const distribuicao: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach((r) => {
      const n = Math.round(Number(r.nota));
      if (n >= 1 && n <= 5) distribuicao[n]++;
    });
    const dist = Object.entries(distribuicao).map(([stars, count]) => ({
      stars: Number(stars),
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    const criteriosSoma: Record<string, number[]> = {};
    rows.forEach((r) => {
      if (r.ratings && typeof r.ratings === "object") {
        Object.entries(r.ratings as Record<string, number>).forEach(([k, v]) => {
          if (!criteriosSoma[k]) criteriosSoma[k] = [];
          criteriosSoma[k].push(Number(v));
        });
      }
    });
    const criterios = Object.entries(criteriosSoma).map(([chave, valores]) => ({
      chave,
      media: Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10,
      percent: Math.round((valores.reduce((a, b) => a + b, 0) / valores.length / 5) * 100),
    }));

    const recomendacao = total > 0 ? Math.round((rows.filter((r) => Number(r.nota) >= 4).length / total) * 100) : 0;

    return { total, media, distribuicao: dist, criterios, recomendacao };
  },
};
