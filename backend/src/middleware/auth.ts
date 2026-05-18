import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { AuthRequest, JwtPayload } from "../types";

// ============================================================
// Middleware — verificar JWT
// ============================================================
export function autenticar(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ sucesso: false, mensagem: "Token de autenticação não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    const expired = err instanceof jwt.TokenExpiredError;
    res.status(401).json({
      sucesso: false,
      mensagem: expired ? "Token expirado. Faça login novamente." : "Token inválido.",
    });
  }
}

// ============================================================
// Middleware — verificar nível de acesso
// ============================================================
export function exigirNivel(...niveis: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ sucesso: false, mensagem: "Não autenticado." });
      return;
    }
    if (!niveis.includes(req.user.nivelAcesso)) {
      res.status(403).json({
        sucesso: false,
        mensagem: `Acesso negado. Nível necessário: ${niveis.join(" ou ")}.`,
      });
      return;
    }
    next();
  };
}

// ============================================================
// Middleware — verificar permissão de módulo
// ============================================================
export function exigirPermissao(modulo: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ sucesso: false, mensagem: "Não autenticado." });
      return;
    }
    if (
      req.user.nivelAcesso === "superadmin" ||
      req.user.permissoes.includes(modulo)
    ) {
      next();
    } else {
      res.status(403).json({
        sucesso: false,
        mensagem: `Você não tem permissão para acessar o módulo: ${modulo}.`,
      });
    }
  };
}

// ============================================================
// Gerar tokens
// ============================================================
export function gerarToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function gerarRefreshToken(userId: string): string {
  return jwt.sign({ userId, tipo: "refresh" }, env.jwt.secret, {
    expiresIn: env.jwt.refreshExpires as jwt.SignOptions["expiresIn"],
  });
}
