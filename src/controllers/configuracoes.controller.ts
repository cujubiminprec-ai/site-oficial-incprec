import { Router, Request, Response } from "express";
import { queryOne, query } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

const campoConfigMap: Record<string, string> = {
  siteName: "nome_site",
  siteSlogan: "descricao_site",
  sloganLogo: "slogan_logo",
  whatsapp: "telefone_whatsapp",
  email: "email_contato",
  telefone: "telefone_principal",
  endereco: "endereco_logradouro",
  horario: "horario_atendimento",
  horarioSeg: "horario_atendimento",
  horarioSab: "horario_sab",
  horarioDom: "horario_dom",
  contrachequeUrl: "contracheque_url",
  mapEmbedUrl: "map_embed_url",
  logoIcon: "logo_icon",
  logoImageUrl: "logo_url",
  sloganImageUrl: "slogan_image_url",
  sloganImageVisivel: "slogan_image_visivel",
  sloganImageLocal: "slogan_image_local",
  proGestaoSeloUrl: "pro_gestao_selo_url",
  proGestaoLink: "pro_gestao_link",
  proGestaoVisivel: "pro_gestao_visivel",
  proGestaoLocais: "pro_gestao_locais",
  topbarVisivel: "topbar_visivel",
  topbarEmailVisivel: "topbar_email_visivel",
  topbarTelefoneVisivel: "topbar_telefone_visivel",
  topbarRedesVisivel: "topbar_redes_visivel",
  topbarMapaSiteVisivel: "topbar_mapa_site_visivel",
  layoutZoom: "layout_zoom",
  fontFamily: "fonte_principal",
  borderRadius: "border_radius",
  redeFacebook: "facebook_url",
  redeInstagram: "instagram_url",
  redeYoutube: "youtube_url",
  redeLinkedin: "linkedin_url",
};

const configPermitidos = new Set([
  "nome_site","nome_completo","descricao_site","logo_url","favicon_url",
  "cor_primaria","cor_secundaria","cor_destaque","fonte_principal",
  "email_contato","telefone_principal","telefone_whatsapp",
  "endereco_logradouro","endereco_cidade","endereco_estado","endereco_cep",
  "horario_atendimento","facebook_url","instagram_url","youtube_url",
  "linkedin_url","twitter_url","rodape_texto","meta_titulo","meta_descricao",
  "meta_keywords","modo_manutencao","logo_icon","slogan_logo",
  "slogan_image_url","slogan_image_visivel","slogan_image_local",
  "pro_gestao_selo_url","pro_gestao_link","pro_gestao_visivel",
  "pro_gestao_locais","contracheque_url","map_embed_url","horario_sab",
  "horario_dom","topbar_visivel","topbar_email_visivel",
  "topbar_telefone_visivel","topbar_redes_visivel",
  "topbar_mapa_site_visivel","layout_zoom","border_radius",
]);

function normalizarValorConfig(coluna: string, valor: unknown): unknown {
  if (typeof valor === "boolean") return valor ? 1 : 0;
  if (coluna === "layout_zoom") {
    const parsed = Number(valor);
    return Number.isFinite(parsed) ? parsed : 100;
  }
  return valor ?? null;
}

async function getAppConfig<T>(chave: string, fallback: T): Promise<T> {
  const row = await queryOne<{ valor?: unknown }>("SELECT valor FROM app_config WHERE chave = $1", [chave]);
  if (!row?.valor) return fallback;
  if (typeof row.valor !== "string") return row.valor as T;
  try {
    return JSON.parse(row.valor) as T;
  } catch {
    return fallback;
  }
}

async function setAppConfig(chave: string, valor: unknown): Promise<void> {
  await query(`
    INSERT INTO app_config (chave, valor, tipo, atualizado_em)
    VALUES ($1, $2, 'json', NOW())
    ON DUPLICATE KEY UPDATE valor = VALUES(valor), atualizado_em = NOW()
  `, [chave, JSON.stringify(valor)]);
}

// GET /api/configuracoes  (público — sem senha e dados sensíveis)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await queryOne("SELECT * FROM configuracoes_site WHERE id = 1");
    res.json({ sucesso: true, dados: config });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar configurações." });
  }
});

// PUT /api/configuracoes  (admin)
router.put(
  "/",
  autenticar,
  exigirPermissao("configuracoes"),
  auditoria("editar", "configuracoes"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const campos = req.body as Record<string, unknown>;

    const sets: string[] = [];
    const vals: unknown[] = [];
    const usados = new Set<string>();

    Object.entries(campos).forEach(([campo, val]) => {
      const col = campoConfigMap[campo] ?? campo;
      if (configPermitidos.has(col) && !usados.has(col)) {
        usados.add(col);
        vals.push(normalizarValorConfig(col, val));
        sets.push(`${col} = $${vals.length}`);
      }
    });

    if (sets.length === 0) {
      res.status(400).json({ sucesso: false, mensagem: "Nenhum campo válido para atualizar." });
      return;
    }

    // Garante que o registro existe
    const existe = await queryOne("SELECT id FROM configuracoes_site WHERE id = 1");
    if (!existe) {
      await query("INSERT INTO configuracoes_site (id) VALUES (1)");
    }

    vals.push(1);
    try {
      await query(
        `UPDATE configuracoes_site SET ${sets.join(", ")}, atualizado_em = NOW() WHERE id = $${vals.length}`,
        vals
      );
      const atualizado = await queryOne("SELECT * FROM configuracoes_site WHERE id = 1");
      res.json({ sucesso: true, dados: atualizado });
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar configurações." });
    }
  }
);

// GET /api/configuracoes/app/:chave (público)
router.get("/app/:chave", async (req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await getAppConfig(req.params.chave, null) });
});

// PUT /api/configuracoes/app/:chave (admin)
router.put(
  "/app/:chave",
  autenticar,
  exigirPermissao("configuracoes"),
  auditoria("editar", "configuracoes"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    await setAppConfig(req.params.chave, req.body);
    res.json({ sucesso: true, dados: req.body });
  }
);

// GET /api/configuracoes/banner  (público)
router.get("/banner", async (_req: Request, res: Response): Promise<void> => {
  try {
    const banner = await queryOne("SELECT * FROM banner_aviso WHERE ativo = TRUE ORDER BY id DESC LIMIT 1");
    res.json({ sucesso: true, dados: banner ?? null });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar banner." });
  }
});

// PUT /api/configuracoes/banner  (admin)
router.put("/banner", autenticar, exigirPermissao("banner"), async (req: AuthRequest, res: Response): Promise<void> => {
  const { texto, link_url, link_label, cor_fundo, cor_texto, ativo } = req.body;
  try {
    const existe = await queryOne("SELECT id FROM banner_aviso LIMIT 1");
    let banner;
    if (existe) {
      banner = await queryOne(
        `UPDATE banner_aviso SET texto=COALESCE($1,texto), link_url=$2, link_label=$3,
         cor_fundo=COALESCE($4,cor_fundo), cor_texto=COALESCE($5,cor_texto), ativo=$6, atualizado_em=NOW()
         WHERE id=$7 RETURNING *`,
        [texto??null, link_url??null, link_label??null, cor_fundo??null, cor_texto??null, ativo ?? true, existe.id]
      );
    } else {
      banner = await queryOne(
        "INSERT INTO banner_aviso (texto, link_url, link_label, cor_fundo, cor_texto, ativo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [texto, link_url??null, link_label??null, cor_fundo??null, cor_texto??null, ativo??false]
      );
    }
    res.json({ sucesso: true, dados: banner });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar banner." });
  }
});

export default router;
