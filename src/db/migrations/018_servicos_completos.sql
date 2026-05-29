-- Adiciona os serviços que estavam apenas no fallback hardcoded da página.
-- Após esta migration, todos os serviços são gerenciáveis pelo Admin > Serviços.

INSERT OR IGNORE INTO servicos (icone, titulo, descricao, posicao, destaque, ativo)
VALUES
  ('ri-money-dollar-circle-line', 'Gestão Financeira',    'Assessoria em gestão orçamentária, execução financeira e contabilidade pública conforme LRF.',                               7,  0, 1),
  ('ri-user-heart-line',          'Saúde do Servidor',    'Programas de qualidade de vida, saúde ocupacional e assistência ao servidor municipal.',                                     8,  0, 1),
  ('ri-map-2-line',               'Gestão Territorial',   'Planejamento urbano e rural, cadastro técnico municipal e gestão de políticas territoriais.',                                9,  0, 1),
  ('ri-recycle-line',             'Sustentabilidade',     'Projetos de gestão ambiental, resíduos sólidos e sustentabilidade na administração pública.',                                10, 0, 1),
  ('ri-graduation-cap-line',      'Escola de Governo',    'Cursos de pós-graduação, extensão e especialização voltados para servidores públicos.',                                     11, 0, 1),
  ('ri-computer-line',            'Modernização Digital', 'Implantação de sistemas de gestão eletrônica, governo digital e desburocratização de processos.',                           12, 0, 1);

-- Atualiza os 6 serviços originais do seed com descrições melhoradas
UPDATE servicos SET descricao = 'Suporte completo à gestão de órgãos públicos com processos modernos, eficiência e conformidade legal.'
  WHERE titulo = 'Gestao Administrativa' AND LENGTH(descricao) < 60;

UPDATE servicos SET descricao = 'Programas de formação continuada para servidores municipais com cursos presenciais e EAD certificados.'
  WHERE titulo = 'Capacitacao de Servidores' AND LENGTH(descricao) < 60;

UPDATE servicos SET descricao = 'Elaboração de planos estratégicos institucionais com metodologias ágeis e indicadores de desempenho.'
  WHERE titulo = 'Planejamento Estrategico' AND LENGTH(descricao) < 60;

UPDATE servicos SET descricao = 'Auditorias, fiscalização de contratos e compliance para garantir a legalidade dos atos administrativos.'
  WHERE titulo = 'Controle e Fiscalizacao' AND LENGTH(descricao) < 60;

UPDATE servicos SET descricao = 'Canais de atendimento presencial e digital para demandas, ouvidoria e serviços ao cidadão.'
  WHERE titulo = 'Atendimento ao Cidadao' AND LENGTH(descricao) < 60;

UPDATE servicos SET descricao = 'Publicação de dados abertos, relatórios financeiros e acesso à informação conforme a LAI.'
  WHERE titulo = 'Dados e Transparencia' AND LENGTH(descricao) < 60;
