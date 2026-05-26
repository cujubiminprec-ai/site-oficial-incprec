import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { AuthRequest } from "../types";
import { contatoModel } from "../models/contato.model";

const router = Router();

router.post(
  "/",
  [body("nome").isString().notEmpty(), body("email").isEmail(), body("mensagem").isString().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: errors.array().map((e) => e.msg) });
      return;
    }
    res.status(201).json({ sucesso: true, dados: await contatoModel.criar(req.body, req.ip) });
  }
);

router.get("/", autenticar, exigirPermissao("contato-admin"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await contatoModel.listarRecentes() });
});

router.patch("/:id/status", autenticar, exigirPermissao("contato-admin"), async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await contatoModel.atualizarStatus(req.params.id, req.body.status) });
});

export default router;
