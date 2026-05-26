-- ============================================================
-- MIGRATION 001 — Schema completo MySQL para INPREC
-- ============================================================

-- ============================================================
-- Usuários administradores
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id            TEXT PRIMARY KEY,
    nome          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    senha_hash    TEXT NOT NULL,
    nivel_acesso  TEXT NOT NULL DEFAULT 'operador'
                    CHECK (nivel_acesso IN ('superadmin','admin','operador')),
    permissoes    TEXT NOT NULL DEFAULT '[]',
    avatar_url    TEXT,
    ativo         INTEGER NOT NULL DEFAULT 1,
    descricao     TEXT,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
    ultimo_acesso TEXT
);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON usuarios_admin (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_nivel ON usuarios_admin (nivel_acesso);

-- ============================================================
-- Sessões / tokens de autenticação
-- ============================================================
CREATE TABLE IF NOT EXISTS sessoes_admin (
    id         TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios_admin(id) ON DELETE CASCADE,
    token      TEXT NOT NULL UNIQUE,
    ip_origem  TEXT,
    user_agent TEXT,
    expira_em  TEXT NOT NULL,
    criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessoes_token      ON sessoes_admin (token);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes_admin (usuario_id);

-- ============================================================
-- Configurações do site
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_site (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_site           TEXT NOT NULL DEFAULT 'INPREC',
    nome_completo       TEXT,
    descricao_site      TEXT,
    logo_url            TEXT,
    favicon_url         TEXT,
    cor_primaria        TEXT NOT NULL DEFAULT '#1a3a5c',
    cor_secundaria      TEXT NOT NULL DEFAULT '#c8a951',
    cor_destaque        TEXT NOT NULL DEFAULT '#e55f1c',
    fonte_principal     TEXT DEFAULT 'Inter',
    email_contato       TEXT,
    telefone_principal  TEXT,
    telefone_whatsapp   TEXT,
    endereco_logradouro TEXT,
    endereco_cidade     TEXT,
    endereco_estado     TEXT,
    endereco_cep        TEXT,
    horario_atendimento TEXT,
    facebook_url        TEXT,
    instagram_url       TEXT,
    youtube_url         TEXT,
    linkedin_url        TEXT,
    twitter_url         TEXT,
    google_analytics_id TEXT,
    rodape_texto        TEXT,
    meta_titulo         TEXT,
    meta_descricao      TEXT,
    meta_keywords       TEXT,
    modo_manutencao     INTEGER NOT NULL DEFAULT 0,
    criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Banner de aviso
-- ============================================================
CREATE TABLE IF NOT EXISTS banner_aviso (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    texto         TEXT NOT NULL,
    link_url      TEXT,
    link_label    TEXT,
    cor_fundo     TEXT DEFAULT '#1a3a5c',
    cor_texto     TEXT DEFAULT '#ffffff',
    ativo         INTEGER NOT NULL DEFAULT 0,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Botões flutuantes
-- ============================================================
CREATE TABLE IF NOT EXISTS botoes_flutuantes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    label     TEXT NOT NULL,
    icone     TEXT NOT NULL,
    url       TEXT NOT NULL,
    cor_fundo TEXT DEFAULT '#25D366',
    cor_texto TEXT DEFAULT '#ffffff',
    posicao   INTEGER NOT NULL DEFAULT 0,
    ativo     INTEGER NOT NULL DEFAULT 1,
    novo_tab  INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id       TEXT REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    usuario_nome     TEXT,
    usuario_email    TEXT,
    acao             TEXT NOT NULL,
    modulo           TEXT NOT NULL,
    descricao        TEXT,
    dados_anteriores TEXT,
    dados_novos      TEXT,
    ip_origem        TEXT,
    user_agent       TEXT,
    criado_em        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo     ON auditoria (modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em  ON auditoria (criado_em);

-- ============================================================
-- Notificações admin
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes_admin (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo    TEXT NOT NULL,
    mensagem  TEXT NOT NULL,
    tipo      TEXT NOT NULL DEFAULT 'info'
                CHECK (tipo IN ('info','sucesso','aviso','erro')),
    lida      INTEGER NOT NULL DEFAULT 0,
    link_url  TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes_admin (lida);

-- ============================================================
-- Páginas do site
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id       TEXT NOT NULL UNIQUE,
    nome          TEXT NOT NULL,
    rota          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'publicada'
                    CHECK (status IN ('publicada','rascunho','desativada')),
    titulo_seo    TEXT,
    descricao_seo TEXT,
    keywords_seo  TEXT,
    editavel      INTEGER NOT NULL DEFAULT 1,
    ultima_edicao TEXT,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_paginas_page_id ON paginas (page_id);

-- ============================================================
-- Blocos de conteúdo das páginas
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas_blocos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id     TEXT NOT NULL REFERENCES paginas(page_id) ON DELETE CASCADE,
    bloco_id    TEXT NOT NULL,
    tipo        TEXT NOT NULL
                  CHECK (tipo IN ('hero','texto','imagem','lista','cta','aviso','divisor','colunas')),
    posicao     INTEGER NOT NULL DEFAULT 0,
    titulo      TEXT,
    subtitulo   TEXT,
    texto       TEXT,
    image_url   TEXT,
    image_alt   TEXT,
    cta_label   TEXT,
    cta_url     TEXT,
    itens       TEXT,
    colunas     TEXT,
    cor         TEXT,
    alinhamento TEXT DEFAULT 'left' CHECK (alinhamento IN ('left','center','right')),
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (page_id, bloco_id)
);
CREATE INDEX IF NOT EXISTS idx_blocos_page_id ON paginas_blocos (page_id);

-- ============================================================
-- Menu de navegação
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_navegacao (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    label     TEXT NOT NULL,
    url       TEXT NOT NULL,
    icone     TEXT,
    parent_id INTEGER REFERENCES menu_navegacao(id) ON DELETE SET NULL,
    posicao   INTEGER NOT NULL DEFAULT 0,
    novo_tab  INTEGER NOT NULL DEFAULT 0,
    ativo     INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_menu_parent_id ON menu_navegacao (parent_id);

-- ============================================================
-- Notícias
-- ============================================================
CREATE TABLE IF NOT EXISTS noticias (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo        TEXT NOT NULL,
    slug          TEXT UNIQUE,
    resumo        TEXT,
    conteudo      TEXT,
    image_url     TEXT,
    image_alt     TEXT,
    categoria     TEXT,
    autor         TEXT,
    destaque      INTEGER NOT NULL DEFAULT 0,
    publicado     INTEGER NOT NULL DEFAULT 0,
    publicado_em  TEXT,
    visualizacoes INTEGER NOT NULL DEFAULT 0,
    tags          TEXT NOT NULL DEFAULT '[]',
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_noticias_slug       ON noticias (slug);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado  ON noticias (publicado);
CREATE INDEX IF NOT EXISTS idx_noticias_destaque   ON noticias (destaque);

-- ============================================================
-- Eventos
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo                TEXT NOT NULL,
    tipo                  TEXT NOT NULL CHECK (tipo IN ('audiencia','evento','reuniao','capacitacao','curso')),
    status                TEXT NOT NULL DEFAULT 'em-breve' CHECK (status IN ('aberto','encerrado','em-breve','cancelado')),
    data_inicio           TEXT NOT NULL,
    hora_inicio           TEXT,
    data_fim              TEXT,
    hora_fim              TEXT,
    local                 TEXT,
    descricao             TEXT,
    imagem_url            TEXT,
    banner_url            TEXT,
    pdf_url               TEXT,
    online                INTEGER NOT NULL DEFAULT 0,
    link_online           TEXT,
    palestrante           TEXT,
    categoria             TEXT,
    carga_horaria         TEXT,
    certificado           INTEGER NOT NULL DEFAULT 0,
    vagas_ilimitadas      INTEGER NOT NULL DEFAULT 0,
    vagas                 INTEGER,
    vagas_restantes       INTEGER,
    conteudo_programatico TEXT,
    publicado             INTEGER NOT NULL DEFAULT 1,
    destaque              INTEGER NOT NULL DEFAULT 0,
    criado_em             TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo      ON eventos (tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_status    ON eventos (status);
CREATE INDEX IF NOT EXISTS idx_eventos_data      ON eventos (data_inicio);

-- ============================================================
-- Inscrições em eventos
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos_inscritos (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id           INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nome                TEXT NOT NULL,
    email               TEXT NOT NULL,
    cpf                 TEXT,
    matricula           TEXT,
    cargo               TEXT,
    telefone            TEXT,
    status              TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado','lista-espera','cancelado')),
    presenca            INTEGER,
    certificado_emitido INTEGER NOT NULL DEFAULT 0,
    criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (evento_id, email)
);
CREATE INDEX IF NOT EXISTS idx_inscritos_evento_id ON eventos_inscritos (evento_id);

-- ============================================================
-- Slides do carrossel
-- ============================================================
CREATE TABLE IF NOT EXISTS slides (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo        TEXT,
    subtitulo     TEXT,
    descricao     TEXT,
    image_url     TEXT NOT NULL,
    image_alt     TEXT,
    cta_label     TEXT,
    cta_url       TEXT,
    cta_label2    TEXT,
    cta_url2      TEXT,
    posicao       INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Serviços
-- ============================================================
CREATE TABLE IF NOT EXISTS servicos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    icone         TEXT NOT NULL DEFAULT 'ri-service-line',
    titulo        TEXT NOT NULL,
    descricao     TEXT,
    link_url      TEXT,
    posicao       INTEGER NOT NULL DEFAULT 0,
    destaque      INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Gestores
-- ============================================================
CREATE TABLE IF NOT EXISTS gestores (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL,
    cargo         TEXT NOT NULL,
    grupo         TEXT NOT NULL CHECK (grupo IN ('diretoria','comite','fiscal','deliberativo')),
    foto_url      TEXT,
    email         TEXT,
    telefone      TEXT,
    matricula     TEXT,
    bio           TEXT,
    formacao      TEXT,
    mandato       TEXT,
    posicao       INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gestores_grupo ON gestores (grupo);

-- ============================================================
-- Cursos dos gestores
-- ============================================================
CREATE TABLE IF NOT EXISTS gestor_cursos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    gestor_id     INTEGER NOT NULL REFERENCES gestores(id) ON DELETE CASCADE,
    titulo        TEXT NOT NULL,
    instituicao   TEXT,
    ano           INTEGER,
    carga_horaria TEXT,
    tipo          TEXT CHECK (tipo IN ('Graduação','Especialização','MBA','Mestrado','Doutorado','Curso','Capacitação')),
    posicao       INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- Documentos dos gestores
-- ============================================================
CREATE TABLE IF NOT EXISTS gestor_documentos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    gestor_id   INTEGER NOT NULL REFERENCES gestores(id) ON DELETE CASCADE,
    titulo      TEXT NOT NULL,
    tipo        TEXT DEFAULT 'PDF',
    tamanho     TEXT,
    arquivo_url TEXT,
    posicao     INTEGER NOT NULL DEFAULT 0,
    criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Organograma
-- ============================================================
CREATE TABLE IF NOT EXISTS organograma (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cargo       TEXT NOT NULL,
    responsavel TEXT,
    descricao   TEXT,
    nivel       INTEGER NOT NULL DEFAULT 1,
    parent_id   INTEGER REFERENCES organograma(id) ON DELETE SET NULL,
    cor         TEXT,
    posicao     INTEGER NOT NULL DEFAULT 0,
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Estrutura de cargos
-- ============================================================
CREATE TABLE IF NOT EXISTS estrutura_cargos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    cargo         TEXT NOT NULL,
    nome_servidor TEXT,
    secretaria    TEXT,
    tipo          TEXT DEFAULT 'efetivo' CHECK (tipo IN ('efetivo','comissionado','temporario')),
    email         TEXT,
    telefone      TEXT,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Transparência — documentos
-- ============================================================
CREATE TABLE IF NOT EXISTS transparencia_documentos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo        TEXT NOT NULL,
    categoria     TEXT NOT NULL,
    icone         TEXT DEFAULT 'ri-file-text-line',
    ano           INTEGER,
    tipo_arquivo  TEXT DEFAULT 'PDF',
    tamanho       TEXT,
    arquivo_url   TEXT,
    link_externo  TEXT,
    descricao     TEXT,
    destaque      INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    publicado_em  TEXT,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_transp_docs_categoria ON transparencia_documentos (categoria);

-- ============================================================
-- Finanças — documentos
-- ============================================================
CREATE TABLE IF NOT EXISTS financas_documentos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo        TEXT NOT NULL,
    secao         TEXT NOT NULL,
    ano           INTEGER NOT NULL,
    tipo_arquivo  TEXT DEFAULT 'PDF',
    tamanho       TEXT,
    arquivo_url   TEXT,
    link_externo  TEXT,
    descricao     TEXT,
    ativo         INTEGER NOT NULL DEFAULT 1,
    publicado_em  TEXT,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fin_docs_secao ON financas_documentos (secao);

-- ============================================================
-- Painel de transparência (indicadores)
-- ============================================================
CREATE TABLE IF NOT EXISTS painel_transparencia (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo    TEXT NOT NULL,
    valor     TEXT NOT NULL,
    descricao TEXT,
    icone     TEXT,
    cor       TEXT,
    link_url  TEXT,
    posicao   INTEGER NOT NULL DEFAULT 0,
    ativo     INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Legislação
-- ============================================================
CREATE TABLE IF NOT EXISTS legislacao (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    numero        TEXT NOT NULL,
    titulo        TEXT NOT NULL,
    descricao     TEXT,
    categoria     TEXT,
    tipo          TEXT NOT NULL CHECK (tipo IN ('Lei Federal','Lei Municipal','Decreto','Resolução','Portaria','Instrução Normativa','Emenda Constitucional')),
    ano           INTEGER,
    publicacao    TEXT,
    link_url      TEXT,
    arquivo_url   TEXT,
    destaque      INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_legislacao_tipo ON legislacao (tipo);

-- ============================================================
-- Cursos e capacitações
-- ============================================================
CREATE TABLE IF NOT EXISTS cursos (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo                TEXT NOT NULL,
    tipo                  TEXT NOT NULL DEFAULT 'curso' CHECK (tipo IN ('curso','capacitacao')),
    categoria             TEXT,
    status                TEXT NOT NULL DEFAULT 'em-breve' CHECK (status IN ('aberto','em-breve','encerrado','rascunho')),
    data_inicio           TEXT NOT NULL,
    data_fim              TEXT,
    hora                  TEXT,
    local                 TEXT,
    descricao             TEXT,
    conteudo_programatico TEXT,
    palestrante           TEXT,
    carga_horaria         TEXT,
    certificado           INTEGER NOT NULL DEFAULT 0,
    vagas_ilimitadas      INTEGER NOT NULL DEFAULT 0,
    vagas                 INTEGER,
    vagas_restantes       INTEGER,
    online                INTEGER NOT NULL DEFAULT 0,
    link_online           TEXT,
    banner_url            TEXT,
    pdf_url               TEXT,
    imagem_url            TEXT,
    publicado             INTEGER NOT NULL DEFAULT 1,
    destaque              INTEGER NOT NULL DEFAULT 0,
    criado_em             TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Inscrições em cursos
-- ============================================================
CREATE TABLE IF NOT EXISTS cursos_inscritos (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id            INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    nome                TEXT NOT NULL,
    email               TEXT NOT NULL,
    cpf                 TEXT,
    matricula           TEXT,
    cargo               TEXT,
    telefone            TEXT,
    status              TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado','lista-espera','cancelado')),
    presenca            INTEGER,
    certificado_emitido INTEGER NOT NULL DEFAULT 0,
    criado_em           TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (curso_id, email)
);

-- ============================================================
-- Eleição — candidatos
-- ============================================================
CREATE TABLE IF NOT EXISTS eleicao_candidatos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL,
    cargo_candidato TEXT NOT NULL,
    conselho        TEXT,
    foto_url        TEXT,
    bio             TEXT,
    proposta        TEXT,
    numero          INTEGER UNIQUE,
    votos           INTEGER NOT NULL DEFAULT 0,
    ativo           INTEGER NOT NULL DEFAULT 1,
    eleito          INTEGER,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Eleição — configuração
-- ============================================================
CREATE TABLE IF NOT EXISTS eleicao_configuracao (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo         TEXT NOT NULL,
    descricao      TEXT,
    data_inicio    TEXT,
    data_fim       TEXT,
    status         TEXT NOT NULL DEFAULT 'inativa' CHECK (status IN ('inativa','aberta','encerrada','em-apuracao','concluida')),
    eleitores_aptos INTEGER DEFAULT 0,
    total_votos    INTEGER DEFAULT 0,
    criado_em      TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Eleição — votos
-- ============================================================
CREATE TABLE IF NOT EXISTS eleicao_votos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    candidato_id INTEGER NOT NULL REFERENCES eleicao_candidatos(id),
    eleicao_id   INTEGER NOT NULL REFERENCES eleicao_configuracao(id),
    hash_eleitor TEXT NOT NULL,
    ip_origem    TEXT,
    criado_em    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (eleicao_id, hash_eleitor)
);

-- ============================================================
-- FAQ
-- ============================================================
CREATE TABLE IF NOT EXISTS faq (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    pergunta      TEXT NOT NULL,
    resposta      TEXT NOT NULL,
    categoria     TEXT,
    posicao       INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_faq_categoria ON faq (categoria);

-- ============================================================
-- Pesquisa de satisfação
-- ============================================================
CREATE TABLE IF NOT EXISTS pesquisa_satisfacao (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nota      INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    servico   TEXT,
    ip_origem TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Ouvidoria — manifestações
-- ============================================================
CREATE TABLE IF NOT EXISTS ouvidoria_mensagens (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    protocolo      TEXT UNIQUE,
    tipo           TEXT NOT NULL CHECK (tipo IN ('reclamacao','denuncia','sugestao','elogio','solicitacao')),
    nome           TEXT,
    email          TEXT,
    cpf            TEXT,
    telefone       TEXT,
    anonimo        INTEGER NOT NULL DEFAULT 0,
    assunto        TEXT NOT NULL,
    mensagem       TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em-analise','respondida','arquivada')),
    resposta       TEXT,
    respondido_em  TEXT,
    respondido_por TEXT REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    ip_origem      TEXT,
    criado_em      TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_protocolo ON ouvidoria_mensagens (protocolo);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_status    ON ouvidoria_mensagens (status);

-- ============================================================
-- LAI — pedidos de acesso à informação
-- ============================================================
CREATE TABLE IF NOT EXISTS lai_pedidos (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    protocolo            TEXT UNIQUE,
    nome                 TEXT NOT NULL,
    email                TEXT NOT NULL,
    cpf                  TEXT,
    telefone             TEXT,
    descricao_pedido     TEXT NOT NULL,
    status               TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em-analise','respondido','negado','arquivado')),
    resposta             TEXT,
    arquivo_resposta_url TEXT,
    prazo_legal          TEXT,
    respondido_em        TEXT,
    respondido_por       TEXT REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    ip_origem            TEXT,
    criado_em            TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lai_protocolo ON lai_pedidos (protocolo);
CREATE INDEX IF NOT EXISTS idx_lai_status    ON lai_pedidos (status);

-- ============================================================
-- Contato — mensagens
-- ============================================================
CREATE TABLE IF NOT EXISTS contato_mensagens (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    nome           TEXT NOT NULL,
    email          TEXT NOT NULL,
    telefone       TEXT,
    assunto        TEXT,
    mensagem       TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'nao-lida' CHECK (status IN ('nao-lida','lida','respondida','arquivada')),
    resposta       TEXT,
    respondido_em  TEXT,
    respondido_por TEXT REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    ip_origem      TEXT,
    criado_em      TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Formulários — configuração
-- ============================================================
CREATE TABLE IF NOT EXISTS formularios_configuracao (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL,
    descricao     TEXT,
    slug          TEXT UNIQUE,
    campos        TEXT NOT NULL DEFAULT '[]',
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Formulários — respostas
-- ============================================================
CREATE TABLE IF NOT EXISTS formularios_respostas (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    formulario_id    INTEGER REFERENCES formularios_configuracao(id) ON DELETE SET NULL,
    formulario_nome  TEXT,
    dados            TEXT NOT NULL,
    nome_remetente   TEXT,
    email_remetente  TEXT,
    ip_origem        TEXT,
    lida             INTEGER NOT NULL DEFAULT 0,
    criado_em        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- LGPD — solicitações
-- ============================================================
CREATE TABLE IF NOT EXISTS lgpd_solicitacoes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nome             TEXT NOT NULL,
    email            TEXT NOT NULL,
    cpf              TEXT,
    tipo_solicitacao TEXT NOT NULL CHECK (tipo_solicitacao IN ('acesso','correcao','exclusao','portabilidade','revogacao','informacao')),
    descricao        TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em-analise','concluida','negada')),
    resposta         TEXT,
    respondido_em    TEXT,
    ip_origem        TEXT,
    criado_em        TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Benefícios previdenciários
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT NOT NULL UNIQUE,
    titulo          TEXT NOT NULL,
    descricao_curta TEXT,
    icone           TEXT,
    image_url       TEXT,
    conteudo        TEXT,
    requisitos      TEXT NOT NULL DEFAULT '[]',
    documentos      TEXT NOT NULL DEFAULT '[]',
    posicao         INTEGER NOT NULL DEFAULT 0,
    ativo           INTEGER NOT NULL DEFAULT 1,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_beneficios_slug ON beneficios (slug);

-- ============================================================
-- Arquivos / Storage
-- ============================================================
CREATE TABLE IF NOT EXISTS arquivos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_original TEXT NOT NULL,
    nome_storage  TEXT NOT NULL,
    pasta         TEXT NOT NULL,
    caminho       TEXT NOT NULL UNIQUE,
    url_publica   TEXT NOT NULL,
    tipo_mime     TEXT,
    tamanho_bytes INTEGER,
    largura_px    INTEGER,
    altura_px     INTEGER,
    alt_text      TEXT,
    titulo        TEXT,
    descricao     TEXT,
    hash_md5      TEXT,
    enviado_por   TEXT REFERENCES usuarios_admin(id) ON DELETE SET NULL,
    entidade      TEXT,
    entidade_id   INTEGER,
    publico       INTEGER NOT NULL DEFAULT 1,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_arquivos_pasta    ON arquivos (pasta);
CREATE INDEX IF NOT EXISTS idx_arquivos_entidade ON arquivos (entidade, entidade_id);
