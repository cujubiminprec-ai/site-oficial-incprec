-- Metadados extras para o gerenciador de páginas e conteúdo.
-- Mantém compatibilidade com a estrutura existente e evita depender de localStorage.

ALTER TABLE paginas ADD COLUMN descricao_interna TEXT;
ALTER TABLE paginas ADD COLUMN menu_local TEXT DEFAULT 'Nenhum (sem menu)';
ALTER TABLE paginas ADD COLUMN sub_menu INTEGER NOT NULL DEFAULT 0;
ALTER TABLE paginas ADD COLUMN icone TEXT DEFAULT 'ri-pages-line';
ALTER TABLE paginas ADD COLUMN modelo TEXT DEFAULT 'informativo';
ALTER TABLE paginas ADD COLUMN ordem INTEGER NOT NULL DEFAULT 0;

UPDATE paginas
SET
  descricao_interna = COALESCE(descricao_interna, descricao_seo, nome),
  menu_local = COALESCE(menu_local, 'Nenhum (sem menu)'),
  sub_menu = COALESCE(sub_menu, 0),
  icone = COALESCE(icone, 'ri-pages-line'),
  modelo = COALESCE(modelo, 'informativo'),
  ordem = CASE
    WHEN ordem IS NULL OR ordem = 0 THEN id
    ELSE ordem
  END;
