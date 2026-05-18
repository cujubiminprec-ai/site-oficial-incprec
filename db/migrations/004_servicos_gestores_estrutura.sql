-- ============================================================
-- MIGRATION 004 — Serviços, Gestores, Estrutura, Organograma
-- ============================================================

-- ============================================================
-- TABELA: servicos
-- Serviços oferecidos pelo INPREC
-- ============================================================
CREATE TABLE IF NOT EXISTS servicos (
    id          SERIAL PRIMARY KEY,
    icone       VARCHAR(100) NOT NULL DEFAULT 'ri-service-line',
    titulo      VARCHAR(300) NOT NULL,
    descricao   TEXT,
    link_url    TEXT,
    posicao     INTEGER NOT NULL DEFAULT 0,
    destaque    BOOLEAN NOT NULL DEFAULT FALSE,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicos_ativo    ON servicos (ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_posicao  ON servicos (posicao);

-- ============================================================
-- TABELA: gestores
-- Gestores, diretores e conselheiros do INPREC
-- ============================================================
CREATE TABLE IF NOT EXISTS gestores (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(200) NOT NULL,
    cargo       VARCHAR(300) NOT NULL,
    grupo       VARCHAR(30) NOT NULL
                  CHECK (grupo IN ('diretoria','comite','fiscal','deliberativo')),
    foto_url    TEXT,
    email       VARCHAR(200),
    telefone    VARCHAR(30),
    matricula   VARCHAR(50),
    bio         TEXT,
    formacao    VARCHAR(500),
    mandato     VARCHAR(50),
    posicao     INTEGER NOT NULL DEFAULT 0,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gestores_grupo  ON gestores (grupo);
CREATE INDEX IF NOT EXISTS idx_gestores_ativo  ON gestores (ativo);

-- ============================================================
-- TABELA: gestor_cursos
-- Formação acadêmica e capacitações de cada gestor
-- ============================================================
CREATE TABLE IF NOT EXISTS gestor_cursos (
    id              SERIAL PRIMARY KEY,
    gestor_id       INTEGER NOT NULL REFERENCES gestores(id) ON DELETE CASCADE,
    titulo          VARCHAR(300) NOT NULL,
    instituicao     VARCHAR(300),
    ano             INTEGER,
    carga_horaria   VARCHAR(30),
    tipo            VARCHAR(30)
                      CHECK (tipo IN ('Graduação','Especialização','MBA','Mestrado','Doutorado','Curso','Capacitação')),
    posicao         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gestor_cursos_gestor_id ON gestor_cursos (gestor_id);

-- ============================================================
-- TABELA: gestor_documentos
-- Documentos vinculados a cada gestor (portarias, declarações, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS gestor_documentos (
    id          SERIAL PRIMARY KEY,
    gestor_id   INTEGER NOT NULL REFERENCES gestores(id) ON DELETE CASCADE,
    titulo      VARCHAR(300) NOT NULL,
    tipo        VARCHAR(20) DEFAULT 'PDF',
    tamanho     VARCHAR(30),
    arquivo_url TEXT,
    posicao     INTEGER NOT NULL DEFAULT 0,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gestor_docs_gestor_id ON gestor_documentos (gestor_id);

-- ============================================================
-- TABELA: organograma
-- Estrutura hierárquica organizacional
-- ============================================================
CREATE TABLE IF NOT EXISTS organograma (
    id          SERIAL PRIMARY KEY,
    cargo       VARCHAR(300) NOT NULL,
    responsavel VARCHAR(200),
    descricao   TEXT,
    nivel       INTEGER NOT NULL DEFAULT 1,   -- 1 = topo, 2 = segundo nível, etc.
    parent_id   INTEGER REFERENCES organograma(id) ON DELETE SET NULL,
    cor         VARCHAR(20),
    posicao     INTEGER NOT NULL DEFAULT 0,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organograma_parent_id ON organograma (parent_id);
CREATE INDEX IF NOT EXISTS idx_organograma_nivel     ON organograma (nivel);

-- ============================================================
-- TABELA: estrutura_cargos
-- Quadro de servidores e cargos
-- ============================================================
CREATE TABLE IF NOT EXISTS estrutura_cargos (
    id              SERIAL PRIMARY KEY,
    cargo           VARCHAR(300) NOT NULL,
    nome_servidor   VARCHAR(200),
    secretaria      VARCHAR(200),
    tipo            VARCHAR(20) DEFAULT 'efetivo'
                      CHECK (tipo IN ('efetivo','comissionado','temporario')),
    email           VARCHAR(200),
    telefone        VARCHAR(30),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER trg_servicos_ts
    BEFORE UPDATE ON servicos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_gestores_ts
    BEFORE UPDATE ON gestores
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
