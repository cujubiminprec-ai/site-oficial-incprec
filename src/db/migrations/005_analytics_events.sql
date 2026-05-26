CREATE TABLE IF NOT EXISTS analytics_eventos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo          TEXT NOT NULL CHECK (tipo IN ('page_view', 'click')),
    path          TEXT NOT NULL,
    page_name     TEXT,
    referrer      TEXT,
    element_label TEXT,
    element_href  TEXT,
    ip_origem     TEXT,
    user_agent    TEXT,
    criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_eventos_tipo ON analytics_eventos (tipo);
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_path ON analytics_eventos (path);
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_criado_em ON analytics_eventos (criado_em);
