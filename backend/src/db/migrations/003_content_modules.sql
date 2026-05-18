-- Campos adicionais para migrar os Slides da Home do localStorage para SQLite.
-- Esta migration preserva a tabela existente e adiciona somente o que o painel usa.

ALTER TABLE slides ADD COLUMN tag TEXT;
ALTER TABLE slides ADD COLUMN cta_type TEXT DEFAULT 'link';
ALTER TABLE slides ADD COLUMN pdf_url TEXT;
ALTER TABLE slides ADD COLUMN pdf_name TEXT;
ALTER TABLE slides ADD COLUMN use_tint INTEGER NOT NULL DEFAULT 0;
ALTER TABLE slides ADD COLUMN show_content INTEGER NOT NULL DEFAULT 0;
