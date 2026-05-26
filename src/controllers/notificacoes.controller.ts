import { Router, Request, Response } from "express";
import { autenticar } from "../middleware/auth";
import { notificacoesModel } from "../models/notificacoes.model";

const router = Router();

router.get("/", autenticar, async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await notificacoesModel.listarRecentes() });
});

router.patch("/lidas", autenticar, async (_req: Request, res: Response): Promise<void> => {
  await notificacoesModel.marcarTodasComoLidas();
  res.json({ sucesso: true });
});

router.patch("/:id/lida", autenticar, async (req: Request, res: Response): Promise<void> => {
  await notificacoesModel.marcarComoLida(req.params.id);
  res.json({ sucesso: true });
});

router.delete("/:id", autenticar, async (req: Request, res: Response): Promise<void> => {
  await notificacoesModel.remover(req.params.id);
  res.json({ sucesso: true });
});

router.delete("/", autenticar, async (_req: Request, res: Response): Promise<void> => {
  await notificacoesModel.limpar();
  res.json({ sucesso: true });
});

export default router;
