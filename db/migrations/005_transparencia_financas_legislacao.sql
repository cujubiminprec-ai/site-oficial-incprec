-- ============================================================
-- MIGRATION 005 — Transparência, Finanças e Legislação
-- ============================================================

-- ============================================================
-- TABELA: transparencia_documentos
-- Portal da transparência — documentos públicos
-- ============================================================
CREATE TABLE IF NOT EXISTS transparencia_documentos (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    titulo      VARCHAR(500) NOT NULL,
    categoria   VARCHAR(100) NOT NULL,    -- Relatórios, Balanços, Contratos, Licitações, etc.
    icone       VARCHAR(100) DEFAULT 'ri-file-text-line',
    ano         INT,
    tipo_arquivo VARCHAR(20) DEFAULT 'PDF',
    tamanho     VARCHAR(30),
    arquivo_url TEXT,
    link_externo TEXT,
    descricao   TEXT,
    destaque    TINYINT(1) NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    publicado_em DATE,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transp_docs_categoria ON transparencia_documentos (categoria);
CREATE INDEX IF NOT EXISTS idx_transp_docs_ano       ON transparencia_documentos (ano);
CREATE INDEX IF NOT EXISTS idx_transp_docs_ativo     ON transparencia_documentos (ativo);

-- ============================================================
-- TABELA: financas_documentos
-- Finanças e investimentos — documentos específicos
-- ============================================================
CREATE TABLE IF NOT EXISTS financas_documentos (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    titulo      VARCHAR(500) NOT NULL,
    secao       VARCHAR(100) NOT NULL,   -- prestacao-contas, avaliacao-atuarial, balancetes, etc.
    ano         INT NOT NULL,
    tipo_arquivo VARCHAR(20) DEFAULT 'PDF',
    tamanho     VARCHAR(30),
    arquivo_url TEXT,
    link_externo TEXT,
    descricao   TEXT,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    publicado_em DATE,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    id          INT PRIMARY KEY AUTO_INCREMENT,
    titulo      VARCHAR(200) NOT NULL,
    valor       VARCHAR(200) NOT NULL,
    descricao   TEXT,
    icone       VARCHAR(100),
    cor         VARCHAR(20),
    link_url    TEXT,
    posicao     INT NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA: legislacao
-- Legislação federal, municipal, decretos, portarias
-- ============================================================
CREATE TABLE IF NOT EXISTS legislacao (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    numero      VARCHAR(200) NOT NULL,
    titulo      VARCHAR(500) NOT NULL,
    descricao   TEXT,
    categoria   VARCHAR(100),
    tipo        VARCHAR(30) NOT NULL
                  CHECK (tipo IN ('Lei Federal','Lei Municipal','Decreto','Resolução','Portaria','Instrução Normativa','Emenda Constitucional')),
    ano         INT,
    publicacao  DATE,
    link_url    TEXT,
    arquivo_url TEXT,
    destaque    TINYINT(1) NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_legislacao_tipo      ON legislacao (tipo);
CREATE INDEX IF NOT EXISTS idx_legislacao_categoria ON legislacao (categoria);
CREATE INDEX IF NOT EXISTS idx_legislacao_ano       ON legislacao (ano);
CREATE INDEX IF NOT EXISTS idx_legislacao_destaque  ON legislacao (destaque);

-- Triggers

    
    


    
    


    
    
