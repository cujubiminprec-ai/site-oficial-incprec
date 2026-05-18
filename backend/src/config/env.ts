import dotenv from "dotenv";
import path from "path";

// Tenta carregar .env do diretorio do projeto
const envPath = process.env.ENV_PATH || path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

function opcional(nome: string, padrao: string): string {
  return process.env[nome] ?? padrao;
}

export const env = {
  NODE_ENV:     opcional("NODE_ENV", "development"),
  PORT:         parseInt(opcional("PORT", "3001"), 10),
  API_URL:      opcional("API_URL", "http://localhost:3001"),
  FRONTEND_URL: opcional("FRONTEND_URL", "http://localhost:5173"),

  db: {
    // Caminho do arquivo SQLite (relativo ao diretório do projeto backend)
    path: opcional("DB_PATH", path.resolve(process.cwd(), "data/inprec.db")),
  },

  jwt: {
    secret:         opcional("JWT_SECRET", "dev_secret_min_32_chars_change_this!!"),
    expiresIn:      opcional("JWT_EXPIRES_IN", "8h"),
    refreshExpires: opcional("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  upload: {
    path:         opcional("UPLOAD_PATH", path.resolve(process.cwd(), "../public/uploads")),
    maxSizeMb:    parseInt(opcional("UPLOAD_MAX_SIZE_MB", "50"), 10),
    imagensTipos: opcional("ALLOWED_IMAGE_TYPES", "image/jpeg,image/png,image/webp").split(","),
    docsTipos:    opcional("ALLOWED_DOC_TYPES", "application/pdf").split(","),
  },

  rateLimit: {
    windowMs:    parseInt(opcional("RATE_LIMIT_WINDOW_MS", "900000"), 10),
    maxRequests: parseInt(opcional("RATE_LIMIT_MAX_REQUESTS", "200"), 10),
  },

  logLevel: opcional("LOG_LEVEL", "dev"),

  isProd: opcional("NODE_ENV", "development") === "production",
  isDev:  opcional("NODE_ENV", "development") === "development",
};

export default env;
