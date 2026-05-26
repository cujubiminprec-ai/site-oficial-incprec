import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { analyticsModel } from "../models/analytics.model";

const router = Router();

router.post(
  "/track",
  [body("tipo").isIn(["page_view", "click"]), body("path").isString().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ sucesso: false, erros: errors.array().map((e) => e.msg) });
      return;
    }
    res.status(201).json({ sucesso: true, dados: await analyticsModel.track(req.body, req.ip, req.headers["user-agent"]) });
  }
);

router.get("/admin", autenticar, exigirPermissao("analytics"), async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await analyticsModel.resumoAdmin() });
});

export default router;
