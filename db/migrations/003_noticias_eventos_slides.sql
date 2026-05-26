-- ============================================================
-- MIGRATION 003 — Notícias, Eventos, Slides da Home
-- Banco: MySQL
-- ============================================================

-- ============================================================
-- TABELA: noticias
-- ============================================================
CREATE TABLE IF NOT EXISTS noticias (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    titulo          VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) UNIQUE,
    resumo          TEXT,
    conteudo        TEXT,
    image_url       TEXT,
    image_alt       VARCHAR(300),
    categoria       VARCHAR(100),
    autor           VARCHAR(200),
    destaque        TINYINT(1) NOT NULL DEFAULT 0,
    publicado       TINYINT(1) NOT NULL DEFAULT 0,
    publicado_em    DATETIME,
    visualizacoes   INT NOT NULL DEFAULT 0,
    tags            JSON,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_noticias_slug        ON noticias (slug);
CREATE INDEX idx_noticias_categoria   ON noticias (categoria);
CREATE INDEX idx_noticias_publicado   ON noticias (publicado);
CREATE INDEX idx_noticias_destaque    ON noticias (destaque);
CREATE INDEX idx_noticias_publicado_em ON noticias (publicado_em DESC);

-- ============================================================
-- TABELA: eventos
-- Eventos, audiências, cursos, reuniões
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    online              TINYINT(1) NOT NULL DEFAULT 0,
    link_online         TEXT,
    palestrante         VARCHAR(300),
    categoria           VARCHAR(100),
    carga_horaria       VARCHAR(20),
    certificado         TINYINT(1) NOT NULL DEFAULT 0,
    vagas_ilimitadas    TINYINT(1) NOT NULL DEFAULT 0,
    vagas               INT,
    vagas_restantes     INT,
    conteudo_programatico TEXT,
    publicado           TINYINT(1) NOT NULL DEFAULT 1,
    destaque            TINYINT(1) NOT NULL DEFAULT 0,
    criado_em           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_eventos_tipo       ON eventos (tipo);
CREATE INDEX idx_eventos_status     ON eventos (status);
CREATE INDEX idx_eventos_data       ON eventos (data_inicio);
CREATE INDEX idx_eventos_publicado  ON eventos (publicado);

-- ============================================================
-- TABELA: eventos_inscritos
-- Inscrições dos servidores em eventos
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos_inscritos (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    evento_id       BIGINT NOT NULL,
    nome            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14),
    matricula       VARCHAR(50),
    cargo           VARCHAR(200),
    telefone        VARCHAR(30),
    status          VARCHAR(20) NOT NULL DEFAULT 'confirmado'
                      CHECK (status IN ('confirmado','lista-espera','cancelado')),
    presenca        TINYINT(1),
    certificado_emitido TINYINT(1) NOT NULL DEFAULT 0,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_evento_email (evento_id, email),
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inscritos_evento_id ON eventos_inscritos (evento_id);
CREATE INDEX idx_inscritos_email     ON eventos_inscritos (email);
CREATE INDEX idx_inscritos_status    ON eventos_inscritos (status);

-- ============================================================
-- TABELA: slides
-- Slides/banners do carrossel da home
-- ============================================================
CREATE TABLE IF NOT EXISTS slides (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    titulo          VARCHAR(300),
    subtitulo       TEXT,
    descricao       TEXT,
    image_url       TEXT NOT NULL,
    image_alt       VARCHAR(300),
    cta_label       VARCHAR(200),
    cta_url         TEXT,
    cta_label2      VARCHAR(200),
    cta_url2        TEXT,
    posicao         INT NOT NULL DEFAULT 0,
    ativo           TINYINT(1) NOT NULL DEFAULT 1,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_slides_posicao ON slides (posicao);
CREATE INDEX idx_slides_ativo   ON slides (ativo);
