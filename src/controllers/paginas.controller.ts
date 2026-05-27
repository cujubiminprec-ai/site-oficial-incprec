import { Router, Request, Response } from "express";
import { query, queryOne, runInTransaction } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

function slugPageId(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `pagina-${Date.now()}`;
}

function normalizarRota(rota: unknown, nome: string): string {
  const raw = String(rota || "").trim() || `/${slugPageId(nome)}`;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function statusDb(status: unknown): string {
  const value = String(status || "rascunho");
  if (["publicada", "rascunho", "oculta", "desativada"].includes(value)) return value;
  return "rascunho";
}

function mapPagina(row: Record<string, unknown>) {
  return {
    dbId: row.id,
    id: String(row.page_id || row.id || ""),
    pageId: String(row.page_id || row.id || ""),
    nome: String(row.nome || ""),
    titulo: String(row.nome || ""),
    rota: String(row.rota || ""),
    status: row.status === "desativada" ? "oculta" : String(row.status || "rascunho"),
    descricao: String(row.descricao_interna || row.descricao_seo || ""),
    descricao_interna: row.descricao_interna || row.descricao_seo || "",
    menuLocal: String(row.menu_local || "Nenhum (sem menu)"),
    menu_local: String(row.menu_local || "Nenhum (sem menu)"),
    subMenu: row.sub_menu === 1 || row.sub_menu === true || row.sub_menu === "1",
    sub_menu: row.sub_menu === 1 || row.sub_menu === true || row.sub_menu === "1",
    icone: String(row.icone || "ri-pages-line"),
    modelo: String(row.modelo || "informativo"),
    ordem: Number(row.ordem || row.id || 0),
    tituloSeo: row.titulo_seo || "",
    descricaoSeo: row.descricao_seo || "",
    keywordsSeo: row.keywords_seo || "",
    titulo_seo: row.titulo_seo || "",
    descricao_seo: row.descricao_seo || "",
    keywords_seo: row.keywords_seo || "",
    editavel: row.editavel !== 0 && row.editavel !== false,
    ultimaEdicao: row.ultima_edicao || null,
    atualizadoEm: row.atualizado_em || "",
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
  };
}

async function selecionarPagina(pageId: string) {
  const value = String(pageId || "").trim();
  if (/^\d+$/.test(value)) {
    return queryOne(
      "SELECT * FROM paginas WHERE page_id = $1 OR rota = $1 OR id = $2 LIMIT 1",
      [value, Number(value)]
    );
  }

  return queryOne(
    "SELECT * FROM paginas WHERE page_id = $1 OR rota = $1 OR rota = $2 LIMIT 1",
    [value, value.startsWith("/") ? value : "/" + value]
  );
}


// GET /api/paginas/admin  (admin — todas as páginas)
router.get("/admin", autenticar, exigirPermissao("paginas"), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT * FROM paginas ORDER BY COALESCE(ordem, id) ASC, nome ASC`
    );
    res.json({ sucesso: true, dados: result.rows.map(mapPagina) });
  } catch (err) {
    console.error("Erro ao listar páginas admin:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar páginas para administração." });
  }
});

// GET /api/paginas/publicas  (público — somente publicadas)
router.get("/publicas", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT * FROM paginas WHERE status = 'publicada' ORDER BY COALESCE(ordem, id) ASC, nome ASC`
    );
    res.json({ sucesso: true, dados: result.rows.map(mapPagina) });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar páginas públicas." });
  }
});

// GET /api/paginas  (público — apenas ativas)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      "SELECT * FROM paginas WHERE status = 'publicada' ORDER BY COALESCE(ordem, id) ASC, nome ASC"
    );
    res.json({ sucesso: true, dados: result.rows.map(mapPagina) });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar páginas." });
  }
});


// GET /api/paginas/:pageId  (público/admin — detalhe da página)
router.get("/:pageId", async (req: Request, res: Response): Promise<void> => {
  try {
    const pagina = await selecionarPagina(req.params.pageId);
    if (!pagina) { res.status(404).json({ sucesso: false, mensagem: "Página não encontrada." }); return; }
    res.json({ sucesso: true, dados: mapPagina(pagina) });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar página." });
  }
});

// POST /api/paginas  (admin — cria página)
router.post("/", autenticar, exigirPermissao("paginas"), auditoria("criar", "paginas"), async (req: AuthRequest, res: Response): Promise<void> => {
  const nome = String(req.body.nome || req.body.titulo || "").trim();
  if (!nome) { res.status(400).json({ sucesso: false, mensagem: "Nome da página obrigatório." }); return; }

  const rota = normalizarRota(req.body.rota, nome);
  const pageId = String(req.body.id || req.body.pageId || req.body.page_id || slugPageId(rota.replace(/^\//, "") || nome)).trim();

  try {
    const criado = await queryOne(
      `INSERT INTO paginas (page_id, nome, rota, status, titulo_seo, descricao_seo, keywords_seo, descricao_interna, menu_local, sub_menu, icone, modelo, ordem, editavel, criado_em, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW()) RETURNING *`,
      [
        pageId, nome, rota, statusDb(req.body.status),
        req.body.tituloSeo ?? req.body.titulo_seo ?? null,
        req.body.descricaoSeo ?? req.body.descricao_seo ?? null,
        req.body.keywordsSeo ?? req.body.keywords_seo ?? null,
        req.body.descricao ?? req.body.descricao_interna ?? null,
        req.body.menuLocal ?? req.body.menu_local ?? "Nenhum (sem menu)",
        req.body.subMenu ?? req.body.sub_menu ? 1 : 0,
        req.body.icone ?? "ri-pages-line",
        req.body.modelo ?? "informativo",
        req.body.ordem ?? 0,
        req.body.editavel === false ? 0 : 1,
      ]
    );
    res.status(201).json({ sucesso: true, dados: criado ? mapPagina(criado) : null });
  } catch (err: unknown) {
    console.error("Erro ao criar página:", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Duplicate entry") || msg.includes("unique")) {
      res.status(409).json({ sucesso: false, mensagem: "Já existe uma página com este identificador ou rota." });
    } else {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao criar página." });
    }
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
      await runInTransaction(async (connection) => {
        // Apaga os blocos existentes e reinsere
        await query("DELETE FROM paginas_blocos WHERE page_id = $1", [pageId], connection);

        for (const bloco of blocos) {
          await query(
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
            ],
            connection
          );
        }

        // Atualiza data da última edição
        await query(
          "UPDATE paginas SET ultima_edicao = NOW(), atualizado_em = NOW() WHERE page_id = $1",
          [pageId],
          connection
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
  const nome = req.body.nome ?? req.body.titulo;
  const rota = req.body.rota !== undefined ? normalizarRota(req.body.rota, String(nome || req.params.id)) : undefined;
  try {
    const lookup = String(req.params.id || "").trim();
    const lookupRota = lookup.startsWith("/") ? lookup : "/" + lookup;
    const updateResult = await query(
      `UPDATE paginas SET
        nome = COALESCE($1, nome),
        rota = COALESCE($2, rota),
        status = COALESCE($3, status),
        titulo_seo = COALESCE($4, titulo_seo),
        descricao_seo = COALESCE($5, descricao_seo),
        keywords_seo = COALESCE($6, keywords_seo),
        descricao_interna = COALESCE($7, descricao_interna),
        menu_local = COALESCE($8, menu_local),
        sub_menu = COALESCE($9, sub_menu),
        icone = COALESCE($10, icone),
        modelo = COALESCE($11, modelo),
        ordem = COALESCE($12, ordem),
        ultima_edicao = NOW(),
        atualizado_em = NOW()
       WHERE page_id = $13 OR rota = $14`,
      [
        nome ?? null,
        rota ?? null,
        req.body.status !== undefined ? statusDb(req.body.status) : null,
        req.body.tituloSeo ?? req.body.titulo_seo ?? null,
        req.body.descricaoSeo ?? req.body.descricao_seo ?? null,
        req.body.keywordsSeo ?? req.body.keywords_seo ?? null,
        req.body.descricao ?? req.body.descricao_interna ?? null,
        req.body.menuLocal ?? req.body.menu_local ?? null,
        req.body.subMenu !== undefined ? (req.body.subMenu ? 1 : 0) : (req.body.sub_menu !== undefined ? (req.body.sub_menu ? 1 : 0) : null),
        req.body.icone ?? null,
        req.body.modelo ?? null,
        req.body.ordem ?? null,
        lookup,
        lookupRota,
      ]
    );
    if (updateResult.rowCount === 0) { res.status(404).json({ sucesso: false, mensagem: "Página não encontrada." }); return; }
    const atualizado = await selecionarPagina(lookup);
    if (!atualizado) { res.status(404).json({ sucesso: false, mensagem: "Página não encontrada." }); return; }
    res.json({ sucesso: true, dados: mapPagina(atualizado) });
  } catch (err) {
    console.error("Erro ao atualizar página:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar página." });
  }
});

// DELETE /api/paginas/:id  (admin — remove página e blocos)
router.delete("/:id", autenticar, exigirPermissao("paginas"), auditoria("excluir", "paginas"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagina = await selecionarPagina(req.params.id);
    if (!pagina) { res.status(404).json({ sucesso: false, mensagem: "Página não encontrada." }); return; }
    await runInTransaction(async (connection) => {
      await query("DELETE FROM paginas_blocos WHERE page_id = $1", [pagina.page_id], connection);
      await query("DELETE FROM paginas WHERE page_id = $1", [pagina.page_id], connection);
    });
    res.json({ sucesso: true, mensagem: "Página excluída com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir página:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir página." });
  }
});

export default router;
