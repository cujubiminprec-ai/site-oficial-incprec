import { Router, Request, Response } from "express";
import { query, queryOne, runInTransaction } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

type GestorPayload = Record<string, any>;

function gestorId(row: Record<string, any> | null): number | null {
  return row?.id !== undefined ? Number(row.id) : null;
}

function mapGestorPayload(body: GestorPayload) {
  return {
    nome: body.nome,
    cargo: body.cargo,
    grupo: body.grupo,
    foto_url: body.foto_url ?? body.foto ?? null,
    email: body.email ?? null,
    telefone: body.telefone ?? null,
    matricula: body.matricula ?? null,
    bio: body.bio ?? body.biografia ?? null,
    formacao: body.formacao ?? null,
    mandato: body.mandato ?? body.periodo ?? null,
    posicao: body.posicao ?? body.ordem ?? 0,
    ativo: body.ativo === false ? 0 : body.ativo === undefined ? undefined : 1,
  };
}

async function salvarRelacoesGestor(gestorIdValue: number, body: GestorPayload, executor: any) {
  if (Array.isArray(body.cursos)) {
    await query("DELETE FROM gestor_cursos WHERE gestor_id = $1", [gestorIdValue], executor);
    for (const [index, curso] of body.cursos.entries()) {
      await query(
        `INSERT INTO gestor_cursos (gestor_id, titulo, instituicao, ano, carga_horaria, tipo, posicao)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [gestorIdValue, curso.titulo || "", curso.instituicao || "", curso.ano || null, curso.cargaHoraria ?? curso.carga_horaria ?? null, curso.tipo || "Curso", index + 1],
        executor
      );
    }
  }

  if (Array.isArray(body.documentos)) {
    await query("DELETE FROM gestor_documentos WHERE gestor_id = $1", [gestorIdValue], executor);
    for (const [index, doc] of body.documentos.entries()) {
      await query(
        `INSERT INTO gestor_documentos (gestor_id, titulo, tipo, tamanho, arquivo_url, posicao)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [gestorIdValue, doc.titulo || "", doc.tipo || "PDF", doc.tamanho || null, doc.url ?? doc.arquivo_url ?? "", index + 1],
        executor
      );
    }
  }
}

async function gestorCompleto(id: number | string) {
  const gestor = await queryOne("SELECT * FROM gestores WHERE id = $1", [id]);
  if (!gestor) return null;
  const cursos = await query("SELECT * FROM gestor_cursos WHERE gestor_id = $1 ORDER BY posicao", [id]);
  const docs = await query("SELECT * FROM gestor_documentos WHERE gestor_id = $1 ORDER BY posicao", [id]);
  return { ...gestor, cursos: cursos.rows, documentos: docs.rows };
}

// GET /api/gestores  (público)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const grupo = req.query.grupo as string | undefined;
  const incluirInativos = req.query.incluirInativos === "true" || req.query.admin === "true";
  const conds: string[]  = incluirInativos ? ["1 = 1"] : ["ativo = TRUE"];
  const params: unknown[] = [];

  if (grupo) { params.push(grupo); conds.push(`grupo = $${params.length}`); }

  try {
    const result = await query(
      `SELECT id, nome, cargo, grupo, foto_url, email, telefone, matricula, bio, formacao, mandato, posicao, ativo
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
  const payload = mapGestorPayload(req.body);
  try {
    const id = await runInTransaction(async (connection) => {
      const novo = await queryOne(
        `INSERT INTO gestores (nome, cargo, grupo, foto_url, email, telefone, matricula, bio, formacao, mandato, posicao, ativo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [payload.nome, payload.cargo, payload.grupo, payload.foto_url, payload.email, payload.telefone, payload.matricula, payload.bio, payload.formacao, payload.mandato, payload.posicao, payload.ativo ?? 1],
        connection
      );
      const novoId = gestorId(novo);
      if (!novoId) throw new Error("Gestor criado sem id.");
      await salvarRelacoesGestor(novoId, req.body, connection);
      return novoId;
    });
    res.status(201).json({ sucesso: true, dados: await gestorCompleto(id) });
  } catch (err) {
    console.error("Erro ao criar gestor:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao criar gestor." });
  }
});

// PUT /api/gestores/:id  (admin)
router.put("/:id", autenticar, exigirPermissao("gestores"), auditoria("editar", "gestores"), async (req: AuthRequest, res: Response): Promise<void> => {
  const payload = mapGestorPayload(req.body);
  try {
    const id = Number(req.params.id);
    const exists = await runInTransaction(async (connection) => {
      const atualizado = await queryOne(
        `UPDATE gestores SET nome=COALESCE($1,nome), cargo=COALESCE($2,cargo), grupo=COALESCE($3,grupo),
         foto_url=COALESCE($4,foto_url), email=COALESCE($5,email), telefone=COALESCE($6,telefone),
         matricula=COALESCE($7,matricula), bio=COALESCE($8,bio), formacao=COALESCE($9,formacao),
         mandato=COALESCE($10,mandato), posicao=COALESCE($11,posicao), ativo=COALESCE($12,ativo),
         atualizado_em=NOW() WHERE id=$13 RETURNING *`,
        [payload.nome ?? null, payload.cargo ?? null, payload.grupo ?? null, payload.foto_url ?? null, payload.email, payload.telefone, payload.matricula, payload.bio, payload.formacao, payload.mandato, payload.posicao, payload.ativo, id],
        connection
      );
      if (!atualizado) return false;
      await salvarRelacoesGestor(id, req.body, connection);
      return true;
    });
    if (!exists) { res.status(404).json({ sucesso: false, mensagem: "Gestor não encontrado." }); return; }
    res.json({ sucesso: true, dados: await gestorCompleto(id) });
  } catch (err) {
    console.error("Erro ao atualizar gestor:", err);
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
