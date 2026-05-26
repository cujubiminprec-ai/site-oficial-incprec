ALTER TABLE usuarios_admin
  MODIFY permissoes LONGTEXT NOT NULL DEFAULT ('[]'),
  MODIFY descricao LONGTEXT;

ALTER TABLE auditoria
  MODIFY descricao LONGTEXT,
  MODIFY dados_anteriores LONGTEXT,
  MODIFY dados_novos LONGTEXT;

ALTER TABLE noticias
  MODIFY resumo LONGTEXT,
  MODIFY conteudo LONGTEXT,
  MODIFY tags LONGTEXT NOT NULL DEFAULT ('[]');

ALTER TABLE eventos
  MODIFY descricao LONGTEXT,
  MODIFY conteudo_programatico LONGTEXT;

ALTER TABLE paginas_blocos
  MODIFY texto LONGTEXT,
  MODIFY itens LONGTEXT,
  MODIFY colunas LONGTEXT;

ALTER TABLE transparency_panel
  MODIFY description LONGTEXT,
  MODIFY slideImages LONGTEXT DEFAULT ('[]');

ALTER TABLE faq
  MODIFY resposta LONGTEXT NOT NULL;

ALTER TABLE app_config
  MODIFY valor LONGTEXT;

ALTER TABLE formularios_configuracao
  MODIFY descricao LONGTEXT,
  MODIFY campos LONGTEXT NOT NULL DEFAULT ('[]');

ALTER TABLE formularios_respostas
  MODIFY dados LONGTEXT NOT NULL;

ALTER TABLE beneficios
  MODIFY descricao_curta LONGTEXT,
  MODIFY conteudo LONGTEXT,
  MODIFY requisitos LONGTEXT NOT NULL DEFAULT ('[]'),
  MODIFY documentos LONGTEXT NOT NULL DEFAULT ('[]');
