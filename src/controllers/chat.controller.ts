import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { query, queryOne } from "../config/database";
import { autenticar, exigirPermissao } from "../middleware/auth";
import { auditoria } from "../middleware/audit";
import { AuthRequest } from "../types";

const router = Router();

function respostaAutomatica(texto: string): string {
  const msg = texto.toLowerCase();
  if (msg.includes("aposent")) return "Recebemos sua dúvida sobre aposentadoria. Um atendente pode complementar a resposta pelo painel. Para iniciar análise, separe RG, CPF, comprovante de residência e documentos funcionais.";
  if (msg.includes("pensão") || msg.includes("pensao")) return "Recebemos sua dúvida sobre pensão. Informe o vínculo com o segurado e acompanhe os documentos necessários na área de serviços do site.";
  if (msg.includes("horário") || msg.includes("horario")) return "O atendimento do INPREC ocorre em horário comercial. Para confirmação do horário atualizado, consulte a página de contato ou aguarde um atendente.";
  if (msg.includes("ouvidoria")) return "Para manifestação formal, use a página de Ouvidoria. Este chat também ficou registrado para acompanhamento interno.";
  return "Mensagem recebida e registrada no atendimento online do INPREC. Se necessário, um operador responderá por aqui no painel administrativo.";
}

async function obterOuCriarConversa(sessionId: string | undefined, req: Request) {
  const sid = sessionId?.trim() || randomUUID();
  const existente = await queryOne("SELECT * FROM chat_conversas WHERE session_id = ?", [sid]);
  if (existente) return existente;
  await query(
    `INSERT INTO chat_conversas (session_id, ip_origem, user_agent, criado_em, atualizado_em)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [sid, req.ip ?? null, req.headers["user-agent"] ?? null]
  );
  return queryOne("SELECT * FROM chat_conversas WHERE session_id = ?", [sid]);
}

router.post("/conversas", async (req: Request, res: Response): Promise<void> => {
  try {
    const conversa = await obterOuCriarConversa(req.body?.sessionId, req);
    res.status(201).json({ sucesso: true, dados: { sessionId: conversa?.session_id, conversa } });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao iniciar chat." });
  }
});

router.get("/conversas/:sessionId/mensagens", async (req: Request, res: Response): Promise<void> => {
  try {
    const conversa = await queryOne("SELECT id FROM chat_conversas WHERE session_id = ?", [req.params.sessionId]);
    if (!conversa) { res.json({ sucesso: true, dados: [] }); return; }
    const mensagens = await query("SELECT id, conversa_id, origem, mensagem, criado_em FROM chat_mensagens WHERE conversa_id = ? ORDER BY criado_em ASC, id ASC", [conversa.id]);
    res.json({ sucesso: true, dados: mensagens.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar mensagens do chat." });
  }
});

router.post("/mensagens", async (req: Request, res: Response): Promise<void> => {
  const mensagem = String(req.body?.mensagem || "").trim();
  if (!mensagem) { res.status(400).json({ sucesso: false, mensagem: "Mensagem obrigatória." }); return; }
  try {
    const conversa = await obterOuCriarConversa(req.body?.sessionId, req);
    const conversaId = conversa?.id;
    await query("INSERT INTO chat_mensagens (conversa_id, origem, mensagem, criado_em) VALUES (?, 'visitante', ?, NOW())", [conversaId, mensagem]);
    const resposta = respostaAutomatica(mensagem);
    await query("INSERT INTO chat_mensagens (conversa_id, origem, mensagem, criado_em) VALUES (?, 'bot', ?, NOW())", [conversaId, resposta]);
    await query("UPDATE chat_conversas SET status = 'aberta', atualizado_em = NOW() WHERE id = ?", [conversaId]);
    const ultima = await query("SELECT id, conversa_id, origem, mensagem, criado_em FROM chat_mensagens WHERE conversa_id = ? ORDER BY id DESC LIMIT 2", [conversaId]);
    res.status(201).json({ sucesso: true, dados: { conversa, mensagem: ultima.rows[1], resposta: ultima.rows[0] } });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao enviar mensagem." });
  }
});

router.get("/admin", autenticar, exigirPermissao("chat-admin"), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT c.*, COUNT(m.id) AS total_mensagens,
        (SELECT mensagem FROM chat_mensagens WHERE conversa_id = c.id ORDER BY id DESC LIMIT 1) AS ultima_mensagem
      FROM chat_conversas c
      LEFT JOIN chat_mensagens m ON m.conversa_id = c.id
      GROUP BY c.id
      ORDER BY c.atualizado_em DESC, c.id DESC
    `);
    res.json({ sucesso: true, dados: result.rows });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar chats." });
  }
});

router.get("/admin/:id", autenticar, exigirPermissao("chat-admin"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversa = await queryOne("SELECT * FROM chat_conversas WHERE id = ?", [req.params.id]);
    if (!conversa) { res.status(404).json({ sucesso: false, mensagem: "Chat não encontrado." }); return; }
    const mensagens = await query("SELECT id, conversa_id, origem, mensagem, criado_em FROM chat_mensagens WHERE conversa_id = ? ORDER BY criado_em ASC, id ASC", [req.params.id]);
    res.json({ sucesso: true, dados: { ...conversa, mensagens: mensagens.rows } });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar chat." });
  }
});

router.post("/admin/:id/responder", autenticar, exigirPermissao("chat-admin"), auditoria("responder", "chat"), async (req: AuthRequest, res: Response): Promise<void> => {
  const mensagem = String(req.body?.mensagem || "").trim();
  if (!mensagem) { res.status(400).json({ sucesso: false, mensagem: "Mensagem obrigatória." }); return; }
  try {
    await query("INSERT INTO chat_mensagens (conversa_id, origem, mensagem, usuario_id, criado_em) VALUES (?, 'operador', ?, ?, NOW())", [req.params.id, mensagem, req.user!.userId]);
    await query("UPDATE chat_conversas SET status = 'respondida', atualizado_em = NOW() WHERE id = ?", [req.params.id]);
    const nova = await queryOne("SELECT id, conversa_id, origem, mensagem, criado_em FROM chat_mensagens WHERE conversa_id = ? ORDER BY id DESC LIMIT 1", [req.params.id]);
    res.status(201).json({ sucesso: true, dados: nova });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao responder chat." });
  }
});

router.patch("/admin/:id/status", autenticar, exigirPermissao("chat-admin"), async (req: AuthRequest, res: Response): Promise<void> => {
  const status = String(req.body?.status || "");
  const validos = ["aberta", "em-atendimento", "respondida", "arquivada"];
  if (!validos.includes(status)) { res.status(400).json({ sucesso: false, mensagem: "Status inválido." }); return; }
  await query("UPDATE chat_conversas SET status = ?, atualizado_em = NOW() WHERE id = ?", [status, req.params.id]);
  res.json({ sucesso: true, mensagem: "Status atualizado." });
});

router.delete("/admin/:id", autenticar, exigirPermissao("chat-admin"), auditoria("excluir", "chat"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query("DELETE FROM chat_mensagens WHERE conversa_id = ?", [req.params.id]);
    const result = await query("DELETE FROM chat_conversas WHERE id = ?", [req.params.id]);
    if (result.rowCount === 0) { res.status(404).json({ sucesso: false, mensagem: "Chat não encontrado." }); return; }
    res.json({ sucesso: true, mensagem: "Chat excluído com sucesso." });
  } catch {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir chat." });
  }
});

export default router;
