import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/database";
import { runMigrations } from "./migrate";

async function resetAdmin(): Promise<void> {
  runMigrations();

  const email = (process.env.ADMIN_EMAIL ?? "admin@inprec.net").toLowerCase().trim();
  const senha = process.env.ADMIN_PASSWORD ?? "inprec@2026";
  const senhaHash = await bcrypt.hash(senha, 12);
  const permissoes = JSON.stringify([
    "dashboard", "analytics", "noticias", "eventos", "cursos", "eventos-inscritos",
    "servicos", "faq", "ouvidoria-admin", "lai-admin", "contato-admin",
    "pesquisa-admin", "chat-admin", "slides", "banner", "floating", "painel",
    "gestores", "eleicao", "votacao", "transparencia", "financas",
    "menu", "aparencia", "paginas", "configuracoes", "usuarios", "auditoria", "arquivos",
  ]);

  const existente = db
    .prepare("SELECT id FROM usuarios_admin WHERE email = ?")
    .get(email) as { id: string } | undefined;

  if (existente) {
    db.prepare(`
      UPDATE usuarios_admin
      SET senha_hash = ?, nivel_acesso = 'superadmin', permissoes = ?, ativo = 1, atualizado_em = datetime('now')
      WHERE id = ?
    `).run(senhaHash, permissoes, existente.id);
    console.log(`Admin atualizado: ${email}`);
    return;
  }

  db.prepare(`
    INSERT INTO usuarios_admin (id, nome, email, senha_hash, nivel_acesso, permissoes, ativo, descricao)
    VALUES (?, ?, ?, ?, 'superadmin', ?, 1, 'Superadministrador com acesso total ao sistema')
  `).run(uuidv4(), "Administrador Geral", email, senhaHash, permissoes);

  console.log(`Admin criado: ${email}`);
}

resetAdmin().catch((err) => {
  console.error("Erro ao resetar admin:", err);
  process.exit(1);
});
