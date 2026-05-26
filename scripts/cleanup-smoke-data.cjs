const mysql = require("mysql2/promise");
require("dotenv").config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "inprec",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "inprec",
  });

  const statements = [
    "DELETE FROM paginas_blocos WHERE page_id LIKE 'pagina-smoke-%' OR page_id = 'debug-page'",
    "DELETE FROM paginas_blocos WHERE page_id LIKE 'smoke-full-%' OR bloco_id LIKE 'smoke-full-%'",
    "DELETE FROM paginas WHERE page_id LIKE 'pagina-smoke-%' OR page_id = 'debug-page'",
    "DELETE FROM eventos_inscritos WHERE nome LIKE 'Inscrito smoke-%' OR email LIKE 'smoke-%@teste.local'",
    "DELETE FROM eventos WHERE titulo LIKE 'Evento Smoke %' OR titulo LIKE 'Evento smoke-%'",
    "DELETE FROM noticias WHERE titulo LIKE 'Noticia smoke-%'",
    "DELETE FROM servicos WHERE titulo LIKE 'Servico smoke-%'",
    "DELETE FROM gestores WHERE nome LIKE 'Gestor smoke-%' OR email LIKE 'smoke-%@teste.local'",
    "DELETE FROM usuarios_admin WHERE email LIKE 'smoke-%@teste.local'",
    "DELETE FROM transparencia_documentos WHERE titulo LIKE 'Documento smoke-%'",
    "DELETE FROM transparency_panel WHERE title LIKE 'Painel smoke-%'",
    "DELETE FROM app_config WHERE chave LIKE 'smoke-%'",
    "DELETE FROM lai_pedidos WHERE email LIKE 'smoke-%-lai@teste.local' OR nome LIKE 'LAI smoke-%'",
    "DELETE FROM ouvidoria_mensagens WHERE email LIKE 'smoke-%-ouv@teste.local' OR assunto LIKE 'Assunto smoke-%'",
    "DELETE FROM analytics_eventos WHERE path LIKE '/smoke/%' OR page_name LIKE 'Smoke %' OR element_label = 'Botao Smoke'",
    "DELETE FROM contato_mensagens WHERE assunto LIKE 'Assunto smoke-%' OR email LIKE 'smoke-%-contato@teste.local'",
    "DELETE FROM pesquisa_satisfacao WHERE servico LIKE 'Servico smoke-%'",
    "DELETE FROM formularios_respostas WHERE formulario_nome LIKE 'formulario-smoke-%' OR email_remetente LIKE 'smoke-%-form@teste.local' OR email_remetente LIKE 'smoke-%-pesquisa@teste.local'",
    "DELETE FROM auditoria WHERE descricao LIKE '%smoke-%' OR descricao LIKE '%Debug Page%' OR dados_novos LIKE '%smoke-%' OR dados_novos LIKE '%debug-page%'",
  ];

  for (const sql of statements) {
    await connection.execute(sql);
  }

  await connection.end();
  console.log("cleanup ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
