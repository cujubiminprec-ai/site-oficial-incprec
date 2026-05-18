import { Router, Request, Response } from "express";
import { db } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

type SlidePayload = {
  id?: number;
  tag?: string;
  titulo?: string;
  subtitulo?: string;
  cta_label?: string;
  cta_url?: string;
  cta_type?: "link" | "pdf" | "ppt" | "none";
  pdf_url?: string;
  pdf_name?: string;
  image_url?: string;
  ativo?: boolean;
  ordem?: number;
  use_tint?: boolean;
  show_content?: boolean;
};

type FaqPayload = {
  id?: number;
  categoria?: string;
  pergunta?: string;
  resposta?: string;
  ativo?: boolean;
  ordem?: number;
};

type CursoPayload = Record<string, unknown> & {
  id?: number;
  titulo?: string;
  tipo?: "curso" | "capacitacao";
  categoria?: string;
  status?: "aberto" | "em-breve" | "encerrado" | "rascunho";
  data?: string;
  dataFim?: string;
  hora?: string;
  local?: string;
  descricao?: string;
  conteudoProgramatico?: string;
  palestrante?: string;
  cargaHoraria?: string;
  certificado?: boolean;
  vagasIlimitadas?: boolean;
  vagas?: number;
  vagasRestantes?: number;
  online?: boolean;
  linkOnline?: string;
  bannerUrl?: string;
  pdfUrl?: string;
  imagem?: string;
  publicado?: boolean;
  destaque?: boolean;
  criado?: string;
};

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function slideRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    tag: String(row.tag || ""),
    titulo: String(row.titulo || ""),
    subtitulo: String(row.subtitulo || ""),
    cta_label: String(row.cta_label || ""),
    cta_url: String(row.cta_url || "/"),
    cta_type: String(row.cta_type || (row.pdf_url ? "pdf" : "link")),
    pdf_url: String(row.pdf_url || ""),
    pdf_name: String(row.pdf_name || ""),
    image_url: String(row.image_url || ""),
    ativo: bool(row.ativo),
    ordem: Number(row.posicao || 0),
    use_tint: bool(row.use_tint),
    show_content: bool(row.show_content),
  };
}

function faqRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    categoria: String(row.categoria || "Geral"),
    pergunta: String(row.pergunta || ""),
    resposta: String(row.resposta || ""),
    ativo: bool(row.ativo),
    ordem: Number(row.posicao || 0),
  };
}

function cursoRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    titulo: String(row.titulo || ""),
    tipo: String(row.tipo || "curso"),
    categoria: String(row.categoria || ""),
    status: String(row.status || "em-breve"),
    data: String(row.data_inicio || ""),
    dataFim: String(row.data_fim || ""),
    hora: String(row.hora || ""),
    local: String(row.local || ""),
    descricao: String(row.descricao || ""),
    conteudoProgramatico: String(row.conteudo_programatico || ""),
    palestrante: String(row.palestrante || ""),
    cargaHoraria: String(row.carga_horaria || ""),
    certificado: bool(row.certificado),
    vagasIlimitadas: bool(row.vagas_ilimitadas),
    vagas: Number(row.vagas || 0),
    vagasRestantes: Number(row.vagas_restantes || 0),
    online: bool(row.online),
    linkOnline: String(row.link_online || ""),
    bannerUrl: String(row.banner_url || ""),
    pdfUrl: String(row.pdf_url || ""),
    imagem: String(row.imagem_url || ""),
    publicado: bool(row.publicado),
    destaque: bool(row.destaque),
    criado: String(row.criado_em || ""),
  };
}

router.get("/slides", (_req: Request, res: Response): void => {
  const rows = db.prepare("SELECT * FROM slides WHERE ativo = 1 ORDER BY posicao ASC, id ASC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(slideRow) });
});

router.get("/slides/admin", autenticar, exigirPermissao("slides"), (_req: AuthRequest, res: Response): void => {
  const rows = db.prepare("SELECT * FROM slides ORDER BY posicao ASC, id ASC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(slideRow) });
});

router.put("/slides/bulk", autenticar, exigirPermissao("slides"), auditoria("atualizar", "slides"), (req: AuthRequest, res: Response): void => {
  const slides = Array.isArray(req.body?.slides) ? (req.body.slides as SlidePayload[]) : [];
  const salvar = db.transaction((items: SlidePayload[]) => {
    db.prepare("DELETE FROM slides").run();
    const stmt = db.prepare(`
      INSERT INTO slides
        (titulo, subtitulo, image_url, cta_label, cta_url, posicao, ativo, tag, cta_type, pdf_url, pdf_name, use_tint, show_content)
      VALUES
        (@titulo, @subtitulo, @image_url, @cta_label, @cta_url, @posicao, @ativo, @tag, @cta_type, @pdf_url, @pdf_name, @use_tint, @show_content)
    `);
    items.forEach((s, index) => {
      stmt.run({
        titulo: s.titulo || `Slide ${index + 1}`,
        subtitulo: s.subtitulo || "",
        image_url: s.image_url || "",
        cta_label: s.cta_label || "",
        cta_url: s.cta_url || "/",
        posicao: Number(s.ordem || index + 1),
        ativo: s.ativo === false ? 0 : 1,
        tag: s.tag || "",
        cta_type: s.cta_type || (s.pdf_url ? "pdf" : "link"),
        pdf_url: s.pdf_url || "",
        pdf_name: s.pdf_name || "",
        use_tint: s.use_tint ? 1 : 0,
        show_content: s.show_content ? 1 : 0,
      });
    });
  });
  salvar(slides);
  const rows = db.prepare("SELECT * FROM slides ORDER BY posicao ASC, id ASC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(slideRow) });
});

router.get("/faq", (_req: Request, res: Response): void => {
  const rows = db.prepare("SELECT * FROM faq WHERE ativo = 1 ORDER BY posicao ASC, id ASC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(faqRow) });
});

router.get("/faq/admin", autenticar, exigirPermissao("faq"), (_req: AuthRequest, res: Response): void => {
  const rows = db.prepare("SELECT * FROM faq ORDER BY posicao ASC, id ASC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(faqRow) });
});

router.put("/faq/bulk", autenticar, exigirPermissao("faq"), auditoria("atualizar", "faq"), (req: AuthRequest, res: Response): void => {
  const faqs = Array.isArray(req.body?.faqs) ? (req.body.faqs as FaqPayload[]) : [];
  const salvar = db.transaction((items: FaqPayload[]) => {
    db.prepare("DELETE FROM faq").run();
    const stmt = db.prepare(`
      INSERT INTO faq (pergunta, resposta, categoria, posicao, ativo)
      VALUES (@pergunta, @resposta, @categoria, @posicao, @ativo)
    `);
    items.forEach((f, index) => {
      stmt.run({
        pergunta: f.pergunta || "",
        resposta: f.resposta || "",
        categoria: f.categoria || "Geral",
        posicao: Number(f.ordem || index + 1),
        ativo: f.ativo === false ? 0 : 1,
      });
    });
  });
  salvar(faqs);
  const rows = db.prepare("SELECT * FROM faq ORDER BY posicao ASC, id ASC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(faqRow) });
});

router.get("/cursos", (_req: Request, res: Response): void => {
  const rows = db.prepare("SELECT * FROM cursos WHERE publicado = 1 ORDER BY data_inicio DESC, id DESC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(cursoRow) });
});

router.get("/cursos/admin", autenticar, exigirPermissao("cursos"), (_req: AuthRequest, res: Response): void => {
  const rows = db.prepare("SELECT * FROM cursos ORDER BY data_inicio DESC, id DESC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(cursoRow) });
});

router.put("/cursos/bulk", autenticar, exigirPermissao("cursos"), auditoria("atualizar", "cursos"), (req: AuthRequest, res: Response): void => {
  const cursos = Array.isArray(req.body?.cursos) ? (req.body.cursos as CursoPayload[]) : [];
  const salvar = db.transaction((items: CursoPayload[]) => {
    db.prepare("DELETE FROM cursos").run();
    const stmt = db.prepare(`
      INSERT INTO cursos
        (titulo, tipo, categoria, status, data_inicio, data_fim, hora, local, descricao, conteudo_programatico,
         palestrante, carga_horaria, certificado, vagas_ilimitadas, vagas, vagas_restantes, online, link_online,
         banner_url, pdf_url, imagem_url, publicado, destaque, criado_em)
      VALUES
        (@titulo, @tipo, @categoria, @status, @data_inicio, @data_fim, @hora, @local, @descricao, @conteudo_programatico,
         @palestrante, @carga_horaria, @certificado, @vagas_ilimitadas, @vagas, @vagas_restantes, @online, @link_online,
         @banner_url, @pdf_url, @imagem_url, @publicado, @destaque, @criado_em)
    `);
    items.forEach((c) => {
      stmt.run({
        titulo: c.titulo || "Curso sem titulo",
        tipo: c.tipo || "curso",
        categoria: c.categoria || "",
        status: c.status || "em-breve",
        data_inicio: c.data || new Date().toISOString().slice(0, 10),
        data_fim: c.dataFim || null,
        hora: c.hora || "",
        local: c.local || "",
        descricao: c.descricao || "",
        conteudo_programatico: c.conteudoProgramatico || "",
        palestrante: c.palestrante || "",
        carga_horaria: c.cargaHoraria || "",
        certificado: c.certificado ? 1 : 0,
        vagas_ilimitadas: c.vagasIlimitadas ? 1 : 0,
        vagas: Number(c.vagas || 0),
        vagas_restantes: Number(c.vagasRestantes || 0),
        online: c.online ? 1 : 0,
        link_online: c.linkOnline || "",
        banner_url: c.bannerUrl || "",
        pdf_url: c.pdfUrl || "",
        imagem_url: c.imagem || "",
        publicado: c.publicado === false ? 0 : 1,
        destaque: c.destaque ? 1 : 0,
        criado_em: c.criado || new Date().toISOString().slice(0, 10),
      });
    });
  });
  salvar(cursos);
  const rows = db.prepare("SELECT * FROM cursos ORDER BY data_inicio DESC, id DESC").all() as Record<string, unknown>[];
  res.json({ sucesso: true, dados: rows.map(cursoRow) });
});

export default router;
