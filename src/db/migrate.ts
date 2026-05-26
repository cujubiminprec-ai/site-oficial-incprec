import fs from "fs";
import path from "path";
import { execSql, query, queryOne } from "../config/database";
import env from "../config/env";

const MIGRATIONS_DIRS = [
  path.resolve(__dirname, "migrations"),
  path.resolve(process.cwd(), "src/db/migrations"),
  path.resolve(process.cwd(), "dist/db/migrations"),
];

async function inicializarTabelaMigrations(): Promise<void> {
  await execSql(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nome VARCHAR(255) NOT NULL UNIQUE,
      executado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function listarMigrationsExecutadas(): Promise<Set<string>> {
  const result = await query<{ nome: string }>("SELECT nome FROM _migrations");
  return new Set(result.rows.map((row) => row.nome));
}

function listarArquivosMigrations(): string[] {
  const migrationsDir = MIGRATIONS_DIRS.find((dir) => fs.existsSync(dir));
  if (!migrationsDir) {
    console.warn(`Pasta de migrations nao encontrada. Tentativas: ${MIGRATIONS_DIRS.join(", ")}`);
    return [];
  }
  return fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
}

function resolverMigrationPath(arquivo: string): string {
  const migrationsDir = MIGRATIONS_DIRS.find((dir) => fs.existsSync(path.join(dir, arquivo)));
  if (!migrationsDir) throw new Error(`Migration nao encontrada: ${arquivo}`);
  return path.join(migrationsDir, arquivo);
}

async function registrarMigration(nome: string): Promise<void> {
  await query("INSERT INTO _migrations (nome) VALUES ($1)", [nome]);
}

export async function runMigrations(): Promise<void> {
  console.log("\nIniciando migrations MySQL...");

  await inicializarTabelaMigrations();

  const executadas = await listarMigrationsExecutadas();
  const arquivos = listarArquivosMigrations();
  const pendentes = arquivos.filter((file) => !executadas.has(file));

  if (pendentes.length === 0) {
    console.log("Nenhuma migration pendente. Banco atualizado.\n");
    return;
  }

  for (const arquivo of pendentes) {
    const caminho = resolverMigrationPath(arquivo);
    const sql = fs.readFileSync(caminho, "utf-8");

    try {
      await execSql(sql);
      await registrarMigration(arquivo);
      console.log(`  OK ${arquivo}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERRO ${arquivo}: ${msg}`);
      throw err;
    }
  }

  const hasConfig = await queryOne("SELECT id FROM configuracoes_site WHERE id = 1");
  if (!hasConfig) {
    await query("INSERT INTO configuracoes_site (id) VALUES (1)");
  }

  console.log(`${pendentes.length} migration(s) aplicada(s) com sucesso.\n`);
}

if (require.main === module) {
  console.log(`Banco: ${env.db.host}:${env.db.port}/${env.db.name}`);
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
