import { query, queryOne } from "../config/database";

export type ContatoPayload = {
  nome: string;
  email: string;
  telefone?: string | null;
  assunto?: string | null;
  mensagem: string;
};

export const contatoModel = {
  async criar(payload: ContatoPayload, ip?: string) {
    const info = await query(`
      INSERT INTO contato_mensagens (nome, email, telefone, assunto, mensagem, ip_origem)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [payload.nome, payload.email, payload.telefone ?? null, payload.assunto ?? null, payload.mensagem, ip]);
    return { id: info.insertId };
  },

  async listarRecentes() {
    return (await query("SELECT * FROM contato_mensagens ORDER BY criado_em DESC LIMIT 500")).rows;
  },

  async atualizarStatus(id: string, status: unknown) {
    await query("UPDATE contato_mensagens SET status = $1, atualizado_em = NOW() WHERE id = $2", [status, id]);
    return queryOne("SELECT * FROM contato_mensagens WHERE id = $1", [id]);
  },
};
