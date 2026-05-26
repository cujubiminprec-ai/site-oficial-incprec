import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query, queryOne } from "../config/database";

export type UsuarioPayload = Record<string, unknown>;

function parsePermissoes(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value || "[]");
    } catch {
      return [];
    }
  }
  return value || [];
}

function usuarioRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    nome: String(row.nome || ""),
    email: String(row.email || ""),
    nivelAcesso: String(row.nivel_acesso || "operador"),
    permissoes: parsePermissoes(row.permissoes),
    avatar: row.avatar_url || null,
    ativo: row.ativo !== 0,
    descricao: row.descricao || "",
    criadoEm: row.criado_em,
    ultimoAcesso: row.ultimo_acesso,
  };
}

export const usuariosModel = {
  async listar() {
    const rows = (await query("SELECT * FROM usuarios_admin ORDER BY nome ASC")).rows;
    return rows.map(usuarioRow);
  },

  async criar(payload: UsuarioPayload) {
    const senhaHash = await bcrypt.hash(String(payload.senha || "admin123"), 12);
    const id = uuidv4();
    await query(`
      INSERT INTO usuarios_admin (id, nome, email, senha_hash, nivel_acesso, permissoes, ativo, descricao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      id,
      payload.nome,
      String(payload.email).toLowerCase(),
      senhaHash,
      payload.nivelAcesso ?? "operador",
      JSON.stringify(payload.permissoes ?? []),
      payload.ativo === false ? 0 : 1,
      payload.descricao ?? null
    ]);
    const row = await queryOne("SELECT * FROM usuarios_admin WHERE id = $1", [id]) as Record<string, unknown>;
    return usuarioRow(row);
  },

  async atualizar(id: string, payload: UsuarioPayload) {
    const atual = await queryOne("SELECT * FROM usuarios_admin WHERE id = $1", [id]) as Record<string, unknown> | null;
    if (!atual) return null;

    const senhaHash = payload.senha ? await bcrypt.hash(String(payload.senha), 12) : atual.senha_hash;
    await query(`
      UPDATE usuarios_admin
      SET nome = $1, email = $2, senha_hash = $3, nivel_acesso = $4, permissoes = $5, ativo = $6, descricao = $7, atualizado_em = NOW()
      WHERE id = $8
    `, [
      payload.nome ?? atual.nome,
      String(payload.email ?? atual.email).toLowerCase(),
      senhaHash,
      payload.nivelAcesso ?? atual.nivel_acesso,
      JSON.stringify(payload.permissoes ?? parsePermissoes(atual.permissoes)),
      payload.ativo === false ? 0 : 1,
      payload.descricao ?? atual.descricao,
      id
    ]);
    const row = await queryOne("SELECT * FROM usuarios_admin WHERE id = $1", [id]) as Record<string, unknown>;
    return usuarioRow(row);
  },

  async remover(id: string) {
    await query("DELETE FROM usuarios_admin WHERE id = $1", [id]);
  },
};
