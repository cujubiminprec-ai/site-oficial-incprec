import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { queryOne, query } from "../config/database";
import { gerarToken, gerarRefreshToken, autenticar } from "../middleware/auth";
import { salvarAuditoria } from "../middleware/audit";
import env from "../config/env";
import { AuthRequest, JwtPayload } from "../types";

const router = Router();

// ============================================================
// POST /api/auth/login
// ============================================================
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("E-mail inválido"),
    body("senha").notEmpty().withMessage("Senha obrigatória"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: erros.array().map((e) => e.msg) });
      return;
    }

    const { email, senha } = req.body as { email: string; senha: string };

    try {
      const usuario = await queryOne<{
        id: string; nome: string; email: string; senha_hash: string;
        nivel_acesso: string; permissoes: string[]; ativo: boolean; avatar_url?: string | null;
      }>(
        "SELECT id, nome, email, senha_hash, nivel_acesso, permissoes, ativo, avatar_url FROM usuarios_admin WHERE email = $1",
        [email.toLowerCase().trim()]
      );

      if (!usuario || !usuario.ativo) {
        res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas." });
        return;
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaCorreta) {
        res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas." });
        return;
      }

      const payload: JwtPayload = {
        userId:       usuario.id,
        nome:         usuario.nome,
        email:        usuario.email,
        nivelAcesso:  usuario.nivel_acesso as JwtPayload["nivelAcesso"],
        permissoes:   usuario.permissoes,
      };

      const token        = gerarToken(payload);
      const refreshToken = gerarRefreshToken(usuario.id);

      // Atualiza último acesso
      await query("UPDATE usuarios_admin SET ultimo_acesso = NOW() WHERE id = $1", [usuario.id]);

      await salvarAuditoria({
        usuario_id:    usuario.id,
        usuario_nome:  usuario.nome,
        usuario_email: usuario.email,
        acao:          "login",
        modulo:        "auth",
        descricao:     `Login realizado com sucesso`,
        ip_origem:     req.ip,
        user_agent:    req.headers["user-agent"],
      });

      res.json({
        sucesso: true,
        dados: {
          token,
          refreshToken,
          usuario: {
            id:          usuario.id,
            nome:        usuario.nome,
            email:       usuario.email,
            avatar:      usuario.avatar_url,
            nivelAcesso: usuario.nivel_acesso,
            permissoes:  usuario.permissoes,
          },
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao realizar login." });
    }
  }
);

// ============================================================
// POST /api/auth/refresh
// ============================================================
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    res.status(400).json({ sucesso: false, mensagem: "Refresh token não fornecido." });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwt.secret) as { userId: string; tipo: string };
    if (decoded.tipo !== "refresh") throw new Error("Tipo inválido");

    const usuario = await queryOne<{
      id: string; email: string; nivel_acesso: string; permissoes: string[]; ativo: boolean;
    }>(
      "SELECT id, email, nivel_acesso, permissoes, ativo FROM usuarios_admin WHERE id = $1",
      [decoded.userId]
    );

    if (!usuario || !usuario.ativo) {
      res.status(401).json({ sucesso: false, mensagem: "Usuário inativo ou não encontrado." });
      return;
    }

    const payload: JwtPayload = {
      userId:      usuario.id,
      email:       usuario.email,
      nivelAcesso: usuario.nivel_acesso as JwtPayload["nivelAcesso"],
      permissoes:  usuario.permissoes,
    };

    const newToken = gerarToken(payload);
    const newRefreshToken = gerarRefreshToken(decoded.userId);
    res.json({ sucesso: true, dados: { token: newToken, refreshToken: newRefreshToken } });
  } catch {
    res.status(401).json({ sucesso: false, mensagem: "Refresh token inválido ou expirado." });
  }
});

// ============================================================
// GET /api/auth/me
// ============================================================
router.get("/me", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuario = await queryOne<{
      id: string; nome: string; email: string; nivel_acesso: string;
      permissoes: string[]; avatar_url: string | null; ultimo_acesso: string | null;
    }>(
      "SELECT id, nome, email, nivel_acesso, permissoes, avatar_url, ultimo_acesso FROM usuarios_admin WHERE id = $1",
      [req.user!.userId]
    );

    if (!usuario) {
      res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
      return;
    }

    res.json({
      sucesso: true,
      dados: {
        id:          usuario.id,
        nome:        usuario.nome,
        email:       usuario.email,
        avatar:      usuario.avatar_url,
        nivelAcesso: usuario.nivel_acesso,
        permissoes:  usuario.permissoes,
        ultimoAcesso: usuario.ultimo_acesso,
      },
    });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar perfil." });
  }
});

// ============================================================
// PUT /api/auth/perfil
// ============================================================
router.put("/perfil", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  const { nome, descricao, avatar } = req.body as { nome?: string; descricao?: string; avatar?: string };
  if (!nome?.trim()) {
    res.status(400).json({ sucesso: false, mensagem: "Nome obrigatório." });
    return;
  }

  try {
    const usuario = await queryOne<{
      id: string; nome: string; email: string; nivel_acesso: string; permissoes: string[];
      avatar_url: string | null; descricao: string | null; ultimo_acesso: string | null;
    }>(
      `UPDATE usuarios_admin
       SET nome = $1, descricao = $2, avatar_url = $3, atualizado_em = NOW()
       WHERE id = $4
       RETURNING id, nome, email, nivel_acesso, permissoes, avatar_url, descricao, ultimo_acesso`,
      [nome.trim(), descricao ?? null, avatar ?? null, req.user!.userId]
    );

    res.json({
      sucesso: true,
      dados: {
        id: usuario?.id,
        nome: usuario?.nome,
        email: usuario?.email,
        avatar: usuario?.avatar_url,
        descricao: usuario?.descricao,
        nivelAcesso: usuario?.nivel_acesso,
        permissoes: usuario?.permissoes ?? [],
        ultimoAcesso: usuario?.ultimo_acesso,
      },
    });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar perfil." });
  }
});

// ============================================================
// PUT /api/auth/senha
// ============================================================
router.put("/senha", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  const { senhaAtual, novaSenha } = req.body as { senhaAtual?: string; novaSenha?: string };
  if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
    res.status(400).json({ sucesso: false, mensagem: "Informe a senha atual e uma nova senha com pelo menos 6 caracteres." });
    return;
  }

  try {
    const usuario = await queryOne<{ id: string; senha_hash: string }>(
      "SELECT id, senha_hash FROM usuarios_admin WHERE id = $1",
      [req.user!.userId]
    );
    if (!usuario || !(await bcrypt.compare(senhaAtual, usuario.senha_hash))) {
      res.status(401).json({ sucesso: false, mensagem: "Senha atual inválida." });
      return;
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await query("UPDATE usuarios_admin SET senha_hash = $1, atualizado_em = NOW() WHERE id = $2", [senhaHash, req.user!.userId]);
    res.json({ sucesso: true, dados: { atualizado: true } });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao alterar senha." });
  }
});

// ============================================================
// POST /api/auth/logout
// ============================================================
router.post("/logout", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  await salvarAuditoria({
    usuario_id:    req.user!.userId,
    usuario_email: req.user!.email,
    acao:          "logout",
    modulo:        "auth",
    ip_origem:     req.ip,
  });
  res.json({ sucesso: true, mensagem: "Logout realizado." });
});

export default router;
