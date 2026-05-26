import { query, runInTransaction } from "../config/database";

export type MenuPayload = Record<string, unknown>;

async function menuRows() {
  return (await query("SELECT * FROM menu_navegacao ORDER BY parent_id ASC, posicao ASC, id ASC")).rows;
}

export const menuModel = {
  async listar() {
    return menuRows();
  },

  async salvarBulk(itens: MenuPayload[]) {
    await runInTransaction(async (connection) => {
      await query("DELETE FROM menu_navegacao", [], connection);
      for (const [index, item] of itens.entries()) {
        await query(`
        INSERT INTO menu_navegacao (label, url, icone, parent_id, posicao, novo_tab, ativo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
          item.label ?? item.titulo ?? "Item",
          item.url ?? item.href ?? "/",
          item.icone ?? item.icon ?? null,
          item.parentId ?? item.parent_id ?? null,
          item.posicao ?? item.ordem ?? index + 1,
          item.novoTab ? 1 : 0,
          item.ativo === false ? 0 : 1
        ], connection);
      }
    });
    return menuRows();
  },
};
