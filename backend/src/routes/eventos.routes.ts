import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { query, queryOne, queryPaginado } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

// GET /api/eventos  (público)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const pagina = parseInt(String(req.query.pagina ?? "1"), 10);
  const limite = parseInt(String(req.query.limite ?? "12"), 10);
  const tipo   = req.query.tipo as string | undefined;
  const status = req.query.status as string | undefined;

  const conds: string[]  = ["publicado = TRUE"];
  const params: unknown[] = [];
  if (tipo)   { params.push(tipo);   conds.push(`tipo = $${params.length}`);   }
  if (status) { params.push(status); conds.push(`status = $${params.length}`); }

  const sql = `SELECT id, titulo, tipo, status, data_inicio, hora_inicio, local, online,
                      link_online, palestrante, vagas, vagas_restantes, imagem_url,
                      certificado, carga_horaria, categoria, publicado, destaque
               FROM eventos WHERE ${conds.join(" AND ")} ORDER BY data_inicio ASC`;
  try {
    const { itens, total } = await queryPaginado(sql, params, pagina, limite);
    res.json({ sucesso: true, dados: itens, meta: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar eventos." });
  }
});

// GET /api/eventos/:id  (público)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const evento = await queryOne("SELECT * FROM eventos WHERE id = $1 AND publicado = TRUE", [req.params.id]);
    if (!evento) { res.status(404).json({ sucesso: false, mensagem: "Evento não encontrado." }); return; }
    res.json({ sucesso: true, dados: evento });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar evento." });
  }
});

// POST /api/eventos/:id/inscrever  (público)
router.post(
  "/:id/inscrever",
  [
    body("nome").notEmpty().withMessage("Nome obrigatório"),
    body("email").isEmail().withMessage("E-mail válido obrigatório"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: erros.array().map((e) => e.msg) });
      return;
    }

    const { nome, email, cpf, matricula, cargo, telefone } = req.body;

    try {
      // Verifica se evento existe e tem vagas
      const evento = await queryOne<{ id: number; vagas_restantes: number; vagas_ilimitadas: boolean; status: string }>(
        "SELECT id, vagas_restantes, vagas_ilimitadas, status FROM eventos WHERE id = $1",
        [req.params.id]
      );

      if (!evento) { res.status(404).json({ sucesso: false, mensagem: "Evento não encontrado." }); return; }
      if (evento.status === "encerrado") { res.status(400).json({ sucesso: false, mensagem: "Inscrições encerradas." }); return; }
      if (!evento.vagas_ilimitadas && evento.vagas_restantes !== null && evento.vagas_restantes <= 0) {
        res.status(400).json({ sucesso: false, mensagem: "Sem vagas disponíveis." });
        return;
      }

      const inscrito = await queryOne(
        `INSERT INTO eventos_inscritos (evento_id, nome, email, cpf, matricula, cargo, telefone)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, nome, email, status, criado_em`,
        [req.params.id, nome, email, cpf ?? null, matricula ?? null, cargo ?? null, telefone ?? null]
      );

      // Decrementa vagas
      if (!evento.vagas_ilimitadas) {
        await query("UPDATE eventos SET vagas_restantes = vagas_restantes - 1 WHERE id = $1", [req.params.id]);
      }

      res.status(201).json({ sucesso: true, dados: inscrito });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        res.status(409).json({ sucesso: false, mensagem: "E-mail já inscrito neste evento." });
      } else {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao realizar inscrição." });
      }
    }
  }
);

// POST /api/eventos  (admin)
router.post(
  "/",
  autenticar,
  exigirPermissao("eventos"),
  auditoria("criar", "eventos"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { titulo, tipo, status, data_inicio, hora_inicio, local, descricao, online,
            link_online, palestrante, vagas, imagem_url, banner_url, certificado,
            carga_horaria, categoria, publicado, destaque, conteudo_programatico } = req.body;
    try {
      const novo = await queryOne(
        `INSERT INTO eventos (titulo, tipo, status, data_inicio, hora_inicio, local, descricao, online,
          link_online, palestrante, vagas, vagas_restantes, imagem_url, banner_url, certificado,
          carga_horaria, categoria, publicado, destaque, conteudo_programatico)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
        [titulo, tipo ?? "evento", status ?? "em-breve", data_inicio, hora_inicio ?? null,
         local ?? null, descricao ?? null, online ?? false, link_online ?? null,
         palestrante ?? null, vagas ?? null, imagem_url ?? null, banner_url ?? null,
         certificado ?? false, carga_horaria ?? null, categoria ?? null,
         publicado ?? true, destaque ?? false, conteudo_programatico ?? null]
      );
      res.status(201).json({ sucesso: true, dados: novo });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao criar evento." });
    }
  }
);

// PUT /api/eventos/:id  (admin)
router.put("/:id", autenticar, exigirPermissao("eventos"), auditoria("editar", "eventos"), async (req: AuthRequest, res: Response): Promise<void> => {
  const campos = req.body;
  const sets: string[] = [];
  const vals: unknown[] = [];

  const mapeados: Record<string, unknown> = {
    titulo: campos.titulo, tipo: campos.tipo, status: campos.status,
    data_inicio: campos.data_inicio, hora_inicio: campos.hora_inicio,
    local: campos.local, descricao: campos.descricao, publicado: campos.publicado,
    destaque: campos.destaque, vagas: campos.vagas, imagem_url: campos.imagem_url,
    palestrante: campos.palestrante, certificado: campos.certificado,
  };

  Object.entries(mapeados).forEach(([col, val]) => {
    if (val !== undefined) {
      vals.push(val);
      sets.push(`${col} = $${vals.length}`);
    }
  });

  if (sets.length === 0) { res.status(400).json({ sucesso: false, mensagem: "Nenhum campo para atualizar." }); return; }

  vals.push(req.params.id);
  try {
    const atualizado = await queryOne(`UPDATE eventos SET ${sets.join(", ")}, atualizado_em = NOW() WHERE id = $${vals.length} RETURNING *`, vals);
    if (!atualizado) { res.status(404).json({ sucesso: false, mensagem: "Evento não encontrado." }); return; }
    res.json({ sucesso: true, dados: atualizado });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar evento." });
  }
});

// DELETE /api/eventos/:id  (admin)
router.delete("/:id", autenticar, exigirPermissao("eventos"), auditoria("excluir", "eventos"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query("DELETE FROM eventos WHERE id = $1", [req.params.id]);
    res.json({ sucesso: true, mensagem: "Evento excluído." });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir evento." });
  }
});

export default router;
