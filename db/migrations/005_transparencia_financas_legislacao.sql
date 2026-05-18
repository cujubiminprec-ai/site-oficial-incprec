-- ============================================================
-- MIGRATION 005 — Transparência, Finanças e Legislação
-- ============================================================

-- ============================================================
-- TABELA: transparencia_documentos
-- Portal da transparência — documentos públicos
-- ============================================================
CREATE TABLE IF NOT EXISTS transparencia_documentos (
    id          BIGSERIAL PRIMARY KEY,
    titulo      VARCHAR(500) NOT NULL,
    categoria   VARCHAR(100) NOT NULL,    -- Relatórios, Balanços, Contratos, Licitações, etc.
    icone       VARCHAR(100) DEFAULT 'ri-file-text-line',
    ano         INTEGER,
    tipo_arquivo VARCHAR(20) DEFAULT 'PDF',
    tamanho     VARCHAR(30),
    arquivo_url TEXT,
    link_externo TEXT,
    descricao   TEXT,
    destaque    BOOLEAN NOT NULL DEFAULT FALSE,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    publicado_em DATE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transp_docs_categoria ON transparencia_documentos (categoria);
CREATE INDEX IF NOT EXISTS idx_transp_docs_ano       ON transparencia_documentos (ano);
CREATE INDEX IF NOT EXISTS idx_transp_docs_ativo     ON transparencia_documentos (ativo);

-- ============================================================
-- TABELA: financas_documentos
-- Finanças e investimentos — documentos específicos
-- ============================================================
CREATE TABLE IF NOT EXISTS financas_documentos (
    id          BIGSERIAL PRIMARY KEY,
    titulo      VARCHAR(500) NOT NULL,
    secao       VARCHAR(100) NOT NULL,   -- prestacao-contas, avaliacao-atuarial, balancetes, etc.
    ano         INTEGER NOT NULL,
    tipo_arquivo VARCHAR(20) DEFAULT 'PDF',
    tamanho     VARCHAR(30),
    arquivo_url TEXT,
    link_externo TEXT,
    descricao   TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    publicado_em DATE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_docs_secao ON financas_documentos (secao);
CREATE INDEX IF NOT EXISTS idx_fin_docs_ano   ON financas_documentos (ano);

COMMENT ON COLUMN financas_documentos.secao IS
  'prestacao-contas | avaliacao-atuarial | balanco-anual | balancetes | credenciamento | investimentos | relatorio-completo | relatorio-consolidado | politica-investimentos';

-- ============================================================
-- TABELA: painel_transparencia
-- Indicadores/cards exibidos no painel de transparência da home
-- ============================================================
CREATE TABLE IF NOT EXISTS painel_transparencia (
    id          SERIAL PRIMARY KEY,
    titulo      VARCHAR(200) NOT NULL,
    valor       VARCHAR(200) NOT NULL,
    descricao   TEXT,
    icone       VARCHAR(100),
    cor         VARCHAR(20),
    link_url    TEXT,
    posicao     INTEGER NOT NULL DEFAULT 0,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: legislacao
-- Legislação federal, municipal, decretos, portarias
-- ============================================================
CREATE TABLE IF NOT EXISTS legislacao (
    id          BIGSERIAL PRIMARY KEY,
    numero      VARCHAR(200) NOT NULL,
    titulo      VARCHAR(500) NOT NULL,
    descricao   TEXT,
    categoria   VARCHAR(100),
    tipo        VARCHAR(30) NOT NULL
                  CHECK (tipo IN ('Lei Federal','Lei Municipal','Decreto','Resolução','Portaria','Instrução Normativa','Emenda Constitucional')),
    ano         INTEGER,
    publicacao  DATE,
    link_url    TEXT,
    arquivo_url TEXT,
    destaque    BOOLEAN NOT NULL DEFAULT FALSE,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legislacao_tipo      ON legislacao (tipo);
CREATE INDEX IF NOT EXISTS idx_legislacao_categoria ON legislacao (categoria);
CREATE INDEX IF NOT EXISTS idx_legislacao_ano       ON legislacao (ano);
CREATE INDEX IF NOT EXISTS idx_legislacao_destaque  ON legislacao (destaque);

-- Triggers
CREATE TRIGGER trg_transp_docs_ts
    BEFORE UPDATE ON transparencia_documentos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_fin_docs_ts
    BEFORE UPDATE ON financas_documentos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_legislacao_ts
    BEFORE UPDATE ON legislacao
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
