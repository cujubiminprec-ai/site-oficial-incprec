-- ============================================================
-- MIGRATION 004 — Serviços, Gestores, Estrutura, Organograma
-- Banco: MySQL
-- ============================================================

-- ============================================================
-- TABELA: servicos
-- Serviços oferecidos pelo INPREC
-- ============================================================
CREATE TABLE IF NOT EXISTS servicos (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    icone       VARCHAR(100) NOT NULL DEFAULT 'ri-service-line',
    titulo      VARCHAR(300) NOT NULL,
    descricao   TEXT,
    link_url    TEXT,
    posicao     INT NOT NULL DEFAULT 0,
    destaque    TINYINT(1) NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_servicos_ativo    ON servicos (ativo);
CREATE INDEX idx_servicos_posicao  ON servicos (posicao);

-- ============================================================
-- TABELA: gestores
-- Gestores, diretores e conselheiros do INPREC
-- ============================================================
CREATE TABLE IF NOT EXISTS gestores (
    id          INT PRIMARY KEY AUTO_INCREMENT,
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
    posicao     INT NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_gestores_grupo  ON gestores (grupo);
CREATE INDEX idx_gestores_ativo  ON gestores (ativo);

-- ============================================================
-- TABELA: gestor_cursos
-- Formação acadêmica e capacitações de cada gestor
-- ============================================================
CREATE TABLE IF NOT EXISTS gestor_cursos (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    gestor_id       INT NOT NULL,
    titulo          VARCHAR(300) NOT NULL,
    instituicao     VARCHAR(300),
    ano             INT,
    carga_horaria   VARCHAR(30),
    tipo            VARCHAR(30)
                      CHECK (tipo IN ('Graduação','Especialização','MBA','Mestrado','Doutorado','Curso','Capacitação')),
    posicao         INT NOT NULL DEFAULT 0,
    FOREIGN KEY (gestor_id) REFERENCES gestores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_gestor_cursos_gestor_id ON gestor_cursos (gestor_id);

-- ============================================================
-- TABELA: gestor_documentos
-- Documentos vinculados a cada gestor (portarias, declarações, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS gestor_documentos (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    gestor_id   INT NOT NULL,
    titulo      VARCHAR(300) NOT NULL,
    tipo        VARCHAR(20) DEFAULT 'PDF',
    tamanho     VARCHAR(30),
    arquivo_url TEXT,
    posicao     INT NOT NULL DEFAULT 0,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gestor_id) REFERENCES gestores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_gestor_docs_gestor_id ON gestor_documentos (gestor_id);

-- ============================================================
-- TABELA: organograma
-- Estrutura hierárquica organizacional
-- ============================================================
CREATE TABLE IF NOT EXISTS organograma (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    cargo       VARCHAR(300) NOT NULL,
    responsavel VARCHAR(200),
    descricao   TEXT,
    nivel       INT NOT NULL DEFAULT 1,
    parent_id   INT,
    cor         VARCHAR(20),
    posicao     INT NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES organograma(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_organograma_parent_id ON organograma (parent_id);
CREATE INDEX idx_organograma_nivel     ON organograma (nivel);

-- ============================================================
-- TABELA: estrutura_cargos
-- Quadro de servidores e cargos
-- ============================================================
CREATE TABLE IF NOT EXISTS estrutura_cargos (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    cargo           VARCHAR(300) NOT NULL,
    nome_servidor   VARCHAR(200),
    secretaria      VARCHAR(200),
    tipo            VARCHAR(20) DEFAULT 'efetivo'
                      CHECK (tipo IN ('efetivo','comissionado','temporario')),
    email           VARCHAR(200),
    telefone        VARCHAR(30),
    ativo           TINYINT(1) NOT NULL DEFAULT 1,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
