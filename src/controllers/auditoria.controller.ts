import { Router, Request, Response } from "express";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoriaModel } from "../models/auditoria.model";

const router = Router();

router.get("/", autenticar, exigirPermissao("auditoria"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await auditoriaModel.listarRecentes() });
});

router.delete("/", autenticar, exigirPermissao("auditoria"), async (_req: Request, res: Response): Promise<void> => {
  await auditoriaModel.limpar();
  res.json({ sucesso: true, mensagem: "Auditoria limpa." });
});

export default router;
