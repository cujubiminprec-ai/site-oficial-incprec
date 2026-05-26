import { Response, NextFunction } from "express";
import { query } from "../config/database";
import { AuthRequest } from "../types";

// ============================================================
// Middleware — registrar ação de auditoria automaticamente
// ============================================================
export function auditoria(acao: string, modulo: string) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    // Salva de forma assíncrona sem bloquear a resposta
    salvarAuditoria({
      usuario_id:    req.user?.userId,
      usuario_nome:  req.user?.nome ?? req.user?.email,
      usuario_email: req.user?.email,
      acao,
      modulo,
      descricao:     `${acao} em ${modulo} — ${req.method} ${req.originalUrl}`,
      dados_novos:   ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      ip_origem:     req.ip ?? req.socket?.remoteAddress,
      user_agent:    req.headers["user-agent"],
    }).catch((err) => console.error("❌ Erro ao salvar auditoria:", err));

    next();
  };
}

// ============================================================
// Salvar registro de auditoria
// ============================================================
export async function salvarAuditoria(dados: {
  usuario_id?: string;
  usuario_nome?: string;
  usuario_email?: string;
  acao: string;
  modulo: string;
  descricao?: string;
  dados_anteriores?: unknown;
  dados_novos?: unknown;
  ip_origem?: string;
  user_agent?: string;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO auditoria
        (usuario_id, usuario_nome, usuario_email, acao, modulo, descricao,
         dados_anteriores, dados_novos, ip_origem, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        dados.usuario_id ?? null,
        dados.usuario_nome ?? null,
        dados.usuario_email ?? null,
        dados.acao,
        dados.modulo,
        dados.descricao ?? null,
        dados.dados_anteriores ? JSON.stringify(dados.dados_anteriores) : null,
        dados.dados_novos ? JSON.stringify(dados.dados_novos) : null,
        dados.ip_origem ?? null,
        dados.user_agent ?? null,
      ]
    );
  } catch (err) {
    console.error("❌ Erro ao registrar auditoria:", err);
  }
}
