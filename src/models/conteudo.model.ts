import { query, queryOne, runInTransaction } from "../config/database";

export type SlidePayload = {
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

export type FaqPayload = {
  id?: number;
  categoria?: string;
  pergunta?: string;
  resposta?: string;
  ativo?: boolean;
  ordem?: number;
};

export type CursoPayload = Record<string, unknown> & {
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

export type CursoInscricaoPayload = {
  nome?: unknown;
  email?: unknown;
  telefone?: unknown;
  matricula?: unknown;
  cargo?: unknown;
  cpf?: unknown;
};

export function bool(value: unknown): boolean {
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

export const conteudoModel = {
  async listarSlidesPublicos() {
    const rows = (await query("SELECT * FROM slides WHERE ativo = 1 ORDER BY posicao ASC, id ASC")).rows;
    return rows.map(slideRow);
  },

  async listarSlidesAdmin() {
    const rows = (await query("SELECT * FROM slides ORDER BY posicao ASC, id ASC")).rows;
    return rows.map(slideRow);
  },

  async salvarSlides(slides: SlidePayload[]) {
    await runInTransaction(async (connection) => {
      await query("DELETE FROM slides", [], connection);
      for (const [index, s] of slides.entries()) {
        await query(`
        INSERT INTO slides
          (titulo, subtitulo, image_url, cta_label, cta_url, posicao, ativo, tag, cta_type, pdf_url, pdf_name, use_tint, show_content)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [
          s.titulo || `Slide ${index + 1}`,
          s.subtitulo || "",
          s.image_url || "",
          s.cta_label || "",
          s.cta_url || "/",
          Number(s.ordem || index + 1),
          s.ativo === false ? 0 : 1,
          s.tag || "",
          s.cta_type || (s.pdf_url ? "pdf" : "link"),
          s.pdf_url || "",
          s.pdf_name || "",
          s.use_tint ? 1 : 0,
          s.show_content ? 1 : 0,
        ], connection);
      }
    });
    return this.listarSlidesAdmin();
  },

  async listarFaqPublico() {
    const rows = (await query("SELECT * FROM faq WHERE ativo = 1 ORDER BY posicao ASC, id ASC")).rows;
    return rows.map(faqRow);
  },

  async listarFaqAdmin() {
    const rows = (await query("SELECT * FROM faq ORDER BY posicao ASC, id ASC")).rows;
    return rows.map(faqRow);
  },

  async salvarFaq(faqs: FaqPayload[]) {
    await runInTransaction(async (connection) => {
      await query("DELETE FROM faq", [], connection);
      for (const [index, f] of faqs.entries()) {
        await query(`
        INSERT INTO faq (pergunta, resposta, categoria, posicao, ativo)
        VALUES ($1, $2, $3, $4, $5)
      `, [
          f.pergunta || "",
          f.resposta || "",
          f.categoria || "Geral",
          Number(f.ordem || index + 1),
          f.ativo === false ? 0 : 1,
        ], connection);
      }
    });
    return this.listarFaqAdmin();
  },

  async listarCursosPublicos() {
    const rows = (await query("SELECT * FROM cursos WHERE publicado = 1 ORDER BY data_inicio DESC, id DESC")).rows;
    return rows.map(cursoRow);
  },

  async listarCursosAdmin() {
    const rows = (await query("SELECT * FROM cursos ORDER BY data_inicio DESC, id DESC")).rows;
    return rows.map(cursoRow);
  },

  async inscreverCurso(cursoId: string, payload: CursoInscricaoPayload) {
    if (!payload.nome || !payload.email) {
      return { status: 400, erro: "Nome e e-mail são obrigatórios." };
    }

    const curso = await queryOne("SELECT id, vagas_restantes, vagas_ilimitadas FROM cursos WHERE id = $1 AND publicado = 1", [cursoId]) as
      | { id: number; vagas_restantes: number | null; vagas_ilimitadas: number }
      | null;

    if (!curso) return { status: 404, erro: "Curso não encontrado." };
    if (!bool(curso.vagas_ilimitadas) && Number(curso.vagas_restantes || 0) <= 0) {
      return { status: 409, erro: "Não há vagas disponíveis para este curso." };
    }

    const info = await query(`
      INSERT INTO cursos_inscritos (curso_id, nome, email, telefone, matricula, cargo, cpf, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmado')
    `, [
      curso.id,
      String(payload.nome),
      String(payload.email).toLowerCase().trim(),
      payload.telefone ?? null,
      payload.matricula ?? null,
      payload.cargo ?? null,
      payload.cpf ?? null
    ]);

    if (!bool(curso.vagas_ilimitadas)) {
      await query("UPDATE cursos SET vagas_restantes = GREATEST(COALESCE(vagas_restantes, 0) - 1, 0) WHERE id = $1", [curso.id]);
    }

    return queryOne("SELECT * FROM cursos_inscritos WHERE id = $1", [info.insertId]);
  },

  async salvarCursos(cursos: CursoPayload[]) {
    await runInTransaction(async (connection) => {
      await query("DELETE FROM cursos", [], connection);
      for (const c of cursos) {
        await query(`
        INSERT INTO cursos
          (titulo, tipo, categoria, status, data_inicio, data_fim, hora, local, descricao, conteudo_programatico,
           palestrante, carga_horaria, certificado, vagas_ilimitadas, vagas, vagas_restantes, online, link_online,
           banner_url, pdf_url, imagem_url, publicado, destaque, criado_em)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      `, [
          c.titulo || "Curso sem titulo",
          c.tipo || "curso",
          c.categoria || "",
          c.status || "em-breve",
          c.data || new Date().toISOString().slice(0, 10),
          c.dataFim || null,
          c.hora || "",
          c.local || "",
          c.descricao || "",
          c.conteudoProgramatico || "",
          c.palestrante || "",
          c.cargaHoraria || "",
          c.certificado ? 1 : 0,
          c.vagasIlimitadas ? 1 : 0,
          Number(c.vagas || 0),
          Number(c.vagasRestantes || 0),
          c.online ? 1 : 0,
          c.linkOnline || "",
          c.bannerUrl || "",
          c.pdfUrl || "",
          c.imagem || "",
          c.publicado === false ? 0 : 1,
          c.destaque ? 1 : 0,
          c.criado || new Date().toISOString().slice(0, 10),
        ], connection);
      }
    });
    return this.listarCursosAdmin();
  },
};
