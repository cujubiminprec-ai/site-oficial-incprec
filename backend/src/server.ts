import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";
import fs from "fs";

import env from "./config/env";
import { verificarConexao } from "./config/database";
import { runMigrations } from "./db/migrate";
import rotas from "./routes/index";

const app = express();

// Trust proxy - necessario quando rodando atras do Nginx/reverse proxy
app.set("trust proxy", 1);

// ============================================================
// Segurança
// ============================================================
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const permitidos = [
      env.FRONTEND_URL,
      "http://localhost:3032",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://localhost:4174",
      "http://localhost:3000",
      "http://localhost:80",
      "http://localhost",
    ];
    if (!origin || permitidos.some((p) => origin === p || origin.startsWith(p))) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting global
app.use(rateLimit({
  windowMs:        env.rateLimit.windowMs,
  max:             env.rateLimit.maxRequests,
  message:         { sucesso: false, mensagem: "Muitas requisições. Tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// ============================================================
// Parsers
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// Logs
// ============================================================
app.use(morgan(env.logLevel));

// ============================================================
// Arquivos estáticos (uploads)
// ============================================================
const uploadsPath = path.resolve(env.upload.path);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

// ============================================================
// Rotas
// ============================================================
app.use("/api", rotas);

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({
    status:     "ok",
    versao:     "1.0.0",
    ambiente:   env.NODE_ENV,
    timestamp:  new Date().toISOString(),
    db:         "SQLite",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status:     "ok",
    versao:     "1.0.0",
    ambiente:   env.NODE_ENV,
    timestamp:  new Date().toISOString(),
    db:         "SQLite",
  });
});

// Rota não encontrada
app.use((_req, res) => {
  res.status(404).json({ sucesso: false, mensagem: "Rota não encontrada." });
});

// Handler de erros global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Erro não tratado:", err.message);
  res.status(500).json({
    sucesso: false,
    mensagem: env.isDev ? err.message : "Erro interno do servidor.",
  });
});

// ============================================================
// Iniciar servidor
// ============================================================
async function iniciar(): Promise<void> {
  try {
    // 1. Executa migrations automaticamente
    runMigrations();

    // 2. Verifica conexão
    await verificarConexao();

    // 3. Inicia servidor HTTP
    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`\n🚀 INPREC Backend rodando`);
      console.log(`   API:      http://localhost:${env.PORT}/api`);
      console.log(`   Health:   http://localhost:${env.PORT}/health`);
      console.log(`   Uploads:  http://localhost:${env.PORT}/uploads`);
      console.log(`   Ambiente: ${env.NODE_ENV}`);
      console.log(`   Banco:    SQLite — ${env.db.path}\n`);
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Falha ao iniciar servidor:", msg);
    process.exit(1);
  }
}

iniciar();

export default app;
// Reload triggered to apply .env changes.
