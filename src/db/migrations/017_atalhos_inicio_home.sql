-- Popula os atalhos da seção "Acesso Rápido" da home page.
-- Estes itens ficam gerenciáveis pelo Admin > Atalhos de Acesso Rápido.

INSERT OR IGNORE INTO atalhos_rapidos (label, descricao, href, icone, cor, locais, externo, ordem, ativo)
VALUES
  ('Contracheque',   'Acesse seu demonstrativo',      '#contracheque',   'ri-file-text-line',        '#16a34a', 'inicio',       1, 10, 1),
  ('Benefícios',     'Aposentadoria e pensões',        '/servicos',       'ri-shield-user-line',      '#0891B2', 'inicio',       0, 11, 1),
  ('Transparência',  'Portal da transparência',        '/transparencia',  'ri-eye-line',              '#7C3AED', 'inicio',       0, 12, 1),
  ('Formulários',    'Requerimentos e documentos',     '/formularios',    'ri-file-list-3-line',      '#D97706', 'inicio',       0, 13, 1),
  ('Notícias',       'Fique por dentro',               '/noticias',       'ri-newspaper-line',        '#059669', 'inicio',       0, 14, 1),
  ('Atendimento',    'Fale com o INPREC',              '/contato',        'ri-customer-service-2-line','#DC2626','inicio',       0, 15, 1);

-- Garante que atalhos existentes com local "rodape" que também servem na home
-- fiquem separados dos atalhos específicos da home
UPDATE atalhos_rapidos
SET ordem = CASE
  WHEN label = 'Ouvidoria'   THEN 1
  WHEN label = 'Pesquisa'    THEN 2
  WHEN label = 'FAQ'         THEN 3
  WHEN label = 'Previdência' THEN 4
  ELSE ordem
END
WHERE id IN (1, 2, 3, 4);
