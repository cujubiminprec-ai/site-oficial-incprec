-- ============================================================
-- MIGRATION 002 — Tabela TransparencyPanel
-- ============================================================

CREATE TABLE IF NOT EXISTS transparency_panel (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT NOT NULL,
    description    TEXT,
    fileUrl        TEXT,
    fileName       TEXT,
    fileType       TEXT,
    mimeType       TEXT,
    slideImages    TEXT DEFAULT '[]',
    "order"        INTEGER NOT NULL DEFAULT 0,
    isActive       INTEGER NOT NULL DEFAULT 1,
    createdAt      TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed dos 6 painéis institucionais obrigatórios
INSERT OR IGNORE INTO transparency_panel (id, title, description, "order", isActive) VALUES
(1, 'Avaliação Atuarial 2026', 'Relatório completo de Avaliação Atuarial do ano de 2026.', 1, 1),
(2, 'Relatório Financeiro Fevereiro/2026', 'Relatório Financeiro referente a Fevereiro/2026.', 2, 1),
(3, 'Relatório de Investimentos Anual 2025', 'Relatório Anual consolidado de Investimentos de 2025.', 3, 1),
(4, 'Relatório Investimentos 3º Trimestre 2025', 'Relatório de Investimentos referente ao 3º Trimestre de 2025.', 4, 1),
(5, 'Demonstrativo de Aplicações 2025', 'Demonstrativo das Aplicações Financeiras e Recursos Previdenciários de 2025.', 5, 1),
(6, 'Balanço Anual 2024', 'Balanço Patrimonial e Financeiro Anual consolidado de 2024.', 6, 1);
