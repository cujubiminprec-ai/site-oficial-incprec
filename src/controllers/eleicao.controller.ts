import { Router, Request, Response } from "express";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";
import { eleicaoModel } from "../models/eleicao.model";

const router = Router();

router.get("/config", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await eleicaoModel.obterConfig() });
});

router.put("/config", autenticar, exigirPermissao("eleicao"), auditoria("editar", "eleicao"), async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await eleicaoModel.salvarConfig(req.body) });
});

router.get("/votacao-config", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await eleicaoModel.obterVotacaoConfig() });
});

router.put("/votacao-config", autenticar, exigirPermissao("votacao"), auditoria("editar", "votacao"), async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await eleicaoModel.salvarVotacaoConfig(req.body) });
});

router.get("/candidatos", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await eleicaoModel.listarCandidatosPublicos() });
});

router.get("/candidatos/admin", autenticar, exigirPermissao("votacao"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await eleicaoModel.listarCandidatosAdmin() });
});

router.put("/candidatos/bulk", autenticar, exigirPermissao("votacao"), auditoria("editar", "votacao"), async (req: AuthRequest, res: Response): Promise<void> => {
  const candidatos = Array.isArray(req.body?.candidatos) ? req.body.candidatos : [];
  res.json({ sucesso: true, dados: await eleicaoModel.salvarCandidatos(candidatos) });
});

router.post("/candidatura", async (req: Request, res: Response): Promise<void> => {
  res.status(201).json({ sucesso: true, dados: await eleicaoModel.registrarCandidatura(req.body) });
});

export default router;
