import { Router, Request, Response } from "express";
import { query, queryOne } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

function mapAtalho(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    label: String(row.label || ""),
    descricao: row.descricao ? String(row.descricao) : "",
    href: String(row.href || ""),
    icone: String(row.icone || "ri-link-line"),
    iconeImg: row.icone_img ? String(row.icone_img) : "",
    cor: String(row.cor || "#16a34a"),
    locais: String(row.locais || "rodape").split(",").map((s: string) => s.trim()).filter(Boolean),
    externo: row.externo === 1 || row.externo === true || row.externo === "1",
    ordem: Number(row.ordem || 0),
    ativo: row.ativo !== 0 && row.ativo !== false,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

// GET /api/atalhos — público, somente ativos
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query("SELECT * FROM atalhos_rapidos WHERE ativo = 1 ORDER BY ordem ASC, id ASC");
    res.json({ sucesso: true, dados: result.rows.map(mapAtalho) });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar atalhos." });
  }
});

// GET /api/atalhos/admin — admin, todos
router.get("/admin", autenticar, exigirPermissao("configuracoes"), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query("SELECT * FROM atalhos_rapidos ORDER BY ordem ASC, id ASC");
    res.json({ sucesso: true, dados: result.rows.map(mapAtalho) });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar atalhos." });
  }
});

// POST /api/atalhos — criar
router.post("/", autenticar, exigirPermissao("configuracoes"), auditoria("criar", "atalhos"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { label, descricao, href, icone, iconeImg, cor, locais, externo, ordem, ativo } = req.body;
  if (!label || !href) { res.status(400).json({ sucesso: false, mensagem: "label e href são obrigatórios." }); return; }
  try {
    const locaisStr = Array.isArray(locais) ? locais.join(",") : String(locais || "rodape");
    const criado = await queryOne(
      `INSERT INTO atalhos_rapidos (label, descricao, href, icone, icone_img, cor, locais, externo, ordem, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [label, descricao || "", href, icone || "ri-link-line", iconeImg || "", cor || "#16a34a",
       locaisStr, externo ? 1 : 0, Number(ordem || 0), ativo === false ? 0 : 1]
    );
    res.status(201).json({ sucesso: true, dados: criado ? mapAtalho(criado) : null });
  } catch (err) {
    console.error("Erro ao criar atalho:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao criar atalho." });
  }
});

// PUT /api/atalhos/:id — atualizar
router.put("/:id", autenticar, exigirPermissao("configuracoes"), auditoria("editar", "atalhos"), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { label, descricao, href, icone, iconeImg, cor, locais, externo, ordem, ativo } = req.body;
  try {
    const locaisStr = Array.isArray(locais) ? locais.join(",") : String(locais || "rodape");
    await query(
      `UPDATE atalhos_rapidos SET label=$1, descricao=$2, href=$3, icone=$4, icone_img=$5, cor=$6,
       locais=$7, externo=$8, ordem=$9, ativo=$10, atualizado_em=NOW() WHERE id=$11`,
      [label, descricao || "", href, icone || "ri-link-line", iconeImg || "", cor || "#16a34a",
       locaisStr, externo ? 1 : 0, Number(ordem || 0), ativo === false ? 0 : 1, id]
    );
    const atualizado = await queryOne("SELECT * FROM atalhos_rapidos WHERE id = $1", [id]);
    res.json({ sucesso: true, dados: atualizado ? mapAtalho(atualizado) : null });
  } catch (err) {
    console.error("Erro ao atualizar atalho:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar atalho." });
  }
});

// DELETE /api/atalhos/:id
router.delete("/:id", autenticar, exigirPermissao("configuracoes"), auditoria("excluir", "atalhos"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query("DELETE FROM atalhos_rapidos WHERE id = $1", [Number(req.params.id)]);
    res.json({ sucesso: true });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir atalho." });
  }
});

export default router;
