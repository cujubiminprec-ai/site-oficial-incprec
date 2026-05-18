/**
 * Migration runner para SQLite
 * Executa arquivos SQL de src/db/migrations/ em ordem numérica.
 * Registra cada migration executada na tabela _migrations para não re-executar.
 */
import fs from "fs";
import path from "path";
import { db } from "../config/database";
import env from "../config/env";

const MIGRATIONS_DIR = path.resolve(__dirname, "migrations");

function inicializarTabelaMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL UNIQUE,
      executado TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function listarMigrationsExecutadas(): Set<string> {
  const rows = db.prepare("SELECT nome FROM _migrations").all() as { nome: string }[];
  return new Set(rows.map((r) => r.nome));
}

function listarArquivosMigrations(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`⚠️  Pasta de migrations não encontrada: ${MIGRATIONS_DIR}`);
    return [];
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // ordem alfabética = numérica (001_, 002_, etc.)
}

function registrarMigration(nome: string): void {
  db.prepare("INSERT INTO _migrations (nome) VALUES (?)").run(nome);
}

export function runMigrations(): void {
  console.log("\n📦 Iniciando migrations SQLite...");

  inicializarTabelaMigrations();

  const executadas  = listarMigrationsExecutadas();
  const arquivos    = listarArquivosMigrations();
  const pendentes   = arquivos.filter((f) => !executadas.has(f));

  if (pendentes.length === 0) {
    console.log("✅ Nenhuma migration pendente. Banco atualizado.\n");
    return;
  }

  for (const arquivo of pendentes) {
    const caminho = path.join(MIGRATIONS_DIR, arquivo);
    const sql     = fs.readFileSync(caminho, "utf-8");

    try {
      db.exec(sql);
      registrarMigration(arquivo);
      console.log(`  ✔  ${arquivo}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  Erro em ${arquivo}: ${msg}`);
      throw err; // aborta tudo em caso de erro
    }
  }

  console.log(`\n✅ ${pendentes.length} migration(s) aplicada(s) com sucesso.\n`);
}

// Executar diretamente: ts-node src/db/migrate.ts
if (require.main === module) {
  // Inicializa variáveis de ambiente se necessário
  console.log(`DB Path: ${env.db.path}`);
  try {
    runMigrations();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}
