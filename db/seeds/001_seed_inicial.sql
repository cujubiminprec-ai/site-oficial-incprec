-- ============================================================
-- SEED 001 — Dados Iniciais do Sistema INPREC
-- Execute APÓS todas as migrations
-- ============================================================

-- ============================================================
-- Configurações iniciais do site
-- ============================================================
INSERT INTO configuracoes_site (
    nome_site, nome_completo, descricao_site,
    cor_primaria, cor_secundaria, cor_destaque,
    email_contato, telefone_principal, telefone_whatsapp,
    endereco_logradouro, endereco_cidade, endereco_estado, endereco_cep,
    horario_atendimento,
    rodape_texto,
    meta_titulo, meta_descricao
) VALUES (
    'INPREC',
    'Instituto de Previdência dos Servidores Públicos Municipais de Cujubim',
    'Garantindo a proteção previdenciária dos servidores municipais com eficiência e transparência.',
    '#1a3a5c', '#c8a951', '#e55f1c',
    'inprec@cujubim.ro.gov.br', '(69) 99250-9093', '(69) 99250-9093',
    'Av. Condor, n 2588 Centro', 'Cujubim', 'RO', '76.864-000',
    'Segunda a Sexta — 07h30 às 13h30',
    '© 2026 INPREC — Instituto de Previdência dos Servidores Públicos Municipais de Cujubim/RO. Todos os direitos reservados.',
    'INPREC — Previdência Municipal Cujubim/RO',
    'Instituto de Previdência dos Servidores Públicos Municipais de Cujubim. Aposentadoria, pensão, benefícios e transparência para servidores municipais de Rondônia.'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- Usuário administrador padrão
-- Senha: admin123 (hash bcrypt com 12 rounds)
-- ============================================================
INSERT INTO usuarios_admin (
    nome, email, senha_hash, nivel_acesso, permissoes, ativo, descricao
) VALUES (
    'Administrador Geral',
    'admin@inprec.com',
    '$2a$12$W3ppwGZ6D/7wWu.x0/Qj8e9KDSfBp/e1zloif7O9A2HQ5Q9L7GfLO',   -- admin123
    'superadmin',
    ARRAY[
        'dashboard','analytics','noticias','eventos','cursos','eventos-inscritos',
        'servicos','faq','ouvidoria-admin','lai-admin','contato-admin',
        'pesquisa-admin','chat-admin','slides','banner','floating','painel',
        'gestores','eleicao','votacao','transparencia','financas',
        'menu','aparencia','paginas','configuracoes','usuarios','auditoria'
    ],
    TRUE,
    'Superadministrador com acesso total ao sistema'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Páginas do site (estrutura inicial)
-- ============================================================
INSERT INTO paginas (page_id, nome, rota, status) VALUES
    ('home',                            'Home',                              '/',                              'publicada'),
    ('quem-somos',                      'Quem Somos',                        '/quem-somos',                    'publicada'),
    ('servicos',                        'Serviços',                          '/servicos',                      'publicada'),
    ('transparencia',                   'Portal da Transparência',           '/transparencia',                 'publicada'),
    ('financas-investimentos',          'Finanças e Investimentos',          '/financas-investimentos',        'publicada'),
    ('legislacao',                      'Legislação',                        '/legislacao',                    'publicada'),
    ('gestores',                        'Gestores',                          '/gestores',                      'publicada'),
    ('lai',                             'Lei de Acesso à Informação',        '/lai',                           'publicada'),
    ('lgpd',                            'LGPD',                              '/lgpd',                          'publicada'),
    ('contato',                         'Contato',                           '/contato',                       'publicada'),
    ('ouvidoria',                       'Ouvidoria',                         '/ouvidoria',                     'publicada'),
    ('beneficios-aposentadoria-idade',  'Aposentadoria por Idade',           '/beneficios/aposentadoria-por-idade',     'publicada'),
    ('beneficios-aposentadoria-invalidez', 'Aposentadoria por Invalidez',   '/beneficios/aposentadoria-por-invalidez', 'publicada'),
    ('beneficios-pensao-morte',         'Pensão por Morte',                  '/beneficios/pensao-por-morte',   'publicada'),
    ('beneficios-auxilio-doenca',       'Auxílio-Doença',                    '/beneficios/auxilio-doenca',     'publicada'),
    ('beneficios-fundo-previdenciario', 'Fundo Previdenciário',              '/beneficios/fundo-previdenciario', 'publicada'),
    ('beneficios-atendimento',          'Atendimento Personalizado',         '/beneficios/atendimento-personalizado', 'publicada'),
    ('eventos',                         'Eventos e Audiências',              '/eventos',                       'publicada'),
    ('noticias',                        'Notícias',                          '/noticias',                      'publicada'),
    ('cursos',                          'Cursos e Capacitações',             '/cursos',                        'publicada'),
    ('faq',                             'Perguntas Frequentes',              '/faq',                           'publicada'),
    ('estrutura',                       'Estrutura Organizacional',          '/estrutura',                     'publicada'),
    ('previdencia',                     'Previdência',                       '/previdencia',                   'publicada'),
    ('formularios',                     'Formulários',                       '/formularios',                   'publicada'),
    ('mapa-do-site',                    'Mapa do Site',                      '/mapa-do-site',                  'publicada')
ON CONFLICT (page_id) DO NOTHING;

-- ============================================================
-- Serviços iniciais
-- ============================================================
INSERT INTO servicos (icone, titulo, descricao, posicao, destaque) VALUES
    ('ri-government-line',   'Gestão Administrativa',     'Suporte completo à gestão de órgãos públicos com processos modernos, eficiência e conformidade legal.', 1, TRUE),
    ('ri-book-open-line',    'Capacitação de Servidores', 'Programas de formação continuada para servidores municipais com cursos presenciais e EAD certificados.', 2, TRUE),
    ('ri-file-chart-line',   'Planejamento Estratégico',  'Elaboração de planos estratégicos institucionais com metodologias ágeis e indicadores de desempenho.', 3, FALSE),
    ('ri-shield-check-line', 'Controle e Fiscalização',   'Auditorias, fiscalização de contratos e compliance para garantir a legalidade dos atos administrativos.', 4, FALSE),
    ('ri-community-line',    'Atendimento ao Cidadão',    'Canais de atendimento presencial e digital para demandas, ouvidoria e serviços ao cidadão.', 5, FALSE),
    ('ri-bar-chart-box-line','Dados e Transparência',     'Publicação de dados abertos, relatórios financeiros e acesso à informação conforme a LAI.', 6, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- FAQ inicial
-- ============================================================
INSERT INTO faq (pergunta, resposta, categoria, posicao) VALUES
    ('Quem tem direito à aposentadoria pelo RPPS?',
     'Os servidores públicos municipais efetivos vinculados ao INPREC têm direito à aposentadoria conforme regras da EC 103/2019.',
     'Aposentadoria', 1),
    ('Como solicitar a aposentadoria?',
     'O servidor deve protocolar requerimento no INPREC com a documentação exigida. O prazo de análise é de até 30 dias úteis.',
     'Aposentadoria', 2),
    ('Quais documentos são necessários para aposentadoria?',
     'RG, CPF, comprovante de residência, contracheques dos últimos 3 meses, certidão de tempo de serviço e formulário preenchido.',
     'Documentação', 3),
    ('Como funciona a pensão por morte?',
     'A pensão é concedida aos dependentes do servidor falecido. Deve ser solicitada em até 90 dias após o óbito.',
     'Pensão', 4),
    ('Como acessar o extrato previdenciário?',
     'Acesse o Portal do Servidor com seu CPF e senha. Em caso de dúvida, entre em contato com o INPREC.',
     'Portal', 5),
    ('O INPREC tem atendimento online?',
     'Sim! Você pode enviar documentos e solicitações pelo e-mail inprec@cujubim.ro.gov.br ou pela ouvidoria online.',
     'Atendimento', 6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Benefícios iniciais
-- ============================================================
INSERT INTO beneficios (slug, titulo, descricao_curta, icone, posicao) VALUES
    ('aposentadoria-por-idade',    'Aposentadoria por Idade',       'Direito ao servidor que atingiu a idade mínima e o tempo de contribuição exigidos.',  'ri-user-star-line',     1),
    ('aposentadoria-por-invalidez','Aposentadoria por Invalidez',   'Concedida ao servidor incapaz permanentemente para o exercício do cargo.',             'ri-heart-pulse-line',   2),
    ('pensao-por-morte',           'Pensão por Morte',              'Benefício concedido aos dependentes do servidor falecido.',                            'ri-group-line',         3),
    ('auxilio-doenca',             'Auxílio-Doença',                'Benefício concedido após 30 dias consecutivos de afastamento médico.',                 'ri-hospital-line',      4),
    ('fundo-previdenciario',       'Fundo Previdenciário',          'Gestão dos recursos financeiros para garantir o pagamento dos benefícios futuros.',    'ri-funds-line',         5),
    ('atendimento-personalizado',  'Atendimento Personalizado',     'Atendimento especializado para dúvidas sobre benefícios e documentação.',              'ri-customer-service-2-line', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Banner de aviso desativado (pronto para configurar)
-- ============================================================
INSERT INTO banner_aviso (texto, link_url, link_label, cor_fundo, ativo) VALUES
    ('Período de recadastramento anual: 15/04 a 15/05/2026. Clique para saber mais.',
     '/noticias', 'Saiba mais', '#1a3a5c', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Eleição — configuração padrão
-- ============================================================
INSERT INTO eleicao_configuracao (titulo, descricao, status) VALUES
    ('Eleição do Conselho Deliberativo e Fiscal — 2026',
     'Eleição para escolha dos representantes dos servidores nos Conselhos do INPREC.',
     'inativa')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Mensagem de conclusão
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed inicial concluído com sucesso!';
    RAISE NOTICE '   - Configurações do site inseridas';
    RAISE NOTICE '   - Usuário admin padrão criado (troque a senha_hash!)';
    RAISE NOTICE '   - % páginas cadastradas', (SELECT COUNT(*) FROM paginas);
    RAISE NOTICE '   - % serviços cadastrados', (SELECT COUNT(*) FROM servicos);
    RAISE NOTICE '   - % perguntas FAQ cadastradas', (SELECT COUNT(*) FROM faq);
    RAISE NOTICE '   - % benefícios cadastrados', (SELECT COUNT(*) FROM beneficios);
END $$;
