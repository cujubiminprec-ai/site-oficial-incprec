CREATE TABLE IF NOT EXISTS app_config (
    chave         TEXT PRIMARY KEY,
    valor         TEXT,
    tipo          TEXT NOT NULL DEFAULT 'string',
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
