CREATE TABLE IF NOT EXISTS chat_conversas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  nome TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  ip_origem TEXT,
  user_agent TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversa_id INTEGER NOT NULL,
  origem TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  usuario_id TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chat_conversas_session ON chat_conversas (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversas_status ON chat_conversas (status);
CREATE INDEX IF NOT EXISTS idx_chat_mensagens_conversa ON chat_mensagens (conversa_id);
