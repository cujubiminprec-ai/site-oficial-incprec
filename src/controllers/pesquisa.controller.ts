import { Router, Request, Response } from "express";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { pesquisaModel } from "../models/pesquisa.model";

const router = Router();

// POST /api/pesquisa  (público — envia resposta)
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { nota, nome, email, servico, comentario, ratings } = req.body ?? {};

    const ratingsObj = ratings && typeof ratings === "object" && !Array.isArray(ratings)
      ? (ratings as Record<string, number>)
      : null;

    const notaNum = nota !== undefined && nota !== null && String(nota).trim() !== ""
      ? Number(nota) : null;

    const mediaRatings = ratingsObj
      ? (() => {
          const vals = Object.values(ratingsObj).map(Number).filter((v) => !Number.isNaN(v) && v >= 1 && v <= 5);
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        })()
      : null;

    const notaFinal = notaNum ?? (mediaRatings !== null ? Math.round(mediaRatings * 10) / 10 : null);

    if (notaFinal === null || notaFinal < 1 || notaFinal > 5) {
      res.status(400).json({ sucesso: false, mensagem: "Avalie pelo menos um critério para enviar a pesquisa." });
      return;
    }

    const resultado = await pesquisaModel.criar(
      { nota: notaFinal, nome, email, servico, comentario, ratings: ratingsObj },
      req.ip
    );
    res.status(201).json({ sucesso: true, dados: resultado });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao registrar avaliação." });
  }
});

// GET /api/pesquisa/resumo  (público — estatísticas agregadas, sem dados pessoais)
router.get("/resumo", async (_req: Request, res: Response): Promise<void> => {
  try {
    const resumo = await pesquisaModel.resumoPublico();
    res.json({ sucesso: true, dados: resumo });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar resumo." });
  }
});

// GET /api/pesquisa  (admin)
router.get("/", autenticar, exigirPermissao("pesquisa-admin"), async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ sucesso: true, dados: await pesquisaModel.listarRecentes() });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar pesquisas." });
  }
});

export default router;
