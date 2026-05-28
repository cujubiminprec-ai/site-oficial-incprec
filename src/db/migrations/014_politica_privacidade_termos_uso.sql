-- Cria as páginas de Política de Privacidade e Termos de Uso do INPREC.
-- Status inicial: oculta — ativar pelo Admin > Páginas > ícone do olho.

-- ────────────────────────────────────────────────────────────────────────────
-- PÁGINAS
-- ────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO paginas
  (page_id, nome, rota, status, descricao_interna, titulo_seo, descricao_seo,
   keywords_seo, menu_local, sub_menu, icone, modelo, ordem, editavel)
VALUES
  (
    'politica-de-privacidade',
    'Política de Privacidade',
    '/politica-de-privacidade',
    'oculta',
    'Política de privacidade e proteção de dados pessoais do INPREC conforme a LGPD.',
    'Política de Privacidade – INPREC',
    'Saiba como o INPREC coleta, utiliza e protege seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).',
    'política de privacidade, LGPD, proteção de dados, INPREC, Cujubim',
    'Nenhum (sem menu)', 0, 'ri-lock-2-line', 'informativo', 98, 1
  ),
  (
    'termos-de-uso',
    'Termos de Uso',
    '/termos-de-uso',
    'oculta',
    'Termos e condições de uso do site do INPREC.',
    'Termos de Uso – INPREC',
    'Conheça os termos e condições para uso do site do INPREC, Instituto de Previdência dos Servidores Públicos Municipais de Cujubim/RO.',
    'termos de uso, condições de uso, INPREC, site, Cujubim',
    'Nenhum (sem menu)', 0, 'ri-file-text-line', 'informativo', 99, 1
  );

-- ────────────────────────────────────────────────────────────────────────────
-- BLOCOS: politica-de-privacidade
-- Colunas: page_id, bloco_id, tipo, posicao, titulo, subtitulo, texto,
--          itens, cta_label, cta_url, cor, alinhamento, ativo
-- ────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO paginas_blocos
  (page_id, bloco_id, tipo, posicao, titulo, subtitulo, texto,
   itens, cta_label, cta_url, cor, alinhamento, ativo)
VALUES
  (
    'politica-de-privacidade', 'pp-hero', 'hero', 0,
    'Política de Privacidade',
    'Saiba como o INPREC coleta, utiliza e protege seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018).',
    NULL, NULL, NULL, NULL, NULL, 'center', 1
  ),
  (
    'politica-de-privacidade', 'pp-controlador', 'texto', 1,
    'Identificação do Controlador',
    NULL,
    'O INPREC – Instituto de Previdência dos Servidores Públicos Municipais de Cujubim, pessoa jurídica de direito público, com sede na Av. Condor, nº 2588, Centro, Cujubim/RO, CEP 76.864-000, é o Controlador de Dados Pessoais nos termos da LGPD.
Esta Política de Privacidade aplica-se a todos os dados pessoais coletados pelo INPREC no exercício de suas atividades institucionais, inclusive por meio do site oficial m.inprec.com.br e dos processos de atendimento previdenciário.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-dados-lista', 'lista', 2,
    'Dados Pessoais Coletados',
    NULL, NULL,
    '["Dados de identificação: nome completo, CPF, RG, data de nascimento e filiação","Dados de contato: endereço residencial, telefone e e-mail","Dados funcionais: matrícula, cargo, órgão de origem e tempo de serviço","Dados previdenciários: histórico de contribuições, salários e benefícios","Dados de dependentes: informações dos dependentes declarados para fins previdenciários","Dados de navegação: endereço IP, tipo de navegador, páginas acessadas e tempo de acesso"]',
    NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-finalidade', 'texto', 3,
    'Finalidade do Tratamento',
    NULL,
    'O INPREC trata os dados pessoais coletados para as seguintes finalidades:
Concessão, manutenção e gestão de benefícios previdenciários (aposentadoria, pensão por morte, auxílio-doença e demais benefícios do RPPS).
Atendimento de solicitações, reclamações e pedidos de informação dos servidores e seus dependentes.
Cumprimento de obrigações legais e regulatórias decorrentes da legislação previdenciária e da LGPD.
Comunicação sobre alterações nos serviços, prazos e obrigações previdenciárias.
Elaboração de estatísticas e relatórios institucionais, sempre de forma anonimizada.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-base-legal', 'lista', 4,
    'Base Legal para o Tratamento',
    NULL, NULL,
    '["Cumprimento de obrigação legal ou regulatória (LGPD, Art. 7º, II)","Execução de políticas públicas previstas em leis e regulamentos (Art. 7º, III)","Exercício regular de direitos em processo judicial ou administrativo (Art. 7º, VI)","Proteção do crédito, quando aplicável (Art. 7º, X)"]',
    NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-direitos', 'lista', 5,
    'Direitos dos Titulares (LGPD)',
    NULL, NULL,
    '["Confirmação da existência de tratamento de seus dados pessoais","Acesso aos dados pessoais mantidos pelo INPREC","Correção de dados incompletos, inexatos ou desatualizados","Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos","Portabilidade dos dados a outro prestador de serviço","Eliminação dos dados tratados com base em consentimento","Informação sobre entidades com as quais o INPREC compartilha seus dados","Revogação do consentimento, quando fundamentado nessa base legal","Petição à Autoridade Nacional de Proteção de Dados (ANPD)"]',
    NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-compartilhamento', 'texto', 6,
    'Compartilhamento de Dados',
    NULL,
    'Os dados pessoais poderão ser compartilhados com órgãos públicos federais, estaduais e municipais no cumprimento de obrigações legais, como Receita Federal, Tribunal de Contas e Ministério da Previdência Social.
Também poderão ser compartilhados com sistemas governamentais de controle previdenciário (CADPREV, SICONFI) e com prestadores de serviços contratados pelo INPREC, sujeitos a obrigações contratuais de sigilo e conformidade com a LGPD.
O INPREC não realiza a transferência de dados pessoais a entidades privadas para fins comerciais.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-seguranca', 'texto', 7,
    'Segurança dos Dados',
    NULL,
    'O INPREC adota medidas técnicas e organizacionais para proteger os dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição indevida, incluindo controle de acesso baseado em funções, criptografia de dados sensíveis e monitoramento contínuo de acessos.
Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, o INPREC notificará a ANPD e os titulares afetados nos prazos previstos em lei.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-cookies', 'texto', 8,
    'Cookies e Tecnologias de Rastreamento',
    NULL,
    'O site do INPREC pode utilizar cookies essenciais para garantir o funcionamento adequado das funcionalidades de autenticação e segurança. Não utilizamos cookies de rastreamento ou publicidade de terceiros.
Você pode configurar seu navegador para recusar cookies; contudo, algumas funcionalidades do site poderão ser limitadas.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-encarregado', 'texto', 9,
    'Contato do Encarregado de Dados (DPO)',
    NULL,
    'O INPREC designou um Encarregado pelo Tratamento de Dados Pessoais (DPO), responsável por atuar como canal de comunicação entre o INPREC, os titulares e a ANPD.
Para exercer seus direitos ou obter informações sobre o tratamento de seus dados, entre em contato:
E-mail: inprec@cujubim.ro.gov.br
Endereço: Av. Condor, nº 2588, Centro, Cujubim/RO – CEP 76.864-000
Telefone: (69) 99250-9093
Horário: Segunda a Sexta, das 07h30 às 13h30',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-vigencia', 'texto', 10,
    'Vigência e Atualizações',
    NULL,
    'Esta Política de Privacidade entra em vigor na data de sua publicação no site do INPREC e poderá ser atualizada a qualquer momento, mediante comunicação prévia no portal institucional.
Recomendamos a leitura periódica deste documento para se manter informado sobre como o INPREC protege seus dados pessoais.
Última atualização: maio de 2026.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'politica-de-privacidade', 'pp-cta', 'cta', 11,
    'Dúvidas sobre seus dados?',
    NULL,
    'Entre em contato com o INPREC para exercer seus direitos ou esclarecer qualquer dúvida sobre o tratamento de seus dados pessoais.',
    NULL, 'Falar com o INPREC', '/contato', NULL, 'center', 1
  );

-- ────────────────────────────────────────────────────────────────────────────
-- BLOCOS: termos-de-uso
-- Colunas: page_id, bloco_id, tipo, posicao, titulo, subtitulo, texto,
--          itens, cta_label, cta_url, cor, alinhamento, ativo
-- ────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO paginas_blocos
  (page_id, bloco_id, tipo, posicao, titulo, subtitulo, texto,
   itens, cta_label, cta_url, cor, alinhamento, ativo)
VALUES
  (
    'termos-de-uso', 'tu-hero', 'hero', 0,
    'Termos de Uso',
    'Ao utilizar o site do INPREC, você concorda com os termos e condições descritos neste documento. Leia com atenção antes de navegar.',
    NULL, NULL, NULL, NULL, NULL, 'center', 1
  ),
  (
    'termos-de-uso', 'tu-aceitacao', 'texto', 1,
    'Aceitação dos Termos',
    NULL,
    'O acesso e uso do site do INPREC (m.inprec.com.br) implicam a aceitação integral e irrestrita destes Termos de Uso. Caso não concorde com qualquer disposição aqui prevista, solicitamos que interrompa o uso do site imediatamente.
Estes Termos de Uso complementam a Política de Privacidade do INPREC, que trata especificamente do tratamento de dados pessoais conforme a LGPD.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-objeto', 'texto', 2,
    'Objeto e Finalidade do Site',
    NULL,
    'O site do INPREC tem como finalidade disponibilizar informações institucionais, serviços previdenciários, atos normativos, notícias, canais de atendimento e ferramentas de transparência à comunidade de servidores públicos municipais de Cujubim/RO e ao público em geral.
O INPREC reserva-se o direito de alterar, suspender ou descontinuar funcionalidades do site a qualquer momento, sem necessidade de aviso prévio.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-regras', 'lista', 3,
    'Regras de Uso Adequado',
    NULL, NULL,
    '["Utilizar o site para fins lícitos e compatíveis com a legislação brasileira vigente","Não realizar ações que comprometam a segurança, disponibilidade ou integridade do site","Não reproduzir, distribuir ou comercializar conteúdos do site sem autorização expressa do INPREC","Não inserir ou disseminar conteúdo falso, ofensivo, difamatório ou que viole direitos de terceiros","Não utilizar mecanismos automatizados (bots, scrapers) para acesso ao site sem autorização prévia","Manter a confidencialidade de credenciais de acesso a áreas restritas do portal"]',
    NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-propriedade', 'texto', 4,
    'Propriedade Intelectual',
    NULL,
    'Todo o conteúdo disponibilizado no site do INPREC – incluindo textos, imagens, logotipos, layouts, marcas e elementos visuais – é de propriedade do INPREC ou de seus licenciadores, protegido pela legislação de propriedade intelectual aplicável.
É permitida a reprodução parcial de conteúdos para fins não comerciais, desde que citada a fonte (INPREC) e preservada a integridade das informações. A reprodução integral ou com fins comerciais depende de autorização expressa do INPREC.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-responsabilidade', 'texto', 5,
    'Responsabilidade e Limitações',
    NULL,
    'O INPREC envidarará esforços para manter o site atualizado e disponível, mas não garante a ausência de interrupções, erros ou imprecisões. O INPREC não se responsabiliza por:
Danos decorrentes do uso inadequado das informações disponibilizadas no site.
Indisponibilidade temporária do site por razões técnicas ou de manutenção programada.
Conteúdo de sites externos acessados por meio de links disponibilizados no portal.
Atos de terceiros que impliquem acesso não autorizado ao site ou aos dados dos usuários.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-links', 'texto', 6,
    'Links Externos',
    NULL,
    'O site do INPREC pode conter links para portais governamentais, sistemas externos e sites de parceiros institucionais. O INPREC não se responsabiliza pelo conteúdo, práticas de privacidade ou disponibilidade desses sites externos.
O acesso a links externos é de inteira responsabilidade do usuário.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-modificacoes', 'texto', 7,
    'Modificações dos Termos',
    NULL,
    'O INPREC reserva-se o direito de alterar estes Termos de Uso a qualquer tempo, sem aviso prévio. As alterações entram em vigor imediatamente após a publicação no site.
O uso continuado do site após a publicação das alterações constitui aceitação tácita das novas condições.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-legislacao', 'texto', 8,
    'Legislação Aplicável e Foro',
    NULL,
    'Estes Termos de Uso são regidos pela legislação brasileira, em especial pela Lei nº 12.965/2014 (Marco Civil da Internet) e pela Lei nº 13.709/2018 (LGPD).
Eventuais conflitos decorrentes da interpretação ou aplicação destes Termos serão submetidos ao Foro da Comarca de Cujubim/RO, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
Última atualização: maio de 2026.',
    NULL, NULL, NULL, NULL, 'left', 1
  ),
  (
    'termos-de-uso', 'tu-cta', 'cta', 9,
    'Ficou com dúvidas?',
    NULL,
    'Entre em contato com o INPREC para esclarecer qualquer questão sobre os Termos de Uso ou nossa Política de Privacidade.',
    NULL, 'Falar com o INPREC', '/contato', NULL, 'center', 1
  );
