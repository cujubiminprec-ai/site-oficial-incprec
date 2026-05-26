import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";
import { usuariosModel } from "../models/usuarios.model";

const router = Router();

router.get("/", autenticar, exigirPermissao("usuarios"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await usuariosModel.listar() });
});

router.post(
  "/",
  autenticar,
  exigirPermissao("usuarios"),
  [body("nome").isString().notEmpty(), body("email").isEmail()],
  auditoria("criar", "usuarios"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: errors.array().map((e) => e.msg) });
      return;
    }
    res.status(201).json({ sucesso: true, dados: await usuariosModel.criar(req.body) });
  }
);

router.put("/:id", autenticar, exigirPermissao("usuarios"), auditoria("editar", "usuarios"), async (req: AuthRequest, res: Response): Promise<void> => {
  const atualizado = await usuariosModel.atualizar(req.params.id, req.body);
  if (!atualizado) {
    res.status(404).json({ sucesso: false, mensagem: "Usuario nao encontrado." });
    return;
  }
  res.json({ sucesso: true, dados: atualizado });
});

router.delete("/:id", autenticar, exigirPermissao("usuarios"), auditoria("excluir", "usuarios"), async (req: Request, res: Response): Promise<void> => {
  await usuariosModel.remover(req.params.id);
  res.json({ sucesso: true });
});

export default router;
