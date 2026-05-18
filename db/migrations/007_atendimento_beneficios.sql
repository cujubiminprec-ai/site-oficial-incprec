-- ============================================================
-- MIGRATION 007 — Atendimento ao Servidor: Ouvidoria, LAI,
--                 Contato, Formulários, LGPD + Benefícios
-- ============================================================

-- ============================================================
-- TABELA: ouvidoria_mensagens
-- Manifestações recebidas pela ouvidoria
-- ============================================================
CREATE TABLE IF NOT EXISTS ouvidoria_mensagens (
    id              BIGSERIAL PRIMARY KEY,
    protocolo       VARCHAR(30) UNIQUE,          -- gerado automaticamente
    tipo            VARCHAR(30) NOT NULL
                      CHECK (tipo IN ('reclamacao','denuncia','sugestao','elogio','solicitacao')),
    nome            VARCHAR(200),                -- pode ser anônimo
    email           VARCHAR(200),
    cpf             VARCHAR(14),
    telefone        VARCHAR(30),
    anonimo         BOOLEAN NOT NULL DEFAULT FALSE,
    assunto         VARCHAR(500) NOT NULL,
    mensagem        TEXT NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente','em-analise','respondida','arquivada')),
    resposta        TEXT,
    respondido_em   TIMESTAMPTZ,
    respondido_por  UUID REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    ip_origem       VARCHAR(45),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ouvidoria_protocolo ON ouvidoria_mensagens (protocolo);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_tipo      ON ouvidoria_mensagens (tipo);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_status    ON ouvidoria_mensagens (status);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_criado_em ON ouvidoria_mensagens (criado_em DESC);

COMMENT ON COLUMN ouvidoria_mensagens.protocolo IS 'Código de protocolo gerado no formato OUV-YYYYMMDD-XXXX';

-- ============================================================
-- TABELA: lai_pedidos
-- Pedidos de Acesso à Informação (Lei 12.527/2011)
-- ============================================================
CREATE TABLE IF NOT EXISTS lai_pedidos (
    id              BIGSERIAL PRIMARY KEY,
    protocolo       VARCHAR(30) UNIQUE,
    nome            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14),
    telefone        VARCHAR(30),
    descricao_pedido TEXT NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente','em-analise','respondido','negado','arquivado')),
    resposta        TEXT,
    arquivo_resposta_url TEXT,
    prazo_legal     DATE,                -- prazo de 20 dias corridos
    respondido_em   TIMESTAMPTZ,
    respondido_por  UUID REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    ip_origem       VARCHAR(45),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lai_protocolo  ON lai_pedidos (protocolo);
CREATE INDEX IF NOT EXISTS idx_lai_status     ON lai_pedidos (status);
CREATE INDEX IF NOT EXISTS idx_lai_email      ON lai_pedidos (email);

-- ============================================================
-- TABELA: contato_mensagens
-- Mensagens recebidas pelo formulário de contato
-- ============================================================
CREATE TABLE IF NOT EXISTS contato_mensagens (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    telefone        VARCHAR(30),
    assunto         VARCHAR(500),
    mensagem        TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'nao-lida'
                      CHECK (status IN ('nao-lida','lida','respondida','arquivada')),
    resposta        TEXT,
    respondido_em   TIMESTAMPTZ,
    respondido_por  UUID REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    ip_origem       VARCHAR(45),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contato_status    ON contato_mensagens (status);
CREATE INDEX IF NOT EXISTS idx_contato_criado_em ON contato_mensagens (criado_em DESC);

-- ============================================================
-- TABELA: formularios_configuracao
-- Formulários dinâmicos do site (requerimentos, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS formularios_configuracao (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(200) NOT NULL,
    descricao   TEXT,
    slug        VARCHAR(100) UNIQUE,
    campos      JSONB NOT NULL DEFAULT '[]',  -- definição dos campos do formulário
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: formularios_respostas
-- Respostas submetidas pelos formulários
-- ============================================================
CREATE TABLE IF NOT EXISTS formularios_respostas (
    id              BIGSERIAL PRIMARY KEY,
    formulario_id   INTEGER REFERENCES formularios_configuracao(id) ON DELETE SET NULL,
    formulario_nome VARCHAR(200),
    dados           JSONB NOT NULL,           -- respostas em JSON
    nome_remetente  VARCHAR(200),
    email_remetente VARCHAR(200),
    ip_origem       VARCHAR(45),
    lida            BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_respostas_form_id ON formularios_respostas (formulario_id);
CREATE INDEX IF NOT EXISTS idx_form_respostas_lida    ON formularios_respostas (lida);

-- ============================================================
-- TABELA: lgpd_solicitacoes
-- Solicitações de exercício de direitos LGPD (acesso, exclusão, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS lgpd_solicitacoes (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14),
    tipo_solicitacao VARCHAR(50) NOT NULL
                      CHECK (tipo_solicitacao IN ('acesso','correcao','exclusao','portabilidade','revogacao','informacao')),
    descricao       TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente','em-analise','concluida','negada')),
    resposta        TEXT,
    respondido_em   TIMESTAMPTZ,
    ip_origem       VARCHAR(45),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lgpd_tipo   ON lgpd_solicitacoes (tipo_solicitacao);
CREATE INDEX IF NOT EXISTS idx_lgpd_status ON lgpd_solicitacoes (status);

-- ============================================================
-- TABELA: beneficios
-- Tipos de benefícios previdenciários
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficios (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL UNIQUE,   -- ex: aposentadoria-por-idade
    titulo          VARCHAR(300) NOT NULL,
    descricao_curta TEXT,
    icone           VARCHAR(100),
    image_url       TEXT,
    conteudo        TEXT,                            -- HTML/texto da página do benefício
    requisitos      TEXT[],                          -- lista de requisitos
    documentos      TEXT[],                          -- documentos necessários
    posicao         INTEGER NOT NULL DEFAULT 0,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficios_slug  ON beneficios (slug);
CREATE INDEX IF NOT EXISTS idx_beneficios_ativo ON beneficios (ativo);

-- Triggers
CREATE TRIGGER trg_ouvidoria_ts
    BEFORE UPDATE ON ouvidoria_mensagens
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_lai_ts
    BEFORE UPDATE ON lai_pedidos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_contato_ts
    BEFORE UPDATE ON contato_mensagens
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_beneficios_ts
    BEFORE UPDATE ON beneficios
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Função para gerar protocolo automático
CREATE OR REPLACE FUNCTION gerar_protocolo(prefixo TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN prefixo || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar protocolo da ouvidoria
CREATE OR REPLACE FUNCTION trigger_protocolo_ouvidoria()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.protocolo IS NULL THEN
        NEW.protocolo := gerar_protocolo('OUV');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ouvidoria_protocolo
    BEFORE INSERT ON ouvidoria_mensagens
    FOR EACH ROW EXECUTE FUNCTION trigger_protocolo_ouvidoria();

-- Trigger para gerar protocolo do LAI
CREATE OR REPLACE FUNCTION trigger_protocolo_lai()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.protocolo IS NULL THEN
        NEW.protocolo := gerar_protocolo('LAI');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lai_protocolo
    BEFORE INSERT ON lai_pedidos
    FOR EACH ROW EXECUTE FUNCTION trigger_protocolo_lai();
