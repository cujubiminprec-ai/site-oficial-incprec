import { Router, Request, Response } from "express";
import { query, queryOne, runInTransaction } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

// GET /api/paginas  (público — apenas ativas)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      "SELECT id, page_id, nome, rota, status, titulo_seo, descricao_seo FROM paginas WHERE status != 'desativada' ORDER BY nome"
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar páginas." });
  }
});

// GET /api/paginas/:pageId/blocos  (público)
router.get("/:pageId/blocos", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      "SELECT * FROM paginas_blocos WHERE page_id = $1 AND ativo = TRUE ORDER BY posicao",
      [req.params.pageId]
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar blocos." });
  }
});

// PUT /api/paginas/:pageId/blocos  (admin — salva todos os blocos)
router.put(
  "/:pageId/blocos",
  autenticar,
  exigirPermissao("paginas"),
  auditoria("editar-blocos", "paginas"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { pageId } = req.params;
    const blocos: {
      bloco_id: string; tipo: string; posicao: number; titulo?: string;
      subtitulo?: string; texto?: string; image_url?: string; image_alt?: string;
      cta_label?: string; cta_url?: string; itens?: string[]; colunas?: unknown;
      cor?: string; alinhamento?: string;
    }[] = req.body.blocos ?? [];

    if (!Array.isArray(blocos)) {
      res.status(400).json({ sucesso: false, mensagem: "blocos deve ser um array." });
      return;
    }

    try {
      runInTransaction(() => {
        // Apaga os blocos existentes e reinsere
        query("DELETE FROM paginas_blocos WHERE page_id = $1", [pageId]);

        for (const bloco of blocos) {
          query(
            `INSERT INTO paginas_blocos
              (page_id, bloco_id, tipo, posicao, titulo, subtitulo, texto, image_url, image_alt,
               cta_label, cta_url, itens, colunas, cor, alinhamento)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
            [
              pageId, bloco.bloco_id, bloco.tipo, bloco.posicao,
              bloco.titulo ?? null, bloco.subtitulo ?? null, bloco.texto ?? null,
              bloco.image_url ?? null, bloco.image_alt ?? null,
              bloco.cta_label ?? null, bloco.cta_url ?? null,
              bloco.itens ?? null, bloco.colunas ? JSON.stringify(bloco.colunas) : null,
              bloco.cor ?? null, bloco.alinhamento ?? "left",
            ]
          );
        }

        // Atualiza data da última edição
        query(
          "UPDATE paginas SET ultima_edicao = NOW(), atualizado_em = NOW() WHERE page_id = $1",
          [pageId]
        );
      });

      res.json({ sucesso: true, mensagem: `${blocos.length} blocos salvos para "${pageId}".` });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar blocos." });
    }
  }
);

// PUT /api/paginas/:id  (admin — atualiza meta da página)
router.put("/:id", autenticar, exigirPermissao("paginas"), auditoria("editar", "paginas"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { nome, status, titulo_seo, descricao_seo, keywords_seo } = req.body;
  try {
    const atualizado = await queryOne(
      `UPDATE paginas SET nome=COALESCE($1,nome), status=COALESCE($2,status),
       titulo_seo=COALESCE($3,titulo_seo), descricao_seo=COALESCE($4,descricao_seo),
       keywords_seo=COALESCE($5,keywords_seo), atualizado_em=NOW()
       WHERE id=$6 RETURNING *`,
      [nome??null, status??null, titulo_seo??null, descricao_seo??null, keywords_seo??null, req.params.id]
    );
    if (!atualizado) { res.status(404).json({ sucesso: false, mensagem: "Página não encontrada." }); return; }
    res.json({ sucesso: true, dados: atualizado });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar página." });
  }
});

export default router;
