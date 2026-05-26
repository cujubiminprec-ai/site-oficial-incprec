import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { queryOne, query, queryPaginado } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { gerarProtocolo, calcularPrazoLegal } from "../utils/protocolo";
import { AuthRequest } from "../types";

const router = Router();

// ============================================================
// POST /api/lai  — registrar pedido (público)
// ============================================================
router.post(
  "/",
  [
    body().custom((value) => {
      if (!String(value.nome ?? value.solicitante ?? "").trim()) {
        throw new Error("Nome obrigatório");
      }
      return true;
    }),
    body("email").isEmail().withMessage("E-mail válido obrigatório"),
    body().custom((value) => {
      const descricao = String(value.descricao_pedido ?? value.descricao ?? "");
      if (!descricao.trim() || descricao.length > 500) {
        throw new Error("Descrição obrigatória (máx. 500)");
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

    const nome = req.body.nome ?? req.body.solicitante;
    const descricaoPedido = req.body.descricao_pedido ?? req.body.descricao;
    const { email, cpf, telefone } = req.body as { email: string; cpf?: string; telefone?: string };

    const protocolo  = gerarProtocolo("LAI");
    const prazoLegal = calcularPrazoLegal(20); // 20 dias corridos
    const criadoEm   = new Date().toISOString();

    try {
      await query(
        `INSERT INTO lai_pedidos
           (protocolo, nome, email, cpf, telefone, descricao_pedido, prazo_legal, ip_origem, criado_em, atualizado_em)
         VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())`,
        [
          protocolo, nome, email, cpf ?? null, telefone ?? null,
          descricaoPedido, prazoLegal, req.ip ?? null,
        ]
      );

      res.status(201).json({
        sucesso: true,
        dados: {
          protocolo,
          criado_em:    criadoEm,
          prazo_legal:  prazoLegal,
          mensagem:     "Pedido de acesso à informação registrado. Guarde seu protocolo.",
        },
      });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao registrar pedido LAI." });
    }
  }
);

// ============================================================
// GET /api/lai/consultar/:protocolo  (público)
// ============================================================
router.get("/consultar/:protocolo", async (req: Request, res: Response): Promise<void> => {
  try {
    const registro = await queryOne<{
      protocolo: string; status: string; descricao_pedido: string;
      criado_em: string; prazo_legal: string;
      respondido_em: string | null; resposta: string | null;
    }>(
      `SELECT protocolo, status, descricao_pedido, criado_em, prazo_legal, respondido_em, resposta
       FROM lai_pedidos WHERE protocolo = ?`,
      [req.params.protocolo.toUpperCase()]
    );

    if (!registro) {
      res.status(404).json({ sucesso: false, mensagem: "Protocolo LAI não encontrado." });
      return;
    }

    res.json({ sucesso: true, dados: registro });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao consultar protocolo LAI." });
  }
});

// ============================================================
// GET /api/lai  (admin)
// ============================================================
router.get("/", autenticar, exigirPermissao("lai-admin"), async (req: Request, res: Response): Promise<void> => {
  const pagina = parseInt(String(req.query.pagina ?? "1"), 10);
  const limite = parseInt(String(req.query.limite ?? "20"), 10);
  const status = req.query.status as string | undefined;

  const condicoes: string[] = [];
  const params: unknown[]   = [];
  if (status) { params.push(status); condicoes.push("status = ?"); }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
  const sql   = `SELECT id, protocolo, nome, email, status, criado_em, prazo_legal
                 FROM lai_pedidos ${where} ORDER BY criado_em DESC`;

  try {
    const { itens, total } = await queryPaginado(sql, params, pagina, limite);
    res.json({
      sucesso: true,
      dados:   itens,
      meta:    { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
    });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar pedidos LAI." });
  }
});

// ============================================================
// PATCH /api/lai/:id/responder  (admin)
// ============================================================
router.patch(
  "/:id/responder",
  autenticar,
  exigirPermissao("lai-admin"),
  auditoria("responder", "lai"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { resposta, status } = req.body as { resposta: string; status?: string };
    if (!resposta?.trim()) {
      res.status(400).json({ sucesso: false, mensagem: "Resposta obrigatória." });
      return;
    }
    try {
      await query(
        `UPDATE lai_pedidos
         SET resposta = ?, status = ?, respondido_em = NOW(), respondido_por = ?, atualizado_em = NOW()
         WHERE id = ?`,
        [resposta, status ?? "respondido", req.user!.userId, req.params.id]
      );
      const atualizado = await queryOne("SELECT protocolo, status, respondido_em FROM lai_pedidos WHERE id = ?", [req.params.id]);
      res.json({ sucesso: true, dados: atualizado });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao responder pedido LAI." });
    }
  }
);

// ============================================================
// PATCH /api/lai/:id/status  (admin)
// ============================================================
router.patch("/:id/status", autenticar, exigirPermissao("lai-admin"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  const validos = ["pendente", "em-analise", "respondido", "negado", "arquivado"];
  if (!validos.includes(status)) {
    res.status(400).json({ sucesso: false, mensagem: `Status inválido. Use: ${validos.join(", ")}` });
    return;
  }
  try {
    await query(
      "UPDATE lai_pedidos SET status = ?, atualizado_em = NOW() WHERE id = ?",
      [status, req.params.id]
    );
    res.json({ sucesso: true, mensagem: "Status atualizado." });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar status." });
  }
});

export default router;
