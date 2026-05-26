import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { query, queryOne, queryPaginado } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { gerarProtocolo } from "../utils/protocolo";
import { AuthRequest } from "../types";

const router = Router();

// ============================================================
// POST /api/ouvidoria  — registrar manifestação (público)
// ============================================================
router.post(
  "/",
  [
    body("tipo").notEmpty().withMessage("Tipo de manifestação obrigatório"),
    body("assunto").notEmpty().withMessage("Assunto obrigatório"),
    body().custom((value) => {
      const mensagem = String(value.mensagem ?? value.descricao ?? "");
      if (!mensagem.trim() || mensagem.length > 500) {
        throw new Error("Mensagem obrigatória (máx. 500 chars)");
      }
      return true;
    }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: erros.array().map((e) => e.msg) });
      return;
    }

    const mensagem = req.body.mensagem ?? req.body.descricao;
    const { tipo, assunto, nome, email, cpf, telefone, anonimo } = req.body as {
      tipo: string; assunto: string; nome?: string; email?: string;
      cpf?: string; telefone?: string; anonimo?: boolean | string;
    };

    const protocolo   = gerarProtocolo("OUV");
    const isAnonimo   = anonimo === true || anonimo === "true";
    const criadoEm    = new Date().toISOString();

    try {
      await query(
        `INSERT INTO ouvidoria_mensagens
           (protocolo, tipo, assunto, mensagem, nome, email, cpf, telefone, anonimo, ip_origem, criado_em, atualizado_em)
         VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
        [
          protocolo, tipo, assunto, mensagem,
          isAnonimo ? null : (nome ?? null),
          isAnonimo ? null : (email ?? null),
          isAnonimo ? null : (cpf ?? null),
          telefone ?? null,
          isAnonimo ? 1 : 0,
          req.ip ?? null,
        ]
      );

      res.status(201).json({
        sucesso: true,
        dados: {
          protocolo,
          criado_em:  criadoEm,
          mensagem:   "Manifestação registrada com sucesso. Guarde seu número de protocolo.",
        },
      });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao registrar manifestação." });
    }
  }
);

// ============================================================
// GET /api/ouvidoria/consultar/:protocolo  (público)
// ============================================================
router.get("/consultar/:protocolo", async (req: Request, res: Response): Promise<void> => {
  try {
    const registro = await queryOne<{
      protocolo: string; tipo: string; assunto: string; status: string;
      criado_em: string; respondido_em: string | null; resposta: string | null;
    }>(
      `SELECT protocolo, tipo, assunto, status, criado_em, respondido_em, resposta
       FROM ouvidoria_mensagens WHERE protocolo = ?`,
      [req.params.protocolo.toUpperCase()]
    );

    if (!registro) {
      res.status(404).json({ sucesso: false, mensagem: "Protocolo não encontrado." });
      return;
    }

    res.json({ sucesso: true, dados: registro });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao consultar protocolo." });
  }
});

// ============================================================
// GET /api/ouvidoria  (admin)
// ============================================================
router.get(
  "/",
  autenticar,
  exigirPermissao("ouvidoria-admin"),
  async (req: Request, res: Response): Promise<void> => {
    const pagina = parseInt(String(req.query.pagina ?? "1"), 10);
    const limite = parseInt(String(req.query.limite ?? "20"), 10);
    const status = req.query.status as string | undefined;
    const tipo   = req.query.tipo   as string | undefined;

    const condicoes: string[] = [];
    const params: unknown[]   = [];

    if (status) { params.push(status); condicoes.push("status = ?"); }
    if (tipo)   { params.push(tipo);   condicoes.push("tipo = ?");   }

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    const sql   = `SELECT id, protocolo, tipo, assunto, status, nome, email, anonimo, criado_em
                   FROM ouvidoria_mensagens ${where} ORDER BY criado_em DESC`;

    try {
      const { itens, total } = await queryPaginado(sql, params, pagina, limite);
      res.json({
        sucesso: true,
        dados:   itens,
        meta:    { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
      });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao listar manifestações." });
    }
  }
);

// ============================================================
// GET /api/ouvidoria/:id  (admin)
// ============================================================
router.get("/:id", autenticar, exigirPermissao("ouvidoria-admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await queryOne("SELECT * FROM ouvidoria_mensagens WHERE id = ?", [req.params.id]);
    if (!item) { res.status(404).json({ sucesso: false, mensagem: "Não encontrado." }); return; }
    res.json({ sucesso: true, dados: item });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar manifestação." });
  }
});

// ============================================================
// PATCH /api/ouvidoria/:id/responder  (admin)
// ============================================================
router.patch(
  "/:id/responder",
  autenticar,
  exigirPermissao("ouvidoria-admin"),
  auditoria("responder", "ouvidoria"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { resposta, status } = req.body as { resposta: string; status?: string };
    if (!resposta?.trim()) {
      res.status(400).json({ sucesso: false, mensagem: "Resposta obrigatória." });
      return;
    }
    try {
      await query(
        `UPDATE ouvidoria_mensagens
         SET resposta = ?, status = ?, respondido_em = NOW(), respondido_por = ?, atualizado_em = NOW()
         WHERE id = ?`,
        [resposta, status ?? "respondida", req.user!.userId, req.params.id]
      );
      const atualizado = await queryOne("SELECT protocolo, status, respondido_em FROM ouvidoria_mensagens WHERE id = ?", [req.params.id]);
      res.json({ sucesso: true, dados: atualizado });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao responder manifestação." });
    }
  }
);

// ============================================================
// PATCH /api/ouvidoria/:id/status  (admin)
// ============================================================
router.patch("/:id/status", autenticar, exigirPermissao("ouvidoria-admin"), async (_req: AuthRequest, res: Response): Promise<void> => {
  const { status } = _req.body as { status: string };
  const validos = ["pendente", "em-analise", "respondida", "arquivada"];
  if (!validos.includes(status)) {
    res.status(400).json({ sucesso: false, mensagem: `Status inválido. Use: ${validos.join(", ")}` });
    return;
  }
  try {
    await query(
      "UPDATE ouvidoria_mensagens SET status = ?, atualizado_em = NOW() WHERE id = ?",
      [status, _req.params.id]
    );
    res.json({ sucesso: true, mensagem: "Status atualizado." });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar status." });
  }
});

export default router;
