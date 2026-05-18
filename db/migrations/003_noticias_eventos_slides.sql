-- ============================================================
-- MIGRATION 003 — Notícias, Eventos, Slides da Home
-- ============================================================

-- ============================================================
-- TABELA: noticias
-- ============================================================
CREATE TABLE IF NOT EXISTS noticias (
    id              BIGSERIAL PRIMARY KEY,
    titulo          VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) UNIQUE,          -- URL amigável
    resumo          TEXT,
    conteudo        TEXT,                          -- HTML ou texto rico
    image_url       TEXT,
    image_alt       VARCHAR(300),
    categoria       VARCHAR(100),
    autor           VARCHAR(200),
    destaque        BOOLEAN NOT NULL DEFAULT FALSE,
    publicado       BOOLEAN NOT NULL DEFAULT FALSE,
    publicado_em    TIMESTAMPTZ,
    visualizacoes   INTEGER NOT NULL DEFAULT 0,
    tags            TEXT[],
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noticias_slug        ON noticias (slug);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria   ON noticias (categoria);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado   ON noticias (publicado);
CREATE INDEX IF NOT EXISTS idx_noticias_destaque    ON noticias (destaque);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado_em ON noticias (publicado_em DESC);

COMMENT ON COLUMN noticias.slug IS 'URL amigável gerada automaticamente a partir do título';

-- ============================================================
-- TABELA: eventos
-- Eventos, audiências, cursos, reuniões
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos (
    id                  BIGSERIAL PRIMARY KEY,
    titulo              VARCHAR(500) NOT NULL,
    tipo                VARCHAR(30) NOT NULL
                          CHECK (tipo IN ('audiencia','evento','reuniao','capacitacao','curso')),
    status              VARCHAR(20) NOT NULL DEFAULT 'em-breve'
                          CHECK (status IN ('aberto','encerrado','em-breve','cancelado')),
    data_inicio         DATE NOT NULL,
    hora_inicio         TIME,
    data_fim            DATE,
    hora_fim            TIME,
    local               TEXT,
    descricao           TEXT,
    imagem_url          TEXT,
    banner_url          TEXT,
    pdf_url             TEXT,
    online              BOOLEAN NOT NULL DEFAULT FALSE,
    link_online         TEXT,
    palestrante         VARCHAR(300),
    categoria           VARCHAR(100),
    carga_horaria       VARCHAR(20),
    certificado         BOOLEAN NOT NULL DEFAULT FALSE,
    vagas_ilimitadas    BOOLEAN NOT NULL DEFAULT FALSE,
    vagas               INTEGER,
    vagas_restantes     INTEGER,
    conteudo_programatico TEXT,
    publicado           BOOLEAN NOT NULL DEFAULT TRUE,
    destaque            BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_tipo       ON eventos (tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_status     ON eventos (status);
CREATE INDEX IF NOT EXISTS idx_eventos_data       ON eventos (data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_publicado  ON eventos (publicado);

-- ============================================================
-- TABELA: eventos_inscritos
-- Inscrições dos servidores em eventos
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos_inscritos (
    id              BIGSERIAL PRIMARY KEY,
    evento_id       BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nome            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14),
    matricula       VARCHAR(50),
    cargo           VARCHAR(200),
    telefone        VARCHAR(30),
    status          VARCHAR(20) NOT NULL DEFAULT 'confirmado'
                      CHECK (status IN ('confirmado','lista-espera','cancelado')),
    presenca        BOOLEAN,
    certificado_emitido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (evento_id, email)
);

CREATE INDEX IF NOT EXISTS idx_inscritos_evento_id ON eventos_inscritos (evento_id);
CREATE INDEX IF NOT EXISTS idx_inscritos_email     ON eventos_inscritos (email);
CREATE INDEX IF NOT EXISTS idx_inscritos_status    ON eventos_inscritos (status);

-- ============================================================
-- TABELA: slides
-- Slides/banners do carrossel da home
-- ============================================================
CREATE TABLE IF NOT EXISTS slides (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(300),
    subtitulo       TEXT,
    descricao       TEXT,
    image_url       TEXT NOT NULL,
    image_alt       VARCHAR(300),
    cta_label       VARCHAR(200),
    cta_url         TEXT,
    cta_label2      VARCHAR(200),
    cta_url2        TEXT,
    posicao         INTEGER NOT NULL DEFAULT 0,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slides_posicao ON slides (posicao);
CREATE INDEX IF NOT EXISTS idx_slides_ativo   ON slides (ativo);

-- Triggers
CREATE TRIGGER trg_noticias_ts
    BEFORE UPDATE ON noticias
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_eventos_ts
    BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_slides_ts
    BEFORE UPDATE ON slides
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
