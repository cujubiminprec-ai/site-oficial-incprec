import { Router, Request, Response } from "express";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";
import { servicosModel } from "../models/servicos.model";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await servicosModel.listarPublicos() });
});

router.get("/admin", autenticar, exigirPermissao("servicos"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await servicosModel.listarAdmin() });
});

router.post("/", autenticar, exigirPermissao("servicos"), auditoria("criar", "servicos"), async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(201).json({ sucesso: true, dados: await servicosModel.criar(req.body) });
});

router.put("/:id", autenticar, exigirPermissao("servicos"), auditoria("editar", "servicos"), async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await servicosModel.atualizar(req.params.id, req.body) });
});

router.delete("/:id", autenticar, exigirPermissao("servicos"), auditoria("excluir", "servicos"), async (req: Request, res: Response): Promise<void> => {
  await servicosModel.remover(req.params.id);
  res.json({ sucesso: true });
});

export default router;
