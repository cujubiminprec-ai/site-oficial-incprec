import { query } from "../config/database";

type AuditoriaRow = {
  id: number | string;
  usuario_id: string | null;
  usuario_nome: string | null;
  usuario_email: string | null;
  acao: string;
  modulo: string;
  descricao: string | null;
  dados_anteriores: unknown;
  dados_novos: unknown;
  ip_origem: string | null;
  user_agent: string | null;
  criado_em: string | Date;
};

function toIsoString(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function stringifyDetalhes(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export const auditoriaModel = {
  async listarRecentes() {
    const rows = (await query<AuditoriaRow>("SELECT * FROM auditoria ORDER BY criado_em DESC LIMIT 500")).rows;
    return rows.map((row) => ({
      id: String(row.id),
      timestamp: toIsoString(row.criado_em),
      usuarioId: row.usuario_id ?? "",
      usuarioNome: row.usuario_nome || row.usuario_email || "Sistema",
      usuarioEmail: row.usuario_email ?? "",
      acao: row.acao,
      modulo: row.modulo,
      descricao: row.descricao ?? `${row.acao} em ${row.modulo}`,
      detalhes: stringifyDetalhes(row.dados_novos || row.dados_anteriores),
      ip: row.ip_origem ?? "",
      userAgent: row.user_agent ?? "",
      raw: row,
    }));
  },

  async limpar() {
    await query("DELETE FROM auditoria");
  },
};
