import { Router, Request, Response } from "express";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";
import { menuModel, MenuPayload } from "../models/menu.model";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await menuModel.listar() });
});

router.get("/admin", autenticar, exigirPermissao("menu"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await menuModel.listar() });
});

router.put("/bulk", autenticar, exigirPermissao("menu"), auditoria("atualizar", "menu"), async (req: AuthRequest, res: Response): Promise<void> => {
  const itens = Array.isArray(req.body?.itens) ? req.body.itens : Array.isArray(req.body?.menus) ? req.body.menus : [];
  res.json({ sucesso: true, dados: await menuModel.salvarBulk(itens as MenuPayload[]) });
});

export default router;
