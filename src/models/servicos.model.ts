import { query, queryOne } from "../config/database";

export type ServicoPayload = Record<string, unknown>;

function rowToServico(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    icone: String(row.icone || "ri-service-line"),
    titulo: String(row.titulo || ""),
    descricao: String(row.descricao || ""),
    link: String(row.link_url || ""),
    linkUrl: String(row.link_url || ""),
    ordem: Number(row.posicao || 0),
    destaque: row.destaque === 1,
    ativo: row.ativo !== 0,
  };
}

function servicoValues(item: ServicoPayload) {
  return [
    item.icone ?? "ri-service-line",
    item.titulo ?? "Servico",
    item.descricao ?? "",
    item.linkUrl ?? item.link ?? "",
    item.ordem ?? 0,
    item.destaque ? 1 : 0,
    item.ativo === false ? 0 : 1,
  ];
}

export const servicosModel = {
  async listarPublicos() {
    const rows = (await query("SELECT * FROM servicos WHERE ativo = 1 ORDER BY posicao ASC, id ASC")).rows;
    return rows.map(rowToServico);
  },

  async listarAdmin() {
    const rows = (await query("SELECT * FROM servicos ORDER BY posicao ASC, id ASC")).rows;
    return rows.map(rowToServico);
  },

  async criar(item: ServicoPayload) {
    const info = await query(`
      INSERT INTO servicos (icone, titulo, descricao, link_url, posicao, destaque, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, servicoValues(item));
    const row = await queryOne("SELECT * FROM servicos WHERE id = $1", [info.insertId]) as Record<string, unknown>;
    return rowToServico(row);
  },

  async atualizar(id: string, item: ServicoPayload) {
    await query(`
      UPDATE servicos
      SET icone = $1, titulo = $2, descricao = $3, link_url = $4, posicao = $5, destaque = $6, ativo = $7, atualizado_em = NOW()
      WHERE id = $8
    `, [...servicoValues(item), id]);
    const row = await queryOne("SELECT * FROM servicos WHERE id = $1", [id]) as Record<string, unknown>;
    return rowToServico(row);
  },

  async remover(id: string) {
    await query("DELETE FROM servicos WHERE id = $1", [id]);
  },
};
