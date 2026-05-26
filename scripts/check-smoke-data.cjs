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

  const checks = [
    ["paginas", "SELECT COUNT(*) AS c FROM paginas WHERE page_id LIKE 'pagina-smoke-%' OR page_id = 'debug-page'"],
    ["paginas_blocos", "SELECT COUNT(*) AS c FROM paginas_blocos WHERE page_id LIKE 'pagina-smoke-%' OR page_id LIKE 'smoke-full-%' OR bloco_id LIKE 'smoke-full-%' OR page_id = 'debug-page'"],
    ["eventos", "SELECT COUNT(*) AS c FROM eventos WHERE titulo LIKE 'Evento Smoke %'"],
    ["noticias", "SELECT COUNT(*) AS c FROM noticias WHERE titulo LIKE 'Noticia smoke-%'"],
    ["servicos", "SELECT COUNT(*) AS c FROM servicos WHERE titulo LIKE 'Servico smoke-%'"],
    ["gestores", "SELECT COUNT(*) AS c FROM gestores WHERE nome LIKE 'Gestor smoke-%' OR email LIKE 'smoke-%@teste.local'"],
    ["usuarios", "SELECT COUNT(*) AS c FROM usuarios_admin WHERE email LIKE 'smoke-%@teste.local'"],
    ["transparencia", "SELECT COUNT(*) AS c FROM transparencia_documentos WHERE titulo LIKE 'Documento smoke-%'"],
    ["painel_transparencia", "SELECT COUNT(*) AS c FROM transparency_panel WHERE title LIKE 'Painel smoke-%'"],
    ["app_config", "SELECT COUNT(*) AS c FROM app_config WHERE chave LIKE 'smoke-%'"],
    ["analytics", "SELECT COUNT(*) AS c FROM analytics_eventos WHERE path LIKE '/smoke/%'"],
    ["contato", "SELECT COUNT(*) AS c FROM contato_mensagens WHERE assunto LIKE 'Assunto smoke-%'"],
    ["pesquisa", "SELECT COUNT(*) AS c FROM pesquisa_satisfacao WHERE servico LIKE 'Servico smoke-%'"],
    ["formularios", "SELECT COUNT(*) AS c FROM formularios_respostas WHERE formulario_nome LIKE 'formulario-smoke-%'"],
  ];

  for (const [name, sql] of checks) {
    const [rows] = await connection.execute(sql);
    console.log(`${name}:${rows[0].c}`);
  }

  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
