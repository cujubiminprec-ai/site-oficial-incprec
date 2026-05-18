import { Router, Request, Response } from "express";
import { query, queryOne, queryPaginado } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

// GET /api/gestores  (público)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const grupo = req.query.grupo as string | undefined;
  const conds: string[]  = ["ativo = TRUE"];
  const params: unknown[] = [];

  if (grupo) { params.push(grupo); conds.push(`grupo = $${params.length}`); }

  try {
    const result = await query(
      `SELECT id, nome, cargo, grupo, foto_url, email, telefone, bio, mandato, posicao
       FROM gestores WHERE ${conds.join(" AND ")} ORDER BY grupo, posicao`,
      params
    );

    // Busca cursos e documentos de cada gestor
    const gestores = await Promise.all(
      result.rows.map(async (g) => {
        const cursos = await query("SELECT * FROM gestor_cursos WHERE gestor_id = $1 ORDER BY posicao", [g.id]);
        const docs   = await query("SELECT * FROM gestor_documentos WHERE gestor_id = $1 ORDER BY posicao", [g.id]);
        return { ...g, cursos: cursos.rows, documentos: docs.rows };
      })
    );

    res.json({ sucesso: true, dados: gestores });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar gestores." });
  }
});

// GET /api/gestores/:id  (público)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const gestor = await queryOne("SELECT * FROM gestores WHERE id = $1", [req.params.id]);
    if (!gestor) { res.status(404).json({ sucesso: false, mensagem: "Gestor não encontrado." }); return; }

    const cursos = await query("SELECT * FROM gestor_cursos WHERE gestor_id = $1 ORDER BY posicao", [req.params.id]);
    const docs   = await query("SELECT * FROM gestor_documentos WHERE gestor_id = $1 ORDER BY posicao", [req.params.id]);

    res.json({ sucesso: true, dados: { ...gestor, cursos: cursos.rows, documentos: docs.rows } });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar gestor." });
  }
});

// POST /api/gestores  (admin)
router.post("/", autenticar, exigirPermissao("gestores"), auditoria("criar", "gestores"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { nome, cargo, grupo, foto_url, email, telefone, bio, formacao, mandato, posicao } = req.body;
  try {
    const novo = await queryOne(
      `INSERT INTO gestores (nome, cargo, grupo, foto_url, email, telefone, bio, formacao, mandato, posicao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [nome, cargo, grupo, foto_url ?? null, email ?? null, telefone ?? null, bio ?? null, formacao ?? null, mandato ?? null, posicao ?? 0]
    );
    res.status(201).json({ sucesso: true, dados: novo });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao criar gestor." });
  }
});

// PUT /api/gestores/:id  (admin)
router.put("/:id", autenticar, exigirPermissao("gestores"), auditoria("editar", "gestores"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { nome, cargo, grupo, foto_url, email, telefone, bio, formacao, mandato, posicao, ativo } = req.body;
  try {
    const atualizado = await queryOne(
      `UPDATE gestores SET nome=COALESCE($1,nome), cargo=COALESCE($2,cargo), grupo=COALESCE($3,grupo),
       foto_url=COALESCE($4,foto_url), email=COALESCE($5,email), telefone=COALESCE($6,telefone),
       bio=COALESCE($7,bio), mandato=COALESCE($8,mandato), posicao=COALESCE($9,posicao),
       ativo=COALESCE($10,ativo), atualizado_em=NOW() WHERE id=$11 RETURNING *`,
      [nome??null, cargo??null, grupo??null, foto_url??null, email??null, telefone??null,
       bio??null, mandato??null, posicao??null, ativo??null, req.params.id]
    );
    if (!atualizado) { res.status(404).json({ sucesso: false, mensagem: "Gestor não encontrado." }); return; }
    res.json({ sucesso: true, dados: atualizado });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar gestor." });
  }
});

// DELETE /api/gestores/:id  (admin)
router.delete("/:id", autenticar, exigirPermissao("gestores"), auditoria("excluir", "gestores"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query("DELETE FROM gestores WHERE id = $1", [req.params.id]);
    res.json({ sucesso: true, mensagem: "Gestor excluído." });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir gestor." });
  }
});

export default router;
