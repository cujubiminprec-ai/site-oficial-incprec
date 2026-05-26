import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { fecharConexao, query, queryOne } from "../config/database";
import { runMigrations } from "./migrate";

async function resetAdmin(): Promise<void> {
  await runMigrations();

  const email = (process.env.ADMIN_EMAIL ?? "admin@inprec.com").toLowerCase().trim();
  const senha = process.env.ADMIN_PASSWORD ?? "admin123";
  const senhaHash = await bcrypt.hash(senha, 12);
  const permissoes = [
    "dashboard", "analytics", "noticias", "eventos", "cursos", "eventos-inscritos",
    "servicos", "faq", "ouvidoria-admin", "lai-admin", "contato-admin",
    "pesquisa-admin", "chat-admin", "slides", "banner", "floating", "painel",
    "gestores", "eleicao", "votacao", "transparencia", "financas",
    "menu", "aparencia", "paginas", "configuracoes", "usuarios", "auditoria", "arquivos",
  ];

  const existente = await queryOne<{ id: string }>("SELECT id FROM usuarios_admin WHERE email = $1", [email]);

  if (existente) {
    await query(
      `UPDATE usuarios_admin
       SET senha_hash = $1, nivel_acesso = 'superadmin', permissoes = $2, ativo = 1, atualizado_em = NOW()
       WHERE id = $3`,
      [senhaHash, permissoes, existente.id],
    );
    console.log(`Admin atualizado: ${email}`);
    return;
  }

  await query(
    `INSERT INTO usuarios_admin (id, nome, email, senha_hash, nivel_acesso, permissoes, ativo, descricao)
     VALUES ($1, $2, $3, $4, 'superadmin', $5, 1, 'Superadministrador com acesso total ao sistema')`,
    [uuidv4(), "Administrador Geral", email, senhaHash, permissoes],
  );

  console.log(`Admin criado: ${email}`);
}

resetAdmin()
  .then(() => fecharConexao())
  .catch(async (err) => {
    console.error("Erro ao resetar admin:", err);
    await fecharConexao().catch(() => undefined);
    process.exit(1);
  });
