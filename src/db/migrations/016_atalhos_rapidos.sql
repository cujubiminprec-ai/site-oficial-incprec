-- Sistema de Atalhos de Acesso Rápido
-- Permite configurar links em múltiplos locais: rodape, inicio, cabecalho

CREATE TABLE IF NOT EXISTS atalhos_rapidos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL,
  descricao   TEXT,
  href        TEXT NOT NULL,
  icone       TEXT DEFAULT 'ri-link-line',
  icone_img   TEXT,
  cor         TEXT DEFAULT '#16a34a',
  locais      TEXT DEFAULT 'rodape',
  externo     INTEGER NOT NULL DEFAULT 0,
  ordem       INTEGER NOT NULL DEFAULT 0,
  ativo       INTEGER NOT NULL DEFAULT 1,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_atalhos_ativo ON atalhos_rapidos (ativo);
CREATE INDEX IF NOT EXISTS idx_atalhos_ordem ON atalhos_rapidos (ordem);

INSERT OR IGNORE INTO atalhos_rapidos (id, label, descricao, href, icone, cor, locais, externo, ordem, ativo)
VALUES
  (1, 'Ouvidoria',          'Canal de manifestações e sugestões', '/ouvidoria',            'ri-speak-line',          '#16a34a', 'rodape,inicio', 0, 1, 1),
  (2, 'Pesquisa',           'Avalie nosso atendimento',           '/pesquisa-satisfacao',  'ri-survey-line',         '#0891B2', 'rodape',        0, 2, 1),
  (3, 'FAQ',                'Perguntas frequentes',               '/perguntas-frequentes', 'ri-question-answer-line','#7C3AED', 'rodape',        0, 3, 1),
  (4, 'Previdência',        'Portal previdenciário',              '/previdencia',          'ri-shield-user-line',    '#059669', 'rodape,inicio', 0, 4, 1);
