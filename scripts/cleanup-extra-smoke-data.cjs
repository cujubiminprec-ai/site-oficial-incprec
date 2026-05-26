const fs = require("fs");
const path = require("path");
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

  const uploadNames = [
    "1778981401437-58599f4f.pdf",
    "audiencia-publica-inprec-2025-capa.jpg",
    "curso-inprec.jpg",
  ];

  const [files] = await connection.execute(
    "SELECT caminho FROM arquivos WHERE nome_original IN (?, ?, ?)",
    uploadNames,
  );

  for (const file of files) {
    const relativePath = String(file.caminho).replace(/^\/uploads\//, "");
    const absolutePath = path.resolve(process.env.UPLOAD_PATH || "public/uploads", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  await connection.execute("DELETE FROM arquivos WHERE nome_original IN (?, ?, ?)", uploadNames);
  await connection.execute("DELETE FROM cursos_inscritos WHERE email = ? OR email LIKE ?", ["smoke-curso@teste.local", "smoke-%@teste.local"]);
  await connection.execute("DELETE FROM cursos WHERE titulo = ? OR titulo LIKE ?", ["Curso Smoke MySQL", "Curso smoke-%"]);
  await connection.execute("DELETE FROM faq WHERE categoria = ? OR pergunta LIKE ?", ["Smoke", "Pergunta smoke%"]);
  await connection.execute("DELETE FROM slides WHERE titulo = ? OR titulo LIKE ?", ["Smoke Slide MySQL", "Slide smoke-%"]);
  await connection.execute("DELETE FROM paginas_blocos WHERE bloco_id LIKE 'hero-smoke-extra-%'");
  await connection.execute("DELETE FROM app_config WHERE chave = 'smoke_extra'");
  await connection.execute("DELETE FROM transparencia_documentos WHERE titulo LIKE 'Documento smoke-extra-%'");
  await connection.execute("DELETE FROM noticias WHERE titulo LIKE 'Noticia smoke-extra-%'");
  await connection.execute("DELETE FROM servicos WHERE titulo LIKE 'Servico smoke-extra-%' OR titulo LIKE 'Servico atualizado smoke-extra-%'");

  await connection.execute("DELETE FROM menu_navegacao");
  const menuItems = [
    ["Inicio", "/", 1],
    ["Servicos", "/servicos", 2],
    ["Noticias", "/noticias", 3],
    ["Transparencia", "/transparencia", 4],
    ["Contato", "/contato", 5],
  ];
  for (const item of menuItems) {
    await connection.execute(
      "INSERT INTO menu_navegacao (label, url, posicao, ativo, novo_tab) VALUES (?, ?, ?, 1, 0)",
      item,
    );
  }
  await connection.end();
  console.log("extra cleanup ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
