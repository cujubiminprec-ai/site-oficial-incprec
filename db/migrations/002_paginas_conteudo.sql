-- ============================================================
-- MIGRATION 002 — Páginas do Site e Blocos de Conteúdo
-- Banco: MySQL
-- ============================================================

-- ============================================================
-- TABELA: paginas
-- Gerenciamento de páginas do site
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    page_id       VARCHAR(100) NOT NULL UNIQUE,
    nome          VARCHAR(200) NOT NULL,
    rota          VARCHAR(200) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'publicada'
                    CHECK (status IN ('publicada', 'rascunho', 'desativada')),
    titulo_seo    VARCHAR(200),
    descricao_seo TEXT,
    keywords_seo  TEXT,
    editavel      TINYINT(1) NOT NULL DEFAULT 1,
    ultima_edicao DATETIME,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_paginas_page_id ON paginas (page_id);
CREATE INDEX idx_paginas_status  ON paginas (status);

-- ============================================================
-- TABELA: paginas_blocos
-- Blocos de conteúdo editáveis de cada página
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas_blocos (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    page_id     VARCHAR(100) NOT NULL,
    bloco_id    VARCHAR(100) NOT NULL,
    tipo        VARCHAR(30) NOT NULL
                  CHECK (tipo IN ('hero','texto','imagem','lista','cta','aviso','divisor','colunas')),
    posicao     INT NOT NULL DEFAULT 0,
    titulo      VARCHAR(300),
    subtitulo   TEXT,
    texto       TEXT,
    image_url   TEXT,
    image_alt   VARCHAR(300),
    cta_label   VARCHAR(200),
    cta_url     TEXT,
    itens       JSON,
    colunas     JSON,
    cor         VARCHAR(20),
    alinhamento VARCHAR(10) DEFAULT 'left'
                  CHECK (alinhamento IN ('left','center','right')),
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_page_bloco (page_id, bloco_id),
    FOREIGN KEY (page_id) REFERENCES paginas(page_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_blocos_page_id  ON paginas_blocos (page_id);
CREATE INDEX idx_blocos_posicao  ON paginas_blocos (page_id, posicao);

-- ============================================================
-- TABELA: menu_navegacao
-- Itens do menu de navegação do site
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_navegacao (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    label       VARCHAR(200) NOT NULL,
    url         TEXT NOT NULL,
    icone       VARCHAR(100),
    parent_id   INT,
    posicao     INT NOT NULL DEFAULT 0,
    novo_tab    TINYINT(1) NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menu_navegacao(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_menu_parent_id ON menu_navegacao (parent_id);
CREATE INDEX idx_menu_posicao   ON menu_navegacao (posicao);
