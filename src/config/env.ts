import dotenv from "dotenv";
import path from "path";

const envPath = process.env.ENV_PATH || path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

function opcional(nome: string, padrao: string): string {
  return process.env[nome] ?? padrao;
}

const nodeEnv = opcional("APP_NODE_ENV", opcional("NODE_ENV", "development"));

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(opcional("PORT", "3001"), 10),
  API_URL: opcional("API_URL", "http://localhost:3001"),
  FRONTEND_URL: opcional("FRONTEND_URL", "http://localhost:5173"),

  db: {
    client: opcional("DB_CLIENT", process.env.DB_TYPE ?? "mysql").toLowerCase(),
    host: opcional("DB_HOST", "127.0.0.1"),
    port: parseInt(opcional("DB_PORT", "3306"), 10),
    name: opcional("DB_NAME", "inprec"),
    user: opcional("DB_USER", "inprec"),
    password: opcional("DB_PASSWORD", ""),
    ssl: opcional("DB_SSL", "false") === "true",
    connectionLimit: parseInt(opcional("DB_CONNECTION_LIMIT", "10"), 10),
  },

  jwt: {
    secret: opcional("JWT_SECRET", "dev_secret_min_32_chars_change_this!!"),
    expiresIn: opcional("JWT_EXPIRES_IN", "8h"),
    refreshExpires: opcional("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  upload: {
    path: opcional("UPLOAD_PATH", path.resolve(process.cwd(), "public/uploads")),
    maxSizeMb: parseInt(opcional("UPLOAD_MAX_SIZE_MB", "50"), 10),
    imagensTipos: opcional("ALLOWED_IMAGE_TYPES", "image/jpeg,image/png,image/webp").split(","),
    docsTipos: opcional("ALLOWED_DOC_TYPES", "application/pdf").split(","),
  },

  rateLimit: {
    windowMs: parseInt(opcional("RATE_LIMIT_WINDOW_MS", "900000"), 10),
    maxRequests: parseInt(opcional("RATE_LIMIT_MAX_REQUESTS", "200"), 10),
  },

  logLevel: opcional("LOG_LEVEL", "dev"),
  isProd: nodeEnv === "production",
  isDev: nodeEnv === "development",
};

export default env;
