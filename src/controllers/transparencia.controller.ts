import { Router, Request, Response } from "express";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { query, queryOne } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";
import env from "../config/env";

const router = Router();

// GET /api/transparencia  (público)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const categoria = req.query.categoria as string | undefined;
  const ano       = req.query.ano as string | undefined;
  const busca     = req.query.busca as string | undefined;

  const conds: string[]  = ["ativo = TRUE"];
  const params: unknown[] = [];

  if (categoria && categoria !== "Todos") { params.push(categoria); conds.push(`categoria = $${params.length}`); }
  if (ano && ano !== "Todos")             { params.push(parseInt(ano,10)); conds.push(`ano = $${params.length}`); }
  if (busca)                              { params.push(`%${busca}%`); conds.push(`titulo ILIKE $${params.length}`); }

  try {
    const result = await query(
      `SELECT id, titulo, categoria, icone, ano, tipo_arquivo, tamanho, arquivo_url, link_externo, destaque, publicado_em
       FROM transparencia_documentos WHERE ${conds.join(" AND ")} ORDER BY destaque DESC, publicado_em DESC`,
      params
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar documentos." });
  }
});

// GET /api/transparencia/documentos  (público — alias para /)
router.get("/documentos", async (req: Request, res: Response): Promise<void> => {
  const categoria = req.query.categoria as string | undefined;
  const ano       = req.query.ano as string | undefined;
  const busca     = req.query.busca as string | undefined;

  const conds: string[]  = ["ativo = TRUE"];
  const params: unknown[] = [];

  if (categoria && categoria !== "Todos") { params.push(categoria); conds.push(`categoria = $${params.length}`); }
  if (ano && ano !== "Todos")             { params.push(parseInt(ano,10)); conds.push(`ano = $${params.length}`); }
  if (busca)                              { params.push(`%${busca}%`); conds.push(`titulo ILIKE $${params.length}`); }

  try {
    const result = await query(
      `SELECT id, titulo, categoria, icone, ano, tipo_arquivo, tamanho, arquivo_url, link_externo, destaque, publicado_em
       FROM transparencia_documentos WHERE ${conds.join(" AND ")} ORDER BY destaque DESC, publicado_em DESC`,
      params
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar documentos." });
  }
});

// GET /api/transparencia/documentos/admin  (admin)
router.get("/documentos/admin", autenticar, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT * FROM transparencia_documentos ORDER BY destaque DESC, publicado_em DESC`
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar documentos (admin)." });
  }
});

// GET /api/transparencia/financas  (público)
router.get("/financas", async (req: Request, res: Response): Promise<void> => {
  const secao = req.query.secao as string | undefined;
  const ano   = req.query.ano as string | undefined;

  const conds: string[]  = ["ativo = TRUE"];
  const params: unknown[] = [];

  if (secao) { params.push(secao); conds.push(`secao = $${params.length}`); }
  if (ano)   { params.push(parseInt(ano, 10)); conds.push(`ano = $${params.length}`); }

  try {
    const result = await query(
      `SELECT * FROM financas_documentos WHERE ${conds.join(" AND ")} ORDER BY ano DESC, publicado_em DESC`,
      params
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar documentos financeiros." });
  }
});

// GET /api/transparencia/legislacao  (público)
router.get("/legislacao", async (req: Request, res: Response): Promise<void> => {
  const tipo      = req.query.tipo as string | undefined;
  const categoria = req.query.categoria as string | undefined;
  const destaque  = req.query.destaque === "true";

  const conds: string[]  = ["ativo = TRUE"];
  const params: unknown[] = [];

  if (tipo)      { params.push(tipo);      conds.push(`tipo = $${params.length}`); }
  if (categoria) { params.push(categoria); conds.push(`categoria = $${params.length}`); }
  if (destaque)  { conds.push("destaque = TRUE"); }

  try {
    const result = await query(
      `SELECT id, numero, titulo, descricao, categoria, tipo, ano, publicacao, link_url, destaque
       FROM legislacao WHERE ${conds.join(" AND ")} ORDER BY destaque DESC, ano DESC`,
      params
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar legislação." });
  }
});

// POST /api/transparencia  (admin)
router.post("/", autenticar, exigirPermissao("transparencia"), auditoria("criar", "transparencia"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { titulo, categoria, icone, ano, tipo_arquivo, tamanho, arquivo_url, link_externo, descricao, destaque } = req.body;
  try {
    const novo = await queryOne(
      `INSERT INTO transparencia_documentos (titulo, categoria, icone, ano, tipo_arquivo, tamanho, arquivo_url, link_externo, descricao, destaque)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [titulo, categoria, icone??'ri-file-text-line', ano??null, tipo_arquivo??'PDF', tamanho??null, arquivo_url??null, link_externo??null, descricao??null, destaque??false]
    );
    res.status(201).json({ sucesso: true, dados: novo });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao criar documento." });
  }
});

// DELETE /api/transparencia/:id  (admin)
router.delete("/:id", autenticar, exigirPermissao("transparencia"), auditoria("excluir","transparencia"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query("UPDATE transparencia_documentos SET ativo = FALSE WHERE id = $1", [req.params.id]);
    res.json({ sucesso: true, mensagem: "Documento removido." });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao remover documento." });
  }
});

// ── ROTAS DO PAINEL DE TRANSPARÊNCIA (TransparencyPanel) ─────────────────────────

// GET /api/transparencia/painel (público)
router.get("/painel", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT * FROM transparency_panel WHERE isActive = 1 OR id BETWEEN 1 AND 6 ORDER BY "order" ASC`
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar o painel de transparência." });
  }
});

// GET /api/transparencia/painel/admin (admin)
router.get("/painel/admin", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT * FROM transparency_panel ORDER BY "order" ASC`
    );
    res.json({ sucesso: true, dados: result.rows });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar painéis para administração." });
  }
});

// POST /api/transparencia/painel (admin)
router.post("/painel", autenticar, exigirPermissao("painel"), auditoria("criar", "painel"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, fileUrl, fileName, fileType, mimeType, slideImages, order, isActive } = req.body;
  try {
    const novo = await queryOne(
      `INSERT INTO transparency_panel (title, description, fileUrl, fileName, fileType, mimeType, slideImages, "order", isActive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description || "", fileUrl || "", fileName || "", fileType || "PDF", mimeType || "", JSON.stringify(slideImages || []), order || 0, isActive !== undefined ? (isActive ? 1 : 0) : 1]
    );
    res.status(201).json({ sucesso: true, dados: novo });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao criar card de transparência." });
  }
});

// PUT /api/transparencia/painel/:id (admin)
router.put("/painel/:id", autenticar, exigirPermissao("painel"), auditoria("atualizar", "painel"), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { title, description, fileUrl, fileName, fileType, mimeType, slideImages, order, isActive } = req.body;
  try {
    const atualizado = await queryOne(
      `UPDATE transparency_panel
       SET title = $1, description = $2, fileUrl = $3, fileName = $4, fileType = $5, mimeType = $6, slideImages = $7, "order" = $8, isActive = $9, updatedAt = datetime('now')
       WHERE id = $10 RETURNING *`,
      [title, description || "", fileUrl || "", fileName || "", fileType || "PDF", mimeType || "", JSON.stringify(slideImages || []), order || 0, isActive !== undefined ? (isActive ? 1 : 0) : 1, id]
    );
    if (!atualizado) {
      res.status(404).json({ sucesso: false, mensagem: "Card de transparência não encontrado." });
      return;
    }
    res.json({ sucesso: true, dados: atualizado });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar card de transparência." });
  }
});

// POST /api/transparencia/painel/:id/convert-slides (admin)
// Runs the Python PPTX-to-images script and persists the resulting slideImages.
router.post("/painel/:id/convert-slides", autenticar, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  try {
    const panel = await queryOne<{ id: number; fileUrl: string; title: string }>(
      `SELECT id, fileUrl, title FROM transparency_panel WHERE id = $1`,
      [id]
    );
    if (!panel) {
      res.status(404).json({ sucesso: false, mensagem: "Painel não encontrado." });
      return;
    }
    const fileUrl: string = panel.fileUrl || "";
    if (!fileUrl) {
      res.status(400).json({ sucesso: false, mensagem: "Nenhum arquivo associado a este painel." });
      return;
    }

    // Resolve disk path from URL (/uploads/... → UPLOAD_PATH/...)
    const relativePath = fileUrl.replace(/^\/uploads\//i, "");
    const diskPath = path.resolve(env.upload.path, relativePath);

    if (!fs.existsSync(diskPath)) {
      res.status(400).json({ sucesso: false, mensagem: `Arquivo não encontrado no disco: ${relativePath}` });
      return;
    }

    const ext = path.extname(diskPath).toLowerCase();
    const isPptx = [".ppt", ".pptx", ".pps", ".ppsx", ".odp"].includes(ext);
    if (!isPptx) {
      res.status(400).json({ sucesso: false, mensagem: "Conversão disponível apenas para arquivos PPTX/PPT/ODP." });
      return;
    }

    const outDir = path.resolve(env.upload.path, "slide-previews");
    fs.mkdirSync(outDir, { recursive: true });

    const prefix = `painel_${id}_${Date.now()}`;
    const scriptPath = path.resolve(process.cwd(), "scripts/pptx_to_slides.py");

    await new Promise<void>((resolve, reject) => {
      execFile("python3", [scriptPath, diskPath, outDir, prefix], { timeout: 120_000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        try {
          const result = JSON.parse(stdout.trim()) as { success: boolean; slide_images: string[]; error?: string };
          if (!result.success) { reject(new Error(result.error || "Conversão falhou")); return; }

          // Persist slideImages and update the panel record
          queryOne(
            `UPDATE transparency_panel SET slideImages = $1, updatedAt = datetime('now') WHERE id = $2 RETURNING *`,
            [JSON.stringify(result.slide_images), id]
          ).then((updated) => {
            if (!updated) { reject(new Error("Painel não encontrado ao persistir.")); return; }
            res.json({ sucesso: true, dados: updated, slide_images: result.slide_images, slide_count: result.slide_images.length });
            resolve();
          }).catch(reject);
        } catch {
          reject(new Error("Resposta inválida do script Python."));
        }
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro na conversão de slides.";
    res.status(500).json({ sucesso: false, mensagem: msg });
  }
});

// DELETE /api/transparencia/painel/:id (admin)
router.delete("/painel/:id", autenticar, exigirPermissao("painel"), auditoria("excluir", "painel"), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (id >= 1 && id <= 6) {
    res.status(400).json({ sucesso: false, mensagem: "Os 6 painéis previdenciários obrigatórios não podem ser excluídos." });
    return;
  }
  try {
    const result = await query("DELETE FROM transparency_panel WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ sucesso: false, mensagem: "Card de transparência não encontrado." });
      return;
    }
    res.json({ sucesso: true, mensagem: "Card de transparência excluído com sucesso." });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir card de transparência." });
  }
});

export default router;
