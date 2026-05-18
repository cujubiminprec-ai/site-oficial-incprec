-- ============================================================
-- MIGRATION 002 — Páginas do Site e Blocos de Conteúdo
-- ============================================================

-- ============================================================
-- TABELA: paginas
-- Gerenciamento de páginas do site
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas (
    id            SERIAL PRIMARY KEY,
    page_id       VARCHAR(100) NOT NULL UNIQUE,  -- slug único ex: 'quem-somos', 'servicos'
    nome          VARCHAR(200) NOT NULL,
    rota          VARCHAR(200) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'publicada'
                    CHECK (status IN ('publicada', 'rascunho', 'desativada')),
    titulo_seo    VARCHAR(200),
    descricao_seo TEXT,
    keywords_seo  TEXT,
    editavel      BOOLEAN NOT NULL DEFAULT TRUE,
    ultima_edicao TIMESTAMPTZ,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paginas_page_id ON paginas (page_id);
CREATE INDEX IF NOT EXISTS idx_paginas_status  ON paginas (status);

COMMENT ON TABLE  paginas          IS 'Páginas do site gerenciadas pelo painel admin';
COMMENT ON COLUMN paginas.page_id  IS 'Identificador único/slug da página, usado para vincular blocos de conteúdo';

-- ============================================================
-- TABELA: paginas_blocos
-- Blocos de conteúdo editáveis de cada página (tipo WordPress)
-- Tipos: hero, texto, imagem, lista, cta, aviso, divisor, colunas
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas_blocos (
    id          BIGSERIAL PRIMARY KEY,
    page_id     VARCHAR(100) NOT NULL REFERENCES paginas(page_id) ON DELETE CASCADE,
    bloco_id    VARCHAR(100) NOT NULL,              -- id local do bloco
    tipo        VARCHAR(30) NOT NULL
                  CHECK (tipo IN ('hero','texto','imagem','lista','cta','aviso','divisor','colunas')),
    posicao     INTEGER NOT NULL DEFAULT 0,          -- ordem de exibição
    titulo      VARCHAR(300),
    subtitulo   TEXT,
    texto       TEXT,
    image_url   TEXT,
    image_alt   VARCHAR(300),
    cta_label   VARCHAR(200),
    cta_url     TEXT,
    itens       TEXT[],                              -- lista de itens
    colunas     JSONB,                               -- [{titulo, texto, icone}]
    cor         VARCHAR(20),
    alinhamento VARCHAR(10) DEFAULT 'left'
                  CHECK (alinhamento IN ('left','center','right')),
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (page_id, bloco_id)
);

CREATE INDEX IF NOT EXISTS idx_blocos_page_id  ON paginas_blocos (page_id);
CREATE INDEX IF NOT EXISTS idx_blocos_posicao  ON paginas_blocos (page_id, posicao);

COMMENT ON TABLE  paginas_blocos          IS 'Blocos de conteúdo editáveis de cada página';
COMMENT ON COLUMN paginas_blocos.tipo     IS 'Tipo do bloco: hero, texto, imagem, lista, cta, aviso, divisor, colunas';
COMMENT ON COLUMN paginas_blocos.colunas  IS 'JSON array: [{titulo: str, texto: str, icone: str}]';
COMMENT ON COLUMN paginas_blocos.itens    IS 'Array de strings para bloco tipo lista';

-- ============================================================
-- TABELA: menu_navegacao
-- Itens do menu de navegação do site
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_navegacao (
    id          SERIAL PRIMARY KEY,
    label       VARCHAR(200) NOT NULL,
    url         TEXT NOT NULL,
    icone       VARCHAR(100),
    parent_id   INTEGER REFERENCES menu_navegacao(id) ON DELETE SET NULL,
    posicao     INTEGER NOT NULL DEFAULT 0,
    novo_tab    BOOLEAN NOT NULL DEFAULT FALSE,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_parent_id ON menu_navegacao (parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_posicao   ON menu_navegacao (posicao);

-- Trigger de atualização
CREATE TRIGGER trg_paginas_ts
    BEFORE UPDATE ON paginas
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_paginas_blocos_ts
    BEFORE UPDATE ON paginas_blocos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
