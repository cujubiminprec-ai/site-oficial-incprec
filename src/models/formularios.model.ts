import { query } from "../config/database";

export type FormularioPayload = Record<string, unknown> & {
  formularioId?: number | string | null;
  formularioNome?: string;
  dados?: unknown;
  nome?: string | null;
  email?: string | null;
};

export const formulariosModel = {
  async criar(payload: FormularioPayload, ip?: string) {
    const info = await query(`
      INSERT INTO formularios_respostas (formulario_id, formulario_nome, dados, nome_remetente, email_remetente, ip_origem)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      payload.formularioId ?? null,
      payload.formularioNome ?? "Formulario",
      JSON.stringify(payload.dados ?? payload),
      payload.nome ?? null,
      payload.email ?? null,
      ip
    ]);
    return { id: info.insertId };
  },

  async listarRecentes() {
    return (await query("SELECT * FROM formularios_respostas ORDER BY criado_em DESC LIMIT 500")).rows;
  },

  async marcarComoLido(id: string) {
    await query("UPDATE formularios_respostas SET lida = 1 WHERE id = $1", [id]);
    return { id: Number(id), lida: true };
  },
};
