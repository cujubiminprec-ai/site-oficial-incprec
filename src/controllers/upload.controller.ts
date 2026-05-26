import { Router, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { query, queryOne } from "../config/database";
import { autenticar } from "../middleware/auth";
import { uploadUnico, uploadMultiplo, urlPublica, normalizarPastaUpload } from "../middleware/upload";
import env from "../config/env";

const router = Router();

// ============================================================
// POST /api/upload  — upload único (admin)
// ============================================================
router.post(
  "/",
  autenticar,
  (req: Request, res: Response, next: NextFunction) => {
    uploadUnico(req, res, (err) => {
      if (err) {
        res.status(400).json({ sucesso: false, mensagem: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ sucesso: false, mensagem: "Nenhum arquivo enviado." });
      return;
    }

    const pasta     = normalizarPastaUpload(req.query.pasta as string | undefined);
    const publicUrl = urlPublica(req.file.path, req);
    const caminho   = `/uploads/${pasta}/${req.file.filename}`;

    try {
      await query(
        `INSERT INTO arquivos (nome_original, nome_storage, pasta, caminho, url_publica, tipo_mime, tamanho_bytes, entidade, entidade_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          req.file.originalname,
          req.file.filename,
          pasta,
          caminho,
          publicUrl,
          req.file.mimetype,
          req.file.size,
          (req.query.entidade as string) ?? null,
          (req.query.entidade_id as string) ?? null,
        ]
      );
      const arquivo = await queryOne<{ id: number }>(
        "SELECT id FROM arquivos WHERE caminho = $1",
        [caminho]
      );

      res.status(201).json({
        sucesso: true,
        dados: {
          id:         arquivo!.id,
          nome:       req.file.originalname,
          url:        publicUrl,
          caminho,
          tipo_mime:  req.file.mimetype,
          tamanho:    req.file.size,
          pasta,
        },
      });
    } catch (err) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      console.error("Erro ao salvar upload:", err);
      res.status(500).json({ sucesso: false, mensagem: "Arquivo enviado, mas não foi possível registrar no banco MySQL." });
    }
  }
);

// ============================================================
// POST /api/upload/multiplo  — upload múltiplo (admin)
// ============================================================
router.post(
  "/multiplo",
  autenticar,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMultiplo(req, res, (err) => {
      if (err) { res.status(400).json({ sucesso: false, mensagem: err.message }); return; }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ sucesso: false, mensagem: "Nenhum arquivo enviado." });
      return;
    }

    const pasta     = normalizarPastaUpload(req.query.pasta as string | undefined);
    const resultados: { id: number; nome: string; url: string; caminho: string; tipo_mime: string; tamanho: number; pasta: string }[] = [];

    for (const f of files) {
      const publicUrl = urlPublica(f.path, req);
      const caminho   = `/uploads/${pasta}/${f.filename}`;

      await query(
        `INSERT INTO arquivos (nome_original, nome_storage, pasta, caminho, url_publica, tipo_mime, tamanho_bytes, entidade, entidade_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          f.originalname,
          f.filename,
          pasta,
          caminho,
          publicUrl,
          f.mimetype,
          f.size,
          (req.query.entidade as string) ?? null,
          (req.query.entidade_id as string) ?? null,
        ]
      );
      const arquivo = await queryOne<{ id: number }>(
        "SELECT id FROM arquivos WHERE caminho = $1",
        [caminho]
      );

      resultados.push({
        id:        arquivo!.id as number,
        nome:      f.originalname,
        url:       publicUrl,
        caminho,
        tipo_mime: f.mimetype,
        tamanho:   f.size,
        pasta,
      });
    }

    res.status(201).json({ sucesso: true, dados: resultados });
  }
);

// ============================================================
// GET /api/upload  — listar arquivos (admin)
// ============================================================
router.get("/", autenticar, async (req: Request, res: Response): Promise<void> => {
  const pasta = req.query.pasta as string | undefined;
  const conds: string[]  = ["ativo = TRUE"];
  const params: unknown[] = [];

  if (pasta) { params.push(pasta); conds.push(`pasta = $${params.length}`); }

  try {
    const result = await query(
      `SELECT id, nome_original, nome_storage, pasta, caminho, url_publica, tipo_mime, tamanho_bytes, criado_em
       FROM arquivos WHERE ${conds.join(" AND ")} ORDER BY criado_em DESC LIMIT 100`,
      params
    );
    res.json({
      sucesso: true,
      dados: result.rows.map((arquivo) => ({
        ...arquivo,
        nome: arquivo.nome_original,
        url: arquivo.url_publica,
        tamanho: arquivo.tamanho_bytes,
        tipo: arquivo.tipo_mime,
        created_at: arquivo.criado_em,
      })),
    });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar arquivos." });
  }
});

// ============================================================
// DELETE /api/upload/:id  — remover arquivo (admin)
// ============================================================
router.delete("/:id", autenticar, async (req: Request, res: Response): Promise<void> => {
  try {
    const arquivo = await queryOne<{ caminho: string; nome_original: string }>(
      "SELECT caminho, nome_original FROM arquivos WHERE id = $1",
      [req.params.id]
    );

    if (!arquivo) { res.status(404).json({ sucesso: false, mensagem: "Arquivo não encontrado." }); return; }

    // Remove do disco
    const caminhoAbs = path.resolve(env.upload.path, arquivo.caminho.replace(/^\/uploads\//, ""));
    if (fs.existsSync(caminhoAbs)) {
      fs.unlinkSync(caminhoAbs);
    }

    // Marca como inativo (soft delete)
    await query("UPDATE arquivos SET ativo = FALSE WHERE id = $1", [req.params.id]);

    res.json({ sucesso: true, mensagem: `Arquivo "${arquivo.nome_original}" removido.` });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao remover arquivo." });
  }
});

export default router;
