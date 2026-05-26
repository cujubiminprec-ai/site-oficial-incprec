import { Router, Request, Response } from "express";
import { faqModel } from "../models/faq.model";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await faqModel.listarPublico() });
});

export default router;
