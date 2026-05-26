import { Router, Request, Response } from "express";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";
import { conteudoModel, CursoPayload, FaqPayload, SlidePayload } from "../models/conteudo.model";

const router = Router();

router.get("/slides", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await conteudoModel.listarSlidesPublicos() });
});

router.get("/slides/admin", autenticar, exigirPermissao("slides"), async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await conteudoModel.listarSlidesAdmin() });
});

router.put("/slides/bulk", autenticar, exigirPermissao("slides"), auditoria("atualizar", "slides"), async (req: AuthRequest, res: Response): Promise<void> => {
  const slides = Array.isArray(req.body?.slides) ? (req.body.slides as SlidePayload[]) : [];
  res.json({ sucesso: true, dados: await conteudoModel.salvarSlides(slides) });
});

router.get("/faq", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await conteudoModel.listarFaqPublico() });
});

router.get("/faq/admin", autenticar, exigirPermissao("faq"), async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await conteudoModel.listarFaqAdmin() });
});

router.put("/faq/bulk", autenticar, exigirPermissao("faq"), auditoria("atualizar", "faq"), async (req: AuthRequest, res: Response): Promise<void> => {
  const faqs = Array.isArray(req.body?.faqs) ? (req.body.faqs as FaqPayload[]) : [];
  res.json({ sucesso: true, dados: await conteudoModel.salvarFaq(faqs) });
});

router.get("/cursos", async (_req: Request, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await conteudoModel.listarCursosPublicos() });
});

router.get("/cursos/admin", autenticar, exigirPermissao("cursos"), async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ sucesso: true, dados: await conteudoModel.listarCursosAdmin() });
});

router.post("/cursos/:id/inscrever", async (req: Request, res: Response): Promise<void> => {
  try {
    const inscricao = await conteudoModel.inscreverCurso(req.params.id, req.body);
    if (inscricao && typeof inscricao === "object" && "erro" in inscricao) {
      const erro = inscricao as { status: number; erro: string };
      res.status(erro.status).json({ sucesso: false, mensagem: erro.erro });
      return;
    }
    res.status(201).json({ sucesso: true, dados: inscricao });
  } catch (error) {
    const mensagem = error instanceof Error && error.message.includes("UNIQUE")
      ? "Este e-mail já está inscrito neste curso."
      : "Erro ao realizar inscrição.";
    res.status(400).json({ sucesso: false, mensagem });
  }
});

router.put("/cursos/bulk", autenticar, exigirPermissao("cursos"), auditoria("atualizar", "cursos"), async (req: AuthRequest, res: Response): Promise<void> => {
  const cursos = Array.isArray(req.body?.cursos) ? (req.body.cursos as CursoPayload[]) : [];
  res.json({ sucesso: true, dados: await conteudoModel.salvarCursos(cursos) });
});

export default router;
