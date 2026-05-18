import BetterSqlite3, { type Database } from "better-sqlite3";
import fs from "fs";
import path from "path";
import env from "./env";

// Garante que a pasta de dados existe
const dataDir = path.dirname(env.db.path);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db: Database = new BetterSqlite3(env.db.path, {
  verbose: env.isDev ? (msg?: unknown) => console.log(`🔍 SQLite: ${String(msg)}`) : undefined,
});

// Otimizações de performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -64000"); // 64MB cache
db.pragma("temp_store = MEMORY");

// ============================================================
// Conversor PostgreSQL → SQLite
// ============================================================
function convertSql(sql: string): string {
  return sql
    .replace(/\$(\d+)/g, "?")
    .replace(/NOW\(\)/gi, "datetime('now')")
    .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')")
    .replace(/ILIKE/gi, "LIKE");
}

// Serializa parâmetros: arrays → JSON string, objetos → JSON string
function serializeParams(params?: unknown[]): unknown[] {
  if (!params) return [];
  return params.map((p) => {
    if (Array.isArray(p) || (p !== null && typeof p === "object")) {
      return JSON.stringify(p);
    }
    return p;
  });
}

// Auto-parse colunas JSON (arrays, objetos armazenados como TEXT)
function parseRow<T>(row: Record<string, unknown>): T {
  const parsed: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    if (
      typeof val === "string" &&
      ((val.startsWith("[") && val.endsWith("]")) ||
        (val.startsWith("{") && val.endsWith("}")))
    ) {
      try {
        parsed[key] = JSON.parse(val);
      } catch {
        parsed[key] = val;
      }
    } else {
      parsed[key] = val;
    }
  }
  return parsed as T;
}

function isReadQuery(sql: string): boolean {
  const trimmed = sql.trim().toUpperCase();
  return (
    trimmed.startsWith("SELECT") ||
    trimmed.startsWith("WITH") ||
    trimmed.includes(" RETURNING ")
  );
}

// ============================================================
// Interface compatível com o padrão pg (QueryResult)
// ============================================================
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const converted   = convertSql(sql);
    const serialized  = serializeParams(params);
    const stmt = db.prepare(converted);
    if (isReadQuery(sql)) {
      const rows = (stmt.all(serialized) as Record<string, unknown>[]).map((r) =>
        parseRow<T>(r)
      );
      return { rows, rowCount: rows.length };
    }
    const info = stmt.run(serialized);
    return { rows: [], rowCount: info.changes };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ SQLite error:", msg, "\nSQL:", sql);
    throw err;
  }
}

// Retorna uma linha ou null
export async function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  try {
    const converted  = convertSql(sql);
    const serialized = serializeParams(params);
    const stmt = db.prepare(converted);
    const row = stmt.get(serialized) as Record<string, unknown> | undefined;
    return row ? parseRow<T>(row) : null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ SQLite queryOne error:", msg, "\nSQL:", sql);
    throw err;
  }
}

// Paginação compatível com pg
export async function queryPaginado<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  sqlBase: string,
  params: unknown[],
  pagina: number,
  limite: number
): Promise<{ itens: T[]; total: number }> {
  const offset     = (pagina - 1) * limite;
  const serialized = serializeParams(params);

  const countSql = convertSql(
    `SELECT COUNT(*) as cnt FROM (${sqlBase}) AS _count`
  );
  const countRow = db
    .prepare(countSql)
    .get(serialized) as { cnt: number } | undefined;
  const total = countRow?.cnt ?? 0;

  const dataSql = convertSql(`${sqlBase} LIMIT ? OFFSET ?`);
  const rows = (
    db.prepare(dataSql).all([...serialized, limite, offset]) as Record<
      string,
      unknown
    >[]
  ).map((r) => parseRow<T>(r));

  return { itens: rows, total };
}

// Executa SQL direto (para migrations)
export function execSync(sql: string): void {
  db.exec(sql);
}

// Transação síncrona
export function runInTransaction<T>(fn: () => T): T {
  return db.transaction(fn)();
}

// Verificar conexão
export async function verificarConexao(): Promise<void> {
  db.prepare("SELECT 1").get();
  console.log(`✅ SQLite conectado — ${env.db.path}`);
}

export { db };
export default db;
