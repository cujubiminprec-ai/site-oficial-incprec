-- ============================================================
-- MIGRATION 001 — Usuários, Configurações do Site, Auditoria
-- Banco: PostgreSQL
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: usuarios_admin
-- Usuários do painel administrativo
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    senha_hash    TEXT NOT NULL,                        -- bcrypt hash, NUNCA texto puro
    nivel_acesso  VARCHAR(20) NOT NULL DEFAULT 'operador'
                    CHECK (nivel_acesso IN ('superadmin', 'admin', 'operador')),
    permissoes    TEXT[] NOT NULL DEFAULT '{}',         -- array de módulos permitidos
    avatar_url    TEXT,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    descricao     TEXT,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acesso TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email  ON usuarios_admin (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_nivel  ON usuarios_admin (nivel_acesso);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_ativo  ON usuarios_admin (ativo);

COMMENT ON TABLE  usuarios_admin               IS 'Usuários com acesso ao painel administrativo';
COMMENT ON COLUMN usuarios_admin.nivel_acesso  IS 'superadmin = acesso total | admin = quase total | operador = módulos específicos';
COMMENT ON COLUMN usuarios_admin.permissoes    IS 'Array de chaves de módulos: dashboard, noticias, eventos, etc.';
COMMENT ON COLUMN usuarios_admin.senha_hash    IS 'Hash bcrypt — nunca armazene senha em texto puro';

-- ============================================================
-- TABELA: sessoes_admin
-- Sessões/tokens de autenticação
-- ============================================================
CREATE TABLE IF NOT EXISTS sessoes_admin (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id    UUID NOT NULL REFERENCES usuarios_admin(id) ON DELETE CASCADE,
    token         TEXT NOT NULL UNIQUE,
    ip_origem     VARCHAR(45),
    user_agent    TEXT,
    expira_em     TIMESTAMPTZ NOT NULL,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessoes_token      ON sessoes_admin (token);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes_admin (usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira_em  ON sessoes_admin (expira_em);

-- ============================================================
-- TABELA: configuracoes_site
-- Configurações gerais do site (cores, nome, contato, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_site (
    id                  SERIAL PRIMARY KEY,
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
    modo_manutencao     BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE configuracoes_site IS 'Configurações globais do site — deve ter apenas 1 registro (id=1)';

-- ============================================================
-- TABELA: banner_aviso
-- Banner de aviso/informação no topo do site
-- ============================================================
CREATE TABLE IF NOT EXISTS banner_aviso (
    id          SERIAL PRIMARY KEY,
    texto       TEXT NOT NULL,
    link_url    TEXT,
    link_label  VARCHAR(100),
    cor_fundo   VARCHAR(20) DEFAULT '#1a3a5c',
    cor_texto   VARCHAR(20) DEFAULT '#ffffff',
    ativo       BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: botoes_flutuantes
-- Botões de ação flutuantes (WhatsApp, telefone, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS botoes_flutuantes (
    id          SERIAL PRIMARY KEY,
    label       VARCHAR(100) NOT NULL,
    icone       VARCHAR(100) NOT NULL,
    url         TEXT NOT NULL,
    cor_fundo   VARCHAR(20) DEFAULT '#25D366',
    cor_texto   VARCHAR(20) DEFAULT '#ffffff',
    posicao     INTEGER NOT NULL DEFAULT 0,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    novo_tab    BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: auditoria
-- Log de todas as ações realizadas no painel administrativo
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      UUID REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    usuario_nome    VARCHAR(150),
    usuario_email   VARCHAR(200),
    acao            VARCHAR(100) NOT NULL,   -- ex: 'criar', 'editar', 'excluir', 'login'
    modulo          VARCHAR(100) NOT NULL,   -- ex: 'noticias', 'usuarios', 'configuracoes'
    descricao       TEXT,
    dados_anteriores JSONB,                  -- estado antes da mudança
    dados_novos      JSONB,                  -- estado após a mudança
    ip_origem       VARCHAR(45),
    user_agent      TEXT,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo     ON auditoria (modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao       ON auditoria (acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em  ON auditoria (criado_em DESC);

COMMENT ON TABLE  auditoria              IS 'Registro imutável de todas as ações do painel administrativo';
COMMENT ON COLUMN auditoria.dados_anteriores IS 'Snapshot JSON do registro antes da alteração';
COMMENT ON COLUMN auditoria.dados_novos      IS 'Snapshot JSON do registro após a alteração';

-- ============================================================
-- TABELA: notificacoes_admin
-- Notificações internas do painel
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes_admin (
    id          BIGSERIAL PRIMARY KEY,
    titulo      VARCHAR(200) NOT NULL,
    mensagem    TEXT NOT NULL,
    tipo        VARCHAR(20) NOT NULL DEFAULT 'info'
                  CHECK (tipo IN ('info', 'sucesso', 'aviso', 'erro')),
    lida        BOOLEAN NOT NULL DEFAULT FALSE,
    link_url    TEXT,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes_admin (lida);

-- ============================================================
-- FUNÇÃO: atualizar_timestamp
-- Atualiza automaticamente o campo atualizado_em
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas com atualizado_em
CREATE TRIGGER trg_usuarios_admin_ts
    BEFORE UPDATE ON usuarios_admin
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_configuracoes_site_ts
    BEFORE UPDATE ON configuracoes_site
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_banner_aviso_ts
    BEFORE UPDATE ON banner_aviso
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
