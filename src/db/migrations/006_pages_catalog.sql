-- Completa o catalogo de paginas administraveis.
-- A tela "Paginas" passa a listar tambem rotas estaticas importantes do site.

INSERT OR IGNORE INTO paginas (page_id, nome, rota, status, descricao_interna, menu_local, sub_menu, icone, modelo, ordem)
VALUES
  ('atendimento-ao-cidadao', 'Atendimento ao Cidadao', '/atendimento-ao-cidadao', 'publicada', 'Pagina de atendimento ao cidadao.', 'Servicos', 1, 'ri-customer-service-2-line', 'informativo', 21),
  ('previdencia', 'Previdencia', '/previdencia', 'publicada', 'Informacoes previdenciarias e simuladores.', 'Servicos', 1, 'ri-shield-user-line', 'informativo', 22),
  ('perguntas-frequentes', 'Perguntas Frequentes', '/perguntas-frequentes', 'publicada', 'FAQ publico do site.', 'Servicos', 1, 'ri-question-answer-line', 'informativo', 23),
  ('pesquisa-satisfacao', 'Pesquisa de Satisfacao', '/pesquisa-satisfacao', 'publicada', 'Pagina publica da pesquisa de satisfacao.', 'Participacao', 1, 'ri-survey-line', 'formulario', 24),
  ('financas-investimentos', 'Financas e Investimentos', '/financas-investimentos', 'publicada', 'Relatorios financeiros, investimentos e documentos.', 'Financas e Investimentos', 0, 'ri-bar-chart-box-line', 'transparencia', 25),
  ('pro-gestao', 'Pro-Gestao RPPS', '/pro-gestao', 'publicada', 'Certificacao Pro-Gestao RPPS.', 'Institucional', 1, 'ri-medal-2-line', 'informativo', 26),
  ('lgpd', 'LGPD', '/lgpd', 'publicada', 'Lei Geral de Protecao de Dados.', 'Transparencia', 1, 'ri-lock-2-line', 'informativo', 27),
  ('codigo-de-etica', 'Codigo de Etica', '/codigo-de-etica', 'publicada', 'Codigo de etica institucional.', 'Institucional', 1, 'ri-scales-3-line', 'informativo', 28),
  ('compromisso-com-servidor', 'Compromisso com Servidor', '/compromisso-com-servidor', 'publicada', 'Compromissos institucionais com o servidor.', 'Institucional', 1, 'ri-hand-heart-line', 'informativo', 29),
  ('marca', 'Marca Institucional', '/marca', 'publicada', 'Identidade e marca institucional.', 'Institucional', 1, 'ri-palette-line', 'informativo', 30),
  ('enderecos', 'Enderecos', '/enderecos', 'publicada', 'Enderecos e localizacao.', 'Institucional', 1, 'ri-map-pin-line', 'contato', 31),
  ('eleicao', 'Eleicao', '/eleicao', 'publicada', 'Pagina publica da eleicao.', 'Participacao', 1, 'ri-government-line', 'informativo', 32),
  ('votacao', 'Votacao', '/votacao', 'publicada', 'Pagina publica de votacao.', 'Participacao', 1, 'ri-checkbox-circle-line', 'formulario', 33),
  ('beneficios-aposentadoria-idade', 'Aposentadoria por Idade', '/beneficios/aposentadoria-por-idade', 'publicada', 'Beneficio previdenciario: aposentadoria por idade.', 'Servicos', 1, 'ri-user-star-line', 'beneficio', 34),
  ('beneficios-pensao-morte', 'Pensao por Morte', '/beneficios/pensao-por-morte', 'publicada', 'Beneficio previdenciario: pensao por morte.', 'Servicos', 1, 'ri-group-line', 'beneficio', 35),
  ('beneficios-auxilio-doenca', 'Auxilio-Doenca', '/beneficios/auxilio-doenca', 'publicada', 'Beneficio previdenciario: auxilio-doenca.', 'Servicos', 1, 'ri-hospital-line', 'beneficio', 36),
  ('beneficios-aposentadoria-invalidez', 'Aposentadoria por Invalidez', '/beneficios/aposentadoria-por-invalidez', 'publicada', 'Beneficio previdenciario: aposentadoria por invalidez.', 'Servicos', 1, 'ri-heart-pulse-line', 'beneficio', 37),
  ('beneficios-fundo-previdenciario', 'Fundo Previdenciario', '/beneficios/fundo-previdenciario', 'publicada', 'Fundo previdenciario.', 'Servicos', 1, 'ri-funds-line', 'beneficio', 38),
  ('beneficios-atendimento', 'Atendimento Personalizado', '/beneficios/atendimento-personalizado', 'publicada', 'Atendimento personalizado sobre beneficios.', 'Servicos', 1, 'ri-customer-service-2-line', 'beneficio', 39);

UPDATE paginas
SET descricao_interna = COALESCE(descricao_interna, descricao_seo, nome),
    menu_local = COALESCE(menu_local, 'Nenhum (sem menu)'),
    sub_menu = COALESCE(sub_menu, 0),
    icone = COALESCE(icone, 'ri-pages-line'),
    modelo = COALESCE(modelo, 'informativo'),
    ordem = CASE WHEN ordem IS NULL OR ordem = 0 THEN id ELSE ordem END;
