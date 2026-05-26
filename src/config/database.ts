import mysql, {
  type FieldPacket,
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import env from "./env";

type DbExecutor = Pool | PoolConnection;

const dbClient = env.db.client;
if (dbClient !== "mysql") {
  throw new Error(`DB_CLIENT=${dbClient} nao e suportado. Configure DB_CLIENT=mysql.`);
}

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  multipleStatements: true,
  charset: "utf8mb4",
  timezone: "Z",
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
});

function serializeParam(value: unknown): unknown {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === undefined) return null;
  if (Array.isArray(value) || (value !== null && typeof value === "object" && !(value instanceof Date))) {
    return JSON.stringify(value);
  }
  return value;
}

function parseRow<T>(row: Record<string, unknown>): T {
  const parsed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      typeof value === "string" &&
      ((value.startsWith("[") && value.endsWith("]")) || (value.startsWith("{") && value.endsWith("}")))
    ) {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  }
  return parsed as T;
}

function normalizeSql(sql: string): string {
  return sql
    .replace(/datetime\('now'\)/gi, "NOW()")
    .replace(/INSERT\s+OR\s+IGNORE/gi, "INSERT IGNORE")
    .replace(/"order"/g, "`order`")
    .replace(/\bTRUE\b/gi, "1")
    .replace(/\bFALSE\b/gi, "0")
    .replace(/"order"/g, "`order`")
    .replace(/\bILIKE\b/gi, "LIKE");
}

function bindParams(sql: string, params: unknown[] = []): { sql: string; params: unknown[] } {
  const serialized = params.map(serializeParam);
  const ordered: unknown[] = [];
  const boundSql = normalizeSql(sql).replace(/\$(\d+)/g, (_match, rawIndex) => {
    const index = Number(rawIndex) - 1;
    ordered.push(serialized[index]);
    return "?";
  });

  return {
    sql: boundSql,
    params: ordered.length > 0 ? ordered : serialized,
  };
}

function isResultSetHeader(value: unknown): value is ResultSetHeader {
  return Boolean(value && typeof value === "object" && "affectedRows" in value);
}

function isSelect(sql: string): boolean {
  const trimmed = sql.trim().toUpperCase();
  return trimmed.startsWith("SELECT") || trimmed.startsWith("WITH") || trimmed.startsWith("SHOW");
}

function stripReturning(sql: string): { sql: string; returning: string | null } {
  const match = sql.match(/\s+RETURNING\s+([\s\S]+)$/i);
  if (!match) return { sql, returning: null };
  return {
    sql: sql.slice(0, match.index).trim(),
    returning: match[1].trim(),
  };
}

function tableFromInsert(sql: string): string | null {
  return sql.match(/INSERT\s+INTO\s+`?([a-zA-Z0-9_]+)`?/i)?.[1] ?? null;
}

function tableFromUpdate(sql: string): string | null {
  return sql.match(/UPDATE\s+`?([a-zA-Z0-9_]+)`?/i)?.[1] ?? null;
}

function whereIdParamIndex(sql: string): number | null {
  const match = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
  return match ? Number(match[1]) - 1 : null;
}

async function selectReturning<T extends Record<string, unknown>>(
  executor: DbExecutor,
  originalSql: string,
  params: unknown[] | undefined,
  result: ResultSetHeader,
): Promise<T | null> {
  const table = tableFromInsert(originalSql) ?? tableFromUpdate(originalSql);
  if (!table) return null;

  const idIndex = whereIdParamIndex(originalSql);
  const id = idIndex !== null ? params?.[idIndex] : result.insertId;
  if (id === undefined || id === null || id === 0) return null;

  const [rows] = await executor.execute<RowDataPacket[]>(`SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`, [id] as never);
  return rows[0] ? parseRow<T>(rows[0] as Record<string, unknown>) : null;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
  executor: DbExecutor = pool,
): Promise<{ rows: T[]; rowCount: number; insertId?: number }> {
  const { sql: sqlWithoutReturning } = stripReturning(sql);
  const bound = bindParams(sqlWithoutReturning, params);
  const [result] = await executor.execute<RowDataPacket[] | ResultSetHeader>(bound.sql, bound.params as never);

  if (Array.isArray(result)) {
    const rows = result.map((row) => parseRow<T>(row as Record<string, unknown>));
    return { rows, rowCount: rows.length };
  }

  if (isResultSetHeader(result)) {
    return { rows: [], rowCount: result.affectedRows, insertId: result.insertId };
  }

  return { rows: [], rowCount: 0 };
}

export async function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
  executor: DbExecutor = pool,
): Promise<T | null> {
  const returning = stripReturning(sql);
  const bound = bindParams(returning.sql, params);
  const [result] = await executor.execute<RowDataPacket[] | ResultSetHeader>(bound.sql, bound.params as never);

  if (Array.isArray(result)) {
    return result[0] ? parseRow<T>(result[0] as Record<string, unknown>) : null;
  }

  if (returning.returning && isResultSetHeader(result)) {
    return selectReturning<T>(executor, sql, params, result);
  }

  return null;
}

export async function queryPaginado<T extends Record<string, unknown> = Record<string, unknown>>(
  sqlBase: string,
  params: unknown[],
  pagina: number,
  limite: number,
): Promise<{ itens: T[]; total: number }> {
  const safePagina = Math.max(1, Number.isFinite(pagina) ? Math.trunc(pagina) : 1);
  const safeLimite = Math.min(100, Math.max(1, Number.isFinite(limite) ? Math.trunc(limite) : 12));
  const offset = (safePagina - 1) * safeLimite;
  const countResult = await query<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM (${sqlBase}) AS _count`, params);
  const dataResult = await query<T>(`${sqlBase} LIMIT ${safeLimite} OFFSET ${offset}`, params);

  return {
    itens: dataResult.rows,
    total: Number(countResult.rows[0]?.cnt ?? 0),
  };
}

export async function execSql(sql: string, executor: DbExecutor = pool): Promise<void> {
  const converted = convertMigrationSql(sql);
  if (!converted.trim()) return;
  await executor.query(converted);
}

export async function runInTransaction<T>(fn: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function convertMigrationSql(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, "INT PRIMARY KEY AUTO_INCREMENT")
    .replace(/\bTEXT\s+NOT\s+NULL\s+DEFAULT\s+\(datetime\('now'\)\)/gi, "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
    .replace(/\bTEXT\s+DEFAULT\s+\(datetime\('now'\)\)/gi, "DATETIME DEFAULT CURRENT_TIMESTAMP")
    .replace(/\bTEXT\s+NOT\s+NULL\s+DEFAULT\s+'(\[\]|\{\})'/gi, "LONGTEXT NOT NULL DEFAULT ('$1')")
    .replace(/\bTEXT\s+DEFAULT\s+'(\[\]|\{\})'/gi, "LONGTEXT DEFAULT ('$1')")
    .replace(/\bTEXT\s+NOT\s+NULL\s+DEFAULT\s+'([^']*)'/gi, "VARCHAR(255) NOT NULL DEFAULT '$1'")
    .replace(/\bTEXT\s+DEFAULT\s+'([^']*)'/gi, "VARCHAR(255) DEFAULT '$1'")
    .replace(/\bTEXT\s+NOT\s+NULL/gi, "VARCHAR(255) NOT NULL")
    .replace(/\bTEXT\b/gi, "VARCHAR(255)")
    .replace(
      /\b(permissoes|dados_anteriores|dados_novos|tags|itens|colunas|conteudo|descricao|mensagem|resposta|campos|dados|requisitos|documentos|slideImages)\s+VARCHAR\(255\)/gi,
      "$1 LONGTEXT",
    )
    .replace(/\bINTEGER\b/gi, "INT")
    .replace(/DEFAULT\s+\(datetime\('now'\)\)/gi, "DEFAULT CURRENT_TIMESTAMP")
    .replace(/datetime\('now'\)/gi, "NOW()")
    .replace(/INSERT\s+OR\s+IGNORE/gi, "INSERT IGNORE")
    .replace(/"order"/g, "`order`")
    .replace(/\bTRUE\b/gi, "1")
    .replace(/\bFALSE\b/gi, "0")
    .replace(/CHECK\s*\([^()]*IN\s*\([^)]*\)\s*\)/gis, "")
    .replace(/CHECK\s*\([^)]*\)/gis, "")
    .replace(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+([^\s]+)\s+ON/gi, "CREATE INDEX $1 ON")
    .replace(/,\s*\)/g, "\n)");
}

export async function verificarConexao(): Promise<void> {
  await pool.query("SELECT 1");
  console.log(`MySQL conectado - ${env.db.host}:${env.db.port}/${env.db.name}`);
}

export async function fecharConexao(): Promise<void> {
  await pool.end();
}

export { pool, type DbExecutor, type FieldPacket };
export const db = pool;
export default pool;
