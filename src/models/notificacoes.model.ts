import { query } from "../config/database";

export const notificacoesModel = {
  async listarRecentes() {
    return (await query("SELECT * FROM notificacoes_admin ORDER BY criado_em DESC LIMIT 100")).rows;
  },

  async marcarComoLida(id: string) {
    await query("UPDATE notificacoes_admin SET lida = 1 WHERE id = $1", [id]);
  },

  async marcarTodasComoLidas() {
    await query("UPDATE notificacoes_admin SET lida = 1");
  },

  async remover(id: string) {
    await query("DELETE FROM notificacoes_admin WHERE id = $1", [id]);
  },

  async limpar() {
    await query("DELETE FROM notificacoes_admin");
  },
};
