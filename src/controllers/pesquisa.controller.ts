import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { pesquisaModel } from "../models/pesquisa.model";

const router = Router();

router.post(
  "/",
  [body("nota").isInt({ min: 1, max: 5 })],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: errors.array().map((e) => e.msg) });
      return;
    }
    res.status(201).json({ sucesso: true, dados: await pesquisaModel.criar(req.body, req.ip) });
  }
);

router.get("/", autenticar, exigirPermissao("pesquisa-admin"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await pesquisaModel.listarRecentes() });
});

export default router;
