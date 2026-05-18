-- ============================================================
-- MIGRATION 006 — Cursos/Capacitações, Eleição/Votação, FAQ
-- ============================================================

-- ============================================================
-- TABELA: cursos
-- Cursos e capacitações (gerenciados separado de eventos)
-- ============================================================
CREATE TABLE IF NOT EXISTS cursos (
    id                  BIGSERIAL PRIMARY KEY,
    titulo              VARCHAR(500) NOT NULL,
    tipo                VARCHAR(20) NOT NULL DEFAULT 'curso'
                          CHECK (tipo IN ('curso','capacitacao')),
    categoria           VARCHAR(100),
    status              VARCHAR(20) NOT NULL DEFAULT 'em-breve'
                          CHECK (status IN ('aberto','em-breve','encerrado','rascunho')),
    data_inicio         DATE NOT NULL,
    data_fim            DATE,
    hora                TIME,
    local               TEXT,
    descricao           TEXT,
    conteudo_programatico TEXT,
    palestrante         VARCHAR(300),
    carga_horaria       VARCHAR(20),
    certificado         BOOLEAN NOT NULL DEFAULT FALSE,
    vagas_ilimitadas    BOOLEAN NOT NULL DEFAULT FALSE,
    vagas               INTEGER,
    vagas_restantes     INTEGER,
    online              BOOLEAN NOT NULL DEFAULT FALSE,
    link_online         TEXT,
    banner_url          TEXT,
    pdf_url             TEXT,
    imagem_url          TEXT,
    publicado           BOOLEAN NOT NULL DEFAULT TRUE,
    destaque            BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cursos_tipo      ON cursos (tipo);
CREATE INDEX IF NOT EXISTS idx_cursos_status    ON cursos (status);
CREATE INDEX IF NOT EXISTS idx_cursos_publicado ON cursos (publicado);

-- ============================================================
-- TABELA: cursos_inscritos
-- Inscrições nos cursos
-- ============================================================
CREATE TABLE IF NOT EXISTS cursos_inscritos (
    id              BIGSERIAL PRIMARY KEY,
    curso_id        BIGINT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
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
    UNIQUE (curso_id, email)
);

-- ============================================================
-- TABELA: eleicao_candidatos
-- Candidatos para eleição dos conselhos
-- ============================================================
CREATE TABLE IF NOT EXISTS eleicao_candidatos (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(200) NOT NULL,
    cargo_candidato VARCHAR(300) NOT NULL,
    conselho        VARCHAR(100),             -- 'fiscal', 'deliberativo', etc.
    foto_url        TEXT,
    bio             TEXT,
    proposta        TEXT,
    numero          INTEGER UNIQUE,
    votos           INTEGER NOT NULL DEFAULT 0,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    eleito          BOOLEAN,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidatos_conselho ON eleicao_candidatos (conselho);

-- ============================================================
-- TABELA: eleicao_configuracao
-- Configurações da eleição (datas, status)
-- ============================================================
CREATE TABLE IF NOT EXISTS eleicao_configuracao (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(300) NOT NULL,
    descricao       TEXT,
    data_inicio     TIMESTAMPTZ,
    data_fim        TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'inativa'
                      CHECK (status IN ('inativa','aberta','encerrada','em-apuracao','concluida')),
    eleitores_aptos INTEGER DEFAULT 0,
    total_votos     INTEGER DEFAULT 0,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: eleicao_votos
-- Registro dos votos (sem identificar o eleitor)
-- ============================================================
CREATE TABLE IF NOT EXISTS eleicao_votos (
    id              BIGSERIAL PRIMARY KEY,
    candidato_id    INTEGER NOT NULL REFERENCES eleicao_candidatos(id),
    eleicao_id      INTEGER NOT NULL REFERENCES eleicao_configuracao(id),
    hash_eleitor    TEXT NOT NULL,     -- hash anônimo do eleitor, sem identificação direta
    ip_origem       VARCHAR(45),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (eleicao_id, hash_eleitor)  -- um voto por eleitor por eleição
);

COMMENT ON COLUMN eleicao_votos.hash_eleitor IS 'Hash SHA-256 anonimizado — garante unicidade sem identificar o eleitor';

-- ============================================================
-- TABELA: faq
-- Perguntas Frequentes
-- ============================================================
CREATE TABLE IF NOT EXISTS faq (
    id          SERIAL PRIMARY KEY,
    pergunta    TEXT NOT NULL,
    resposta    TEXT NOT NULL,
    categoria   VARCHAR(100),
    posicao     INTEGER NOT NULL DEFAULT 0,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_categoria ON faq (categoria);
CREATE INDEX IF NOT EXISTS idx_faq_ativo     ON faq (ativo);

-- ============================================================
-- TABELA: pesquisa_satisfacao
-- Pesquisa de satisfação do servidor
-- ============================================================
CREATE TABLE IF NOT EXISTS pesquisa_satisfacao (
    id          BIGSERIAL PRIMARY KEY,
    nota        INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario  TEXT,
    servico     VARCHAR(100),
    ip_origem   VARCHAR(45),
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pesquisa_nota ON pesquisa_satisfacao (nota);

-- Triggers
CREATE TRIGGER trg_cursos_ts
    BEFORE UPDATE ON cursos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_faq_ts
    BEFORE UPDATE ON faq
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
