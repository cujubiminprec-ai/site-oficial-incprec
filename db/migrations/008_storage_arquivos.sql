-- ============================================================
-- MIGRATION 008 — Storage / Gerenciamento de Arquivos
-- Tabela central para PDFs, fotos, documentos, slides, etc.
-- ============================================================

-- ============================================================
-- TABELA: arquivos
-- Tabela central de todos os arquivos enviados para o servidor
-- Corresponde à pasta public/uploads/ no servidor
-- ============================================================
CREATE TABLE IF NOT EXISTS arquivos (
    id              BIGSERIAL PRIMARY KEY,
    nome_original   VARCHAR(500) NOT NULL,           -- nome original do arquivo
    nome_storage    VARCHAR(500) NOT NULL,           -- nome no servidor (gerado)
    pasta           VARCHAR(100) NOT NULL,           -- fotos | pdfs | slides | noticias | documentos
    caminho         TEXT NOT NULL UNIQUE,            -- /uploads/fotos/gestor-1.jpg
    url_publica     TEXT NOT NULL,                   -- URL completa de acesso
    tipo_mime       VARCHAR(100),                    -- image/jpeg, application/pdf, etc.
    tamanho_bytes   BIGINT,
    largura_px      INTEGER,                         -- apenas para imagens
    altura_px       INTEGER,                         -- apenas para imagens
    alt_text        VARCHAR(300),                    -- texto alternativo (acessibilidade)
    titulo          VARCHAR(300),
    descricao       TEXT,
    hash_md5        VARCHAR(32),                     -- para detectar duplicatas
    enviado_por     UUID REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    entidade        VARCHAR(100),                    -- qual tabela referencia este arquivo
    entidade_id     BIGINT,                          -- id do registro que usa o arquivo
    publico         BOOLEAN NOT NULL DEFAULT TRUE,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arquivos_pasta      ON arquivos (pasta);
CREATE INDEX IF NOT EXISTS idx_arquivos_entidade   ON arquivos (entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_arquivos_enviado_por ON arquivos (enviado_por);
CREATE INDEX IF NOT EXISTS idx_arquivos_ativo      ON arquivos (ativo);
CREATE INDEX IF NOT EXISTS idx_arquivos_hash       ON arquivos (hash_md5);

COMMENT ON TABLE  arquivos              IS 'Registro central de todos os arquivos enviados ao servidor';
COMMENT ON COLUMN arquivos.pasta        IS 'Subpasta em public/uploads/: fotos | pdfs | slides | noticias | documentos';
COMMENT ON COLUMN arquivos.caminho      IS 'Caminho relativo: /uploads/fotos/gestor-1.jpg';
COMMENT ON COLUMN arquivos.url_publica  IS 'URL completa: https://seusite.com/uploads/fotos/gestor-1.jpg';
COMMENT ON COLUMN arquivos.entidade     IS 'Nome da tabela que usa este arquivo: gestores, noticias, eventos, etc.';
COMMENT ON COLUMN arquivos.entidade_id  IS 'ID do registro que referencia este arquivo';

-- ============================================================
-- TABELA: pastas_storage
-- Configuração das pastas de upload permitidas
-- ============================================================
CREATE TABLE IF NOT EXISTS pastas_storage (
    id                  SERIAL PRIMARY KEY,
    nome                VARCHAR(100) NOT NULL UNIQUE,
    caminho_servidor    TEXT NOT NULL,               -- caminho absoluto no servidor
    caminho_publico     TEXT NOT NULL,               -- /uploads/fotos
    tipos_permitidos    TEXT[] NOT NULL DEFAULT '{"image/jpeg","image/png","image/webp"}',
    tamanho_max_mb      INTEGER NOT NULL DEFAULT 10,
    descricao           VARCHAR(300),
    ativo               BOOLEAN NOT NULL DEFAULT TRUE
);

-- Inserir pastas padrão
INSERT INTO pastas_storage (nome, caminho_servidor, caminho_publico, tipos_permitidos, tamanho_max_mb, descricao) VALUES
    ('fotos',       '/var/www/public/uploads/fotos',       '/uploads/fotos',       '{"image/jpeg","image/png","image/webp","image/gif"}', 5,  'Fotos de gestores, equipe e eventos'),
    ('pdfs',        '/var/www/public/uploads/pdfs',        '/uploads/pdfs',        '{"application/pdf"}',                                  50, 'Documentos PDF — relatórios, portarias, certidões'),
    ('slides',      '/var/www/public/uploads/slides',      '/uploads/slides',      '{"image/jpeg","image/png","image/webp"}',               8,  'Imagens do slider da home'),
    ('noticias',    '/var/www/public/uploads/noticias',    '/uploads/noticias',    '{"image/jpeg","image/png","image/webp"}',               8,  'Imagens de notícias e eventos'),
    ('documentos',  '/var/www/public/uploads/documentos',  '/uploads/documentos',  '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}', 50, 'Documentos de transparência e legislação'),
    ('avatares',    '/var/www/public/uploads/avatares',    '/uploads/avatares',    '{"image/jpeg","image/png","image/webp"}',               2,  'Avatares de usuários administradores')
ON CONFLICT (nome) DO NOTHING;

-- ============================================================
-- VIEW: v_arquivos_resumo
-- Resumo dos arquivos por pasta (para dashboard)
-- ============================================================
CREATE OR REPLACE VIEW v_arquivos_resumo AS
SELECT
    pasta,
    COUNT(*)                                    AS total_arquivos,
    SUM(tamanho_bytes)                          AS total_bytes,
    ROUND(SUM(tamanho_bytes) / 1048576.0, 2)   AS total_mb,
    MAX(criado_em)                              AS ultimo_upload
FROM arquivos
WHERE ativo = TRUE
GROUP BY pasta
ORDER BY pasta;

COMMENT ON VIEW v_arquivos_resumo IS 'Resumo de uso do storage por pasta — usado no dashboard administrativo';

-- Trigger
CREATE TRIGGER trg_arquivos_ts
    BEFORE UPDATE ON arquivos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
