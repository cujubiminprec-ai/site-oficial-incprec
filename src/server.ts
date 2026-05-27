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
import rotas from "./controllers";
import { criarPastas } from "./middleware/upload";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      scriptSrcElem: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      workerSrc: ["'self'", "blob:", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      frameSrc: ["'self'", "https://docs.google.com", "https://drive.google.com", "https://view.officeapps.live.com", "https:"],
      connectSrc: ["'self'", "blob:", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
}));

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
      callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: { sucesso: false, mensagem: "Muitas requisicoes. Tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/auth/login" || req.path === "/health" || req.path === "/api/health",
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morgan(env.logLevel));

const uploadsPath = path.resolve(env.upload.path);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
criarPastas();
app.use("/uploads", express.static(uploadsPath));

app.use("/api", rotas);

app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    status: "ok",
    versao: "1.0.0",
    ambiente: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db: env.db.client,
    modo: "monolith",
  });
});

const clientDistPath = path.resolve(process.cwd(), "out");
if (fs.existsSync(path.join(clientDistPath, "index.html"))) {
  app.use(express.static(clientDistPath, { index: false }));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ sucesso: false, mensagem: "Rota nao encontrada." });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Erro nao tratado:", err.message);
  res.status(500).json({
    sucesso: false,
    mensagem: env.isDev ? err.message : "Erro interno do servidor.",
  });
});

async function iniciar(): Promise<void> {
  try {
    await runMigrations();
    await verificarConexao();

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`\nINPREC monolito rodando`);
      console.log(`   App:      http://localhost:${env.PORT}`);
      console.log(`   API:      http://localhost:${env.PORT}/api`);
      console.log(`   Health:   http://localhost:${env.PORT}/health`);
      console.log(`   Uploads:  http://localhost:${env.PORT}/uploads`);
      console.log(`   Banco:    ${env.db.client.toUpperCase()} - ${env.db.host}:${env.db.port}/${env.db.name}\n`);
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Falha ao iniciar servidor:", msg);
    process.exit(1);
  }
}

iniciar();

export default app;
