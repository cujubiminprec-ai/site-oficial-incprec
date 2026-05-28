-- Registra todas as páginas estáticas do projeto no painel Admin > Páginas.
-- Usa INSERT OR IGNORE para não sobrescrever registros existentes.

INSERT OR IGNORE INTO paginas
  (page_id, nome, rota, status, descricao_interna, menu_local, sub_menu, icone, modelo, ordem, editavel)
VALUES
  ('home',                  'Home / Início',                    '/',                        'publicada', 'Página inicial do site com hero, slides, seções e destaques.',          'Nenhum (sem menu)', 0, 'ri-home-4-line',            'informativo',  1,  1),
  ('servicos',              'Serviços',                         '/servicos',                'publicada', 'Lista de serviços prestados pelo INPREC.',                              'Serviços',          0, 'ri-service-line',           'informativo',  2,  1),
  ('quem-somos',            'Quem Somos',                       '/quem-somos',              'publicada', 'História, missão, visão e valores do INPREC.',                          'Institucional',     1, 'ri-building-2-line',        'informativo',  3,  1),
  ('estrutura',             'Estrutura Organizacional',         '/estrutura',               'publicada', 'Organograma e estrutura organizacional do INPREC.',                     'Institucional',     1, 'ri-organization-chart',     'informativo',  4,  1),
  ('noticias',              'Notícias',                         '/noticias',                'publicada', 'Listagem de notícias e comunicados publicados.',                        'Notícias & Eventos',0, 'ri-newspaper-line',         'noticias',     5,  1),
  ('transparencia',         'Transparência',                    '/transparencia',           'publicada', 'Portal de Transparência com documentos, relatórios e dados públicos.',  'Transparência',     0, 'ri-file-chart-line',        'transparencia',6,  1),
  ('transparencia-sobre',   'Transparência – Sobre',            '/transparencia/sobre',     'publicada', 'Informações sobre o Portal de Transparência do INPREC.',               'Transparência',     1, 'ri-information-line',       'informativo',  7,  1),
  ('transparencia-glossario','Glossário da Transparência',      '/transparencia/glossario', 'publicada', 'Glossário de termos e conceitos previdenciários e financeiros.',        'Transparência',     1, 'ri-book-2-line',            'informativo',  8,  1),
  ('ouvidoria',             'Ouvidoria',                        '/ouvidoria',               'publicada', 'Canal de manifestações, reclamações e sugestões da Ouvidoria.',         'Serviços',          1, 'ri-speak-line',             'contato',      9,  1),
  ('lai',                   'Lei de Acesso à Informação',       '/lai',                     'publicada', 'Pedidos de acesso à informação conforme a LAI (Lei 12.527/2011).',      'Transparência',     1, 'ri-file-info-line',         'transparencia',10, 1),
  ('contato',               'Contato',                          '/contato',                 'publicada', 'Formulário de contato, endereço, telefone e mapa de localização.',     'Serviços',          1, 'ri-mail-line',              'contato',      11, 1),
  ('eventos',               'Eventos e Audiências',             '/eventos',                 'publicada', 'Agenda de eventos, audiências públicas e capacitações.',               'Notícias & Eventos',1, 'ri-calendar-event-line',    'noticias',     12, 1),
  ('cursos',                'Cursos e Capacitações',            '/cursos',                  'publicada', 'Cursos, treinamentos e capacitações disponíveis para servidores.',      'Serviços',          1, 'ri-graduation-cap-line',    'informativo',  13, 1),
  ('legislacao',            'Legislação',                       '/legislacao',              'publicada', 'Leis, decretos e atos normativos relacionados ao RPPS e ao INPREC.',   'Transparência',     1, 'ri-scales-3-line',          'transparencia',14, 1),
  ('gestores',              'Gestores',                         '/gestores',                'publicada', 'Perfis dos gestores e membros dos conselhos do INPREC.',               'Institucional',     1, 'ri-group-line',             'informativo',  15, 1),
  ('formularios',           'Formulários',                      '/formularios',             'publicada', 'Formulários para requerimento de benefícios e serviços previdenciários.','Serviços',         1, 'ri-file-list-3-line',       'formulario',   16, 1),
  ('mapa-do-site',          'Mapa do Site',                     '/mapa-do-site',            'publicada', 'Mapa completo com links para todas as seções do site.',                'Nenhum (sem menu)', 0, 'ri-map-2-line',             'informativo',  17, 1);

UPDATE paginas
SET
  descricao_interna = COALESCE(descricao_interna, descricao_seo, nome),
  menu_local        = COALESCE(menu_local, 'Nenhum (sem menu)'),
  sub_menu          = COALESCE(sub_menu, 0),
  icone             = COALESCE(icone, 'ri-pages-line'),
  modelo            = COALESCE(modelo, 'informativo'),
  ordem             = CASE WHEN ordem IS NULL OR ordem = 0 THEN id ELSE ordem END;
