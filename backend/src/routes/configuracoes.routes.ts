import { Router, Request, Response } from "express";
import { queryOne, query } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

// GET /api/configuracoes  (público — sem senha e dados sensíveis)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await queryOne(
      `SELECT nome_site, nome_completo, descricao_site, logo_url, favicon_url,
              cor_primaria, cor_secundaria, cor_destaque, fonte_principal,
              email_contato, telefone_principal, telefone_whatsapp,
              endereco_logradouro, endereco_cidade, endereco_estado, endereco_cep,
              horario_atendimento, facebook_url, instagram_url, youtube_url,
              linkedin_url, twitter_url, rodape_texto, meta_titulo, meta_descricao,
              meta_keywords, modo_manutencao
       FROM configuracoes_site WHERE id = 1`
    );
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

    // Campos permitidos
    const permitidos = [
      "nome_site","nome_completo","descricao_site","logo_url","favicon_url",
      "cor_primaria","cor_secundaria","cor_destaque","fonte_principal",
      "email_contato","telefone_principal","telefone_whatsapp",
      "endereco_logradouro","endereco_cidade","endereco_estado","endereco_cep",
      "horario_atendimento","facebook_url","instagram_url","youtube_url",
      "linkedin_url","twitter_url","rodape_texto","meta_titulo","meta_descricao",
      "meta_keywords","modo_manutencao",
    ];

    const sets: string[]   = [];
    const vals: unknown[]  = [];

    Object.entries(campos).forEach(([col, val]) => {
      if (permitidos.includes(col)) {
        vals.push(val);
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
      const atualizado = await queryOne(
        `UPDATE configuracoes_site SET ${sets.join(", ")}, atualizado_em = NOW() WHERE id = $${vals.length} RETURNING *`,
        vals
      );
      res.json({ sucesso: true, dados: atualizado });
    } catch {
      res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar configurações." });
    }
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
