import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { AuthRequest, JwtPayload } from "../types";

const ACCESS_COOKIE = "inprec_access_token";
const REFRESH_COOKIE = "inprec_refresh_token";

function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${name}=`));
  if (!found) return null;
  return decodeURIComponent(found.slice(name.length + 1));
}

// ============================================================
// Middleware — verificar JWT
// ============================================================
export function autenticar(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const cookieToken = getCookieValue(req.headers.cookie, ACCESS_COOKIE);
  const token = cookieToken || bearerToken;

  if (!token) {
    res.status(401).json({ sucesso: false, mensagem: "Token de autenticação não fornecido." });
    return;
  }

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
    if (req.user.nivelAcesso === "superadmin" || req.user.permissoes.includes(modulo)) {
      next();
      return;
    }
    res.status(403).json({
      sucesso: false,
      mensagem: `Você não tem permissão para acessar o módulo: ${modulo}.`,
    });
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

export function getRefreshTokenFromRequest(req: AuthRequest): string | null {
  return getCookieValue(req.headers.cookie, REFRESH_COOKIE);
}

export function applyAuthCookies(res: Response, token: string, refreshToken: string): void {
  const secureCookies = process.env.COOKIE_SECURE === "true";
  const cookieOptions = {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookie(ACCESS_COOKIE, token, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(res: Response): void {
  const secureCookies = process.env.COOKIE_SECURE === "true";
  const cookieOptions = {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax" as const,
    path: "/",
  };

  res.clearCookie(ACCESS_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}
