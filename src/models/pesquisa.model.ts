import { query } from "../config/database";

export type PesquisaPayload = {
  nota: number | string;
  comentario?: string | null;
  servico?: string | null;
};

export const pesquisaModel = {
  async criar(payload: PesquisaPayload, ip?: string) {
    const info = await query("INSERT INTO pesquisa_satisfacao (nota, comentario, servico, ip_origem) VALUES ($1, $2, $3, $4)", [
      Number(payload.nota),
      payload.comentario ?? null,
      payload.servico ?? null,
      ip,
    ]);
    return { id: info.insertId };
  },

  async listarRecentes() {
    return (await query("SELECT * FROM pesquisa_satisfacao ORDER BY criado_em DESC LIMIT 500")).rows;
  },
};
