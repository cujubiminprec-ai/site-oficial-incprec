import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { formulariosModel } from "../models/formularios.model";

const router = Router();

router.post(
  "/",
  [body("formularioNome").optional().isString()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: errors.array().map((e) => e.msg) });
      return;
    }
    res.status(201).json({ sucesso: true, dados: await formulariosModel.criar(req.body, req.ip) });
  }
);

router.get("/admin", autenticar, exigirPermissao("contato-admin"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await formulariosModel.listarRecentes() });
});

router.patch("/admin/:id/lida", autenticar, exigirPermissao("contato-admin"), async (req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await formulariosModel.marcarComoLido(req.params.id) });
});

export default router;
