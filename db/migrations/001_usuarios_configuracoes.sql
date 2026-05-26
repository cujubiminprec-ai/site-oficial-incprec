-- ============================================================
-- MIGRATION 001 — Usuários, Configurações do Site, Auditoria
-- Banco: MySQL
-- ============================================================

-- ============================================================
-- TABELA: usuarios_admin
-- Usuários do painel administrativo
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id            VARCHAR(36) PRIMARY KEY,
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    senha_hash    TEXT NOT NULL,
    nivel_acesso  VARCHAR(20) NOT NULL DEFAULT 'operador'
                    CHECK (nivel_acesso IN ('superadmin', 'admin', 'operador')),
    permissoes    JSON NOT NULL DEFAULT '[]',
    avatar_url    TEXT,
    ativo         TINYINT(1) NOT NULL DEFAULT 1,
    descricao     TEXT,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices
CREATE INDEX idx_usuarios_admin_email  ON usuarios_admin (email);
CREATE INDEX idx_usuarios_admin_nivel  ON usuarios_admin (nivel_acesso);
CREATE INDEX idx_usuarios_admin_ativo  ON usuarios_admin (ativo);

-- ============================================================
-- TABELA: sessoes_admin
-- Sessões/tokens de autenticação
-- ============================================================
CREATE TABLE IF NOT EXISTS sessoes_admin (
    id            VARCHAR(36) PRIMARY KEY,
    usuario_id    VARCHAR(36) NOT NULL,
    token         TEXT NOT NULL UNIQUE,
    ip_origem     VARCHAR(45),
    user_agent    TEXT,
    expira_em     DATETIME NOT NULL,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios_admin(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sessoes_token      ON sessoes_admin (token);
CREATE INDEX idx_sessoes_usuario_id ON sessoes_admin (usuario_id);
CREATE INDEX idx_sessoes_expira_em  ON sessoes_admin (expira_em);

-- ============================================================
-- TABELA: configuracoes_site
-- Configurações gerais do site (cores, nome, contato, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_site (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    nome_site           VARCHAR(200) NOT NULL DEFAULT 'INPREC',
    nome_completo       TEXT,
    descricao_site      TEXT,
    logo_url            TEXT,
    favicon_url         TEXT,
    cor_primaria        VARCHAR(20) NOT NULL DEFAULT '#1a3a5c',
    cor_secundaria      VARCHAR(20) NOT NULL DEFAULT '#c8a951',
    cor_destaque        VARCHAR(20) NOT NULL DEFAULT '#e55f1c',
    fonte_principal     VARCHAR(100) DEFAULT 'Inter',
    email_contato       VARCHAR(200),
    telefone_principal  VARCHAR(30),
    telefone_whatsapp   VARCHAR(30),
    endereco_logradouro TEXT,
    endereco_cidade     VARCHAR(100),
    endereco_estado     VARCHAR(2),
    endereco_cep        VARCHAR(10),
    horario_atendimento TEXT,
    facebook_url        TEXT,
    instagram_url       TEXT,
    youtube_url         TEXT,
    linkedin_url        TEXT,
    twitter_url         TEXT,
    google_analytics_id VARCHAR(50),
    rodape_texto        TEXT,
    meta_titulo         VARCHAR(200),
    meta_descricao      TEXT,
    meta_keywords       TEXT,
    modo_manutencao     TINYINT(1) NOT NULL DEFAULT 0,
    criado_em           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: banner_aviso
-- Banner de aviso/informação no topo do site
-- ============================================================
CREATE TABLE IF NOT EXISTS banner_aviso (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    texto       TEXT NOT NULL,
    link_url    TEXT,
    link_label  VARCHAR(100),
    cor_fundo   VARCHAR(20) DEFAULT '#1a3a5c',
    cor_texto   VARCHAR(20) DEFAULT '#ffffff',
    ativo       TINYINT(1) NOT NULL DEFAULT 0,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: botoes_flutuantes
-- Botões de ação flutuantes (WhatsApp, telefone, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS botoes_flutuantes (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    label       VARCHAR(100) NOT NULL,
    icone       VARCHAR(100) NOT NULL,
    url         TEXT NOT NULL,
    cor_fundo   VARCHAR(20) DEFAULT '#25D366',
    cor_texto   VARCHAR(20) DEFAULT '#ffffff',
    posicao     INT NOT NULL DEFAULT 0,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    novo_tab    TINYINT(1) NOT NULL DEFAULT 0,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: auditoria
-- Log de todas as ações realizadas no painel administrativo
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id      VARCHAR(36),
    usuario_nome    VARCHAR(150),
    usuario_email   VARCHAR(200),
    acao            VARCHAR(100) NOT NULL,
    modulo          VARCHAR(100) NOT NULL,
    descricao       TEXT,
    dados_anteriores JSON,
    dados_novos      JSON,
    ip_origem       VARCHAR(45),
    user_agent      TEXT,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios_admin(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_auditoria_usuario_id ON auditoria (usuario_id);
CREATE INDEX idx_auditoria_modulo     ON auditoria (modulo);
CREATE INDEX idx_auditoria_acao       ON auditoria (acao);
CREATE INDEX idx_auditoria_criado_em  ON auditoria (criado_em DESC);

-- ============================================================
-- TABELA: notificacoes_admin
-- Notificações internas do painel
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes_admin (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    titulo      VARCHAR(200) NOT NULL,
    mensagem    TEXT NOT NULL,
    tipo        VARCHAR(20) NOT NULL DEFAULT 'info'
                  CHECK (tipo IN ('info', 'sucesso', 'aviso', 'erro')),
    lida        TINYINT(1) NOT NULL DEFAULT 0,
    link_url    TEXT,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notificacoes_lida ON notificacoes_admin (lida);
