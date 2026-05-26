import { Router, Request, Response } from "express";
import { body, query as qParam, validationResult } from "express-validator";
import slugify from "slugify";
import { query, queryOne, queryPaginado } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

// ============================================================
// GET /api/noticias  (público)
// ============================================================
router.get(
  "/",
  [
    qParam("pagina").optional().isInt({ min: 1 }),
    qParam("limite").optional().isInt({ min: 1, max: 50 }),
    qParam("categoria").optional().isString(),
    qParam("destaque").optional().isBoolean(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const pagina    = parseInt(String(req.query.pagina ?? "1"), 10);
    const limite    = parseInt(String(req.query.limite ?? "12"), 10);
    const categoria = req.query.categoria as string | undefined;
    const destaque  = req.query.destaque === "true";
    const busca     = req.query.busca as string | undefined;

    const condicoes: string[] = ["publicado = TRUE"];
    const params: unknown[]   = [];

    if (categoria) { params.push(categoria); condicoes.push(`categoria = $${params.length}`); }
    if (destaque)  { condicoes.push("destaque = TRUE"); }
    if (busca)     { params.push(`%${busca}%`); condicoes.push(`(titulo ILIKE $${params.length} OR resumo ILIKE $${params.length})`); }

    const where = condicoes.join(" AND ");
    const sql = `SELECT id, titulo, slug, resumo, image_url, categoria, autor, destaque, publicado_em, visualizacoes, tags
                 FROM noticias WHERE ${where} ORDER BY publicado_em DESC`;

    try {
      const { itens, total } = await queryPaginado(sql, params, pagina, limite);
      res.json({
        sucesso: true,
        dados: itens,
        meta: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
      });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar notícias." });
    }
  }
);

// ============================================================
// GET /api/noticias/admin  (admin)
// ============================================================
router.get("/admin", autenticar, exigirPermissao("noticias"), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT *
       FROM noticias
       ORDER BY COALESCE(publicado_em, criado_em) DESC, id DESC`
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar notícias para administração." });
  }
});

// ============================================================
// GET /api/noticias/:slug  (público)
// ============================================================
router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const noticia = await queryOne(
      "SELECT * FROM noticias WHERE (slug = $1 OR id = $1) AND publicado = TRUE",
      [req.params.slug]
    );
    if (!noticia) {
      res.status(404).json({ sucesso: false, mensagem: "Notícia não encontrada." });
      return;
    }
    // Incrementa visualizações
    await query("UPDATE noticias SET visualizacoes = visualizacoes + 1 WHERE id = $1", [noticia.id]);
    res.json({ sucesso: true, dados: noticia });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar notícia." });
  }
});

// ============================================================
// POST /api/noticias  (admin)
// ============================================================
router.post(
  "/",
  autenticar,
  exigirPermissao("noticias"),
  auditoria("criar", "noticias"),
  [
    body("titulo").notEmpty().withMessage("Título obrigatório"),
    body("resumo").optional().isLength({ max: 500 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: erros.array().map((e) => e.msg) });
      return;
    }

    const { titulo, resumo, conteudo, image_url, image_alt, categoria, autor, destaque, publicado, tags } = req.body;

    const slug = slugify(titulo, { lower: true, strict: true });

    try {
      const nova = await queryOne(
        `INSERT INTO noticias (titulo, slug, resumo, conteudo, image_url, image_alt, categoria, autor, destaque, publicado, publicado_em, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          titulo, slug, resumo ?? null, conteudo ?? null, image_url ?? null,
          image_alt ?? null, categoria ?? null, autor ?? null,
          destaque ?? false, publicado ?? false,
          publicado ? new Date() : null,
          tags ?? [],
        ]
      );
      res.status(201).json({ sucesso: true, dados: nova });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("unique")) {
        res.status(409).json({ sucesso: false, mensagem: "Slug já existe. Escolha um título diferente." });
      } else {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao criar notícia." });
      }
    }
  }
);

// ============================================================
// PUT /api/noticias/:id  (admin)
// ============================================================
router.put(
  "/:id",
  autenticar,
  exigirPermissao("noticias"),
  auditoria("editar", "noticias"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { titulo, resumo, conteudo, image_url, image_alt, categoria, autor, destaque, publicado, tags } = req.body;
    const slug = titulo ? slugify(titulo, { lower: true, strict: true }) : undefined;

    try {
      const atualizada = await queryOne(
        `UPDATE noticias SET
          titulo = COALESCE($1, titulo),
          slug = COALESCE($2, slug),
          resumo = COALESCE($3, resumo),
          conteudo = COALESCE($4, conteudo),
          image_url = COALESCE($5, image_url),
          image_alt = COALESCE($6, image_alt),
          categoria = COALESCE($7, categoria),
          autor = COALESCE($8, autor),
          destaque = COALESCE($9, destaque),
          publicado = COALESCE($10, publicado),
          publicado_em = CASE WHEN $10 = TRUE AND publicado = FALSE THEN NOW() ELSE publicado_em END,
          tags = COALESCE($11, tags),
          atualizado_em = NOW()
         WHERE id = $12 RETURNING *`,
        [titulo ?? null, slug ?? null, resumo ?? null, conteudo ?? null, image_url ?? null,
         image_alt ?? null, categoria ?? null, autor ?? null, destaque ?? null,
         publicado ?? null, tags ?? null, req.params.id]
      );
      if (!atualizada) {
        res.status(404).json({ sucesso: false, mensagem: "Notícia não encontrada." });
        return;
      }
      res.json({ sucesso: true, dados: atualizada });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar notícia." });
    }
  }
);

// ============================================================
// DELETE /api/noticias/:id  (admin)
// ============================================================
router.delete(
  "/:id",
  autenticar,
  exigirPermissao("noticias"),
  auditoria("excluir", "noticias"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await query("DELETE FROM noticias WHERE id = $1", [_req.params.id]);
      if (result.rowCount === 0) {
        res.status(404).json({ sucesso: false, mensagem: "Notícia não encontrada." });
        return;
      }
      res.json({ sucesso: true, mensagem: "Notícia excluída com sucesso." });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir notícia." });
    }
  }
);

export default router;
