import { Router } from "express";
import authRoutes          from "./auth.routes";
import noticiasRoutes      from "./noticias.routes";
import eventosRoutes       from "./eventos.routes";
import gestoresRoutes      from "./gestores.routes";
import paginasRoutes       from "./paginas.routes";
import transparenciaRoutes from "./transparencia.routes";
import configuracoesRoutes from "./configuracoes.routes";
import ouvidoriaRoutes     from "./ouvidoria.routes";
import laiRoutes           from "./lai.routes";
import uploadRoutes        from "./upload.routes";
import conteudoRoutes      from "./conteudo.routes";

const router = Router();

// ============================================================
// Mapeamento de rotas
// ============================================================
router.use("/auth",          authRoutes);
router.use("/noticias",      noticiasRoutes);
router.use("/eventos",       eventosRoutes);
router.use("/gestores",      gestoresRoutes);
router.use("/paginas",       paginasRoutes);
router.use("/transparencia", transparenciaRoutes);
router.use("/configuracoes", configuracoesRoutes);
router.use("/ouvidoria",     ouvidoriaRoutes);
router.use("/lai",           laiRoutes);
router.use("/upload",        uploadRoutes);
router.use("/conteudo",      conteudoRoutes);

// ============================================================
// Listar todos os endpoints (dev)
// ============================================================
router.get("/", (_req, res) => {
  res.json({
    sucesso: true,
    mensagem: "INPREC API v1.0",
    endpoints: {
      auth:          ["POST /api/auth/login", "POST /api/auth/refresh", "GET /api/auth/me", "POST /api/auth/logout"],
      noticias:      ["GET /api/noticias", "GET /api/noticias/:slug", "POST /api/noticias", "PUT /api/noticias/:id", "DELETE /api/noticias/:id"],
      eventos:       ["GET /api/eventos", "GET /api/eventos/:id", "POST /api/eventos/:id/inscrever", "POST /api/eventos", "PUT /api/eventos/:id", "DELETE /api/eventos/:id"],
      gestores:      ["GET /api/gestores", "GET /api/gestores/:id", "POST /api/gestores", "PUT /api/gestores/:id", "DELETE /api/gestores/:id"],
      paginas:       ["GET /api/paginas", "GET /api/paginas/:pageId/blocos", "PUT /api/paginas/:pageId/blocos", "PUT /api/paginas/:id"],
      transparencia: ["GET /api/transparencia", "GET /api/transparencia/financas", "GET /api/transparencia/legislacao", "POST /api/transparencia", "DELETE /api/transparencia/:id"],
      configuracoes: ["GET /api/configuracoes", "PUT /api/configuracoes", "GET /api/configuracoes/banner", "PUT /api/configuracoes/banner"],
      ouvidoria:     ["POST /api/ouvidoria", "GET /api/ouvidoria/consultar/:protocolo", "GET /api/ouvidoria", "GET /api/ouvidoria/:id", "PATCH /api/ouvidoria/:id/responder", "PATCH /api/ouvidoria/:id/status"],
      lai:           ["POST /api/lai", "GET /api/lai/consultar/:protocolo", "GET /api/lai", "PATCH /api/lai/:id/responder", "PATCH /api/lai/:id/status"],
      upload:        ["POST /api/upload", "POST /api/upload/multiplo", "GET /api/upload", "DELETE /api/upload/:id"],
      conteudo:      ["GET /api/conteudo/slides", "PUT /api/conteudo/slides/bulk", "GET /api/conteudo/faq", "PUT /api/conteudo/faq/bulk", "GET /api/conteudo/cursos", "PUT /api/conteudo/cursos/bulk"],
    },
  });
});

export default router;
