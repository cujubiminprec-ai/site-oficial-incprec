/**
 * Seed inicial — popula dados básicos no banco SQLite.
 * Execute com: npm run seed  (ou após migrate: npm run setup)
 */
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/database";
import env from "../config/env";
import { runMigrations } from "./migrate";

async function seed(): Promise<void> {
  console.log("\n🌱 Iniciando seed inicial...\n");

  // Garante que o banco tem o schema atualizado
  runMigrations();

  // ============================================================
  // Usuário administrador padrão
  // ============================================================
  const emailAdmin   = process.env.ADMIN_EMAIL    ?? "admin@inprec.net";
  const senhaAdmin   = process.env.ADMIN_PASSWORD ?? "inprec@2026";
  const senhaHash    = await bcrypt.hash(senhaAdmin, 12);
  const adminId      = uuidv4();

  const adminExiste = db
    .prepare("SELECT id FROM usuarios_admin WHERE email = ?")
    .get(emailAdmin);

  if (!adminExiste) {
    const permissoes = JSON.stringify([
      "dashboard","analytics","noticias","eventos","cursos","eventos-inscritos",
      "servicos","faq","ouvidoria-admin","lai-admin","contato-admin",
      "pesquisa-admin","slides","banner","floating","painel",
      "gestores","eleicao","transparencia","financas",
      "menu","aparencia","paginas","configuracoes","usuarios","auditoria","arquivos",
    ]);

    db.prepare(`
      INSERT INTO usuarios_admin (id, nome, email, senha_hash, nivel_acesso, permissoes, ativo, descricao)
      VALUES (?, ?, ?, ?, 'superadmin', ?, 1, 'Superadministrador com acesso total ao sistema')
    `).run(adminId, "Administrador Geral", emailAdmin, senhaHash, permissoes);

    console.log(`  ✔  Admin criado: ${emailAdmin} / ${senhaAdmin}`);
    console.log(`     ⚠️  Altere a senha no primeiro acesso!`);
  } else {
    console.log(`  ℹ️  Admin já existe: ${emailAdmin}`);
  }

  // ============================================================
  // Configurações do site
  // ============================================================
  const configExiste = db
    .prepare("SELECT id FROM configuracoes_site WHERE id = 1")
    .get();

  if (!configExiste) {
    db.prepare(`
      INSERT INTO configuracoes_site (
        nome_site, nome_completo, descricao_site,
        cor_primaria, cor_secundaria, cor_destaque,
        email_contato, telefone_principal, telefone_whatsapp,
        endereco_logradouro, endereco_cidade, endereco_estado, endereco_cep,
        horario_atendimento, rodape_texto, meta_titulo, meta_descricao
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      "INPREC",
      "Instituto de Previdência dos Servidores Públicos Municipais de Cujubim",
      "Garantindo a proteção previdenciária dos servidores municipais com eficiência e transparência.",
      "#1a3a5c", "#c8a951", "#e55f1c",
      "inprec@cujubim.ro.gov.br", "(69) 99250-9093", "(69) 99250-9093",
      "Av. Condor, n° 2588 Centro", "Cujubim", "RO", "76.864-000",
      "De Segunda a Sexta, das 07:30h às 13:30h",
      "© 2026 INPREC — Instituto de Previdência dos Servidores Públicos Municipais de Cujubim/RO. Todos os direitos reservados.",
      "INPREC — Previdência Municipal Cujubim/RO",
      "Instituto de Previdência dos Servidores Públicos Municipais de Cujubim. Aposentadoria, pensão, benefícios e transparência para servidores municipais de Rondônia."
    );
    console.log("  ✔  Configurações do site inseridas");
  }

  // ============================================================
  // Páginas do site
  // ============================================================
  const inserirPagina = db.prepare(`
    INSERT OR IGNORE INTO paginas (page_id, nome, rota, status) VALUES (?,?,?,?)
  `);

  const paginas = [
    ["home", "Home", "/", "publicada"],
    ["quem-somos", "Quem Somos", "/quem-somos", "publicada"],
    ["servicos", "Serviços", "/servicos", "publicada"],
    ["transparencia", "Portal da Transparência", "/transparencia", "publicada"],
    ["financas-investimentos", "Finanças e Investimentos", "/financas-investimentos", "publicada"],
    ["legislacao", "Legislação", "/legislacao", "publicada"],
    ["gestores", "Gestores", "/gestores", "publicada"],
    ["lai", "Lei de Acesso à Informação", "/lai", "publicada"],
    ["lgpd", "LGPD", "/lgpd", "publicada"],
    ["contato", "Contato", "/contato", "publicada"],
    ["ouvidoria", "Ouvidoria", "/ouvidoria", "publicada"],
    ["eventos", "Eventos e Audiências", "/eventos", "publicada"],
    ["noticias", "Notícias", "/noticias", "publicada"],
    ["cursos", "Cursos e Capacitações", "/cursos", "publicada"],
    ["faq", "Perguntas Frequentes", "/faq", "publicada"],
    ["estrutura", "Estrutura Organizacional", "/estrutura", "publicada"],
    ["previdencia", "Previdência", "/previdencia", "publicada"],
    ["formularios", "Formulários", "/formularios", "publicada"],
    ["mapa-do-site", "Mapa do Site", "/mapa-do-site", "publicada"],
  ] as const;

  const seedPaginas = db.transaction(() => {
    for (const p of paginas) inserirPagina.run(...p);
  });
  seedPaginas();
  console.log(`  ✔  ${paginas.length} páginas inseridas`);

  // ============================================================
  // Serviços
  // ============================================================
  const inserirServico = db.prepare(`
    INSERT OR IGNORE INTO servicos (icone, titulo, descricao, posicao, destaque) VALUES (?,?,?,?,?)
  `);

  const servicos = [
    ["ri-government-line", "Gestão Administrativa", "Suporte completo à gestão de órgãos públicos com processos modernos, eficiência e conformidade legal.", 1, 1],
    ["ri-book-open-line", "Capacitação de Servidores", "Programas de formação continuada para servidores municipais com cursos presenciais e EAD certificados.", 2, 1],
    ["ri-file-chart-line", "Planejamento Estratégico", "Elaboração de planos estratégicos institucionais com metodologias ágeis e indicadores de desempenho.", 3, 0],
    ["ri-shield-check-line", "Controle e Fiscalização", "Auditorias, fiscalização de contratos e compliance para garantir a legalidade dos atos administrativos.", 4, 0],
    ["ri-community-line", "Atendimento ao Cidadão", "Canais de atendimento presencial e digital para demandas, ouvidoria e serviços ao cidadão.", 5, 0],
    ["ri-bar-chart-box-line", "Dados e Transparência", "Publicação de dados abertos, relatórios financeiros e acesso à informação conforme a LAI.", 6, 0],
  ] as const;

  const seedServicos = db.transaction(() => {
    for (const s of servicos) inserirServico.run(...s);
  });
  seedServicos();
  console.log(`  ✔  ${servicos.length} serviços inseridos`);

  // ============================================================
  // Noticia e audiencia publica real
  // ============================================================
  const noticiaExiste = db
    .prepare("SELECT id FROM noticias WHERE slug = ?")
    .get("audiencia-publica-inprec-2025");

  if (!noticiaExiste) {
    db.prepare(`
      INSERT INTO noticias (
        titulo, slug, resumo, conteudo, image_url, image_alt, categoria,
        autor, destaque, publicado, publicado_em, tags
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      "Audiencia Publica INPREC 2025",
      "audiencia-publica-inprec-2025",
      "INPREC realiza audiencia publica para apresentacao e transparencia das acoes previdenciarias.",
      "O INPREC realizou audiencia publica em 2025 para apresentar informacoes institucionais, prestar contas e ampliar a participacao social na gestao previdenciaria municipal.\n\nA iniciativa reforca o compromisso com transparencia, controle social e acesso a informacao.",
      "/uploads/noticias/audiencias-publicas-2025/capa/audiencia-publica-inprec-2025-capa.jpg",
      "Audiencia Publica INPREC 2025",
      "Audiência Pública",
      "INPREC",
      1,
      1,
      "2025-01-01T12:00:00.000Z",
      JSON.stringify(["audiencia-publica", "transparencia", "inprec"])
    );
    console.log("  Noticia real de audiencia publica inserida");
  }

  const eventoExiste = db
    .prepare("SELECT id FROM eventos WHERE titulo = ?")
    .get("Audiencia Publica INPREC 2025");

  if (!eventoExiste) {
    db.prepare(`
      INSERT INTO eventos (
        titulo, tipo, status, data_inicio, hora_inicio, local, descricao,
        imagem_url, categoria, publicado, destaque
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      "Audiencia Publica INPREC 2025",
      "audiencia",
      "encerrado",
      "2025-01-01",
      "09:00",
      "INPREC - Cujubim/RO",
      "Audiencia publica para apresentacao de informacoes, prestacao de contas e participacao social na gestao previdenciaria municipal.",
      "/uploads/noticias/audiencias-publicas-2025/capa/audiencia-publica-inprec-2025-capa.jpg",
      "Audiência Pública",
      1,
      1
    );
    console.log("  Evento de audiencia publica inserido");
  }

  // ============================================================
  // FAQ
  // ============================================================
  const inserirFaq = db.prepare(`
    INSERT OR IGNORE INTO faq (pergunta, resposta, categoria, posicao) VALUES (?,?,?,?)
  `);
  const faqs = [
    ["Quem tem direito à aposentadoria pelo RPPS?", "Os servidores públicos municipais efetivos vinculados ao INPREC têm direito à aposentadoria conforme regras da EC 103/2019.", "Aposentadoria", 1],
    ["Como solicitar a aposentadoria?", "O servidor deve protocolar requerimento no INPREC com a documentação exigida. O prazo de análise é de até 30 dias úteis.", "Aposentadoria", 2],
    ["Quais documentos são necessários para aposentadoria?", "RG, CPF, comprovante de residência, contracheques dos últimos 3 meses, certidão de tempo de serviço e formulário preenchido.", "Documentação", 3],
    ["Como funciona a pensão por morte?", "A pensão é concedida aos dependentes do servidor falecido. Deve ser solicitada em até 90 dias após o óbito.", "Pensão", 4],
    ["Como acessar o extrato previdenciário?", "Acesse o Portal do Servidor com seu CPF e senha. Em caso de dúvida, entre em contato com o INPREC.", "Portal", 5],
    ["O INPREC tem atendimento online?", "Sim! Você pode enviar documentos e solicitações pelo e-mail inprec@cujubim.ro.gov.br ou pela ouvidoria online.", "Atendimento", 6],
  ] as const;
  const seedFaq = db.transaction(() => { for (const f of faqs) inserirFaq.run(...f); });
  seedFaq();
  console.log(`  ✔  ${faqs.length} FAQs inseridas`);

  // ============================================================
  // Benefícios
  // ============================================================
  const inserirBeneficio = db.prepare(`
    INSERT OR IGNORE INTO beneficios (slug, titulo, descricao_curta, icone, posicao) VALUES (?,?,?,?,?)
  `);
  const beneficios = [
    ["aposentadoria-por-idade", "Aposentadoria por Idade", "Direito ao servidor que atingiu a idade mínima e o tempo de contribuição exigidos.", "ri-user-star-line", 1],
    ["aposentadoria-por-invalidez", "Aposentadoria por Invalidez", "Concedida ao servidor incapaz permanentemente para o exercício do cargo.", "ri-heart-pulse-line", 2],
    ["pensao-por-morte", "Pensão por Morte", "Benefício concedido aos dependentes do servidor falecido.", "ri-group-line", 3],
    ["auxilio-doenca", "Auxílio-Doença", "Benefício concedido após 30 dias consecutivos de afastamento médico.", "ri-hospital-line", 4],
    ["fundo-previdenciario", "Fundo Previdenciário", "Gestão dos recursos financeiros para garantir o pagamento dos benefícios futuros.", "ri-funds-line", 5],
    ["atendimento-personalizado", "Atendimento Personalizado", "Atendimento especializado para dúvidas sobre benefícios e documentação.", "ri-customer-service-2-line", 6],
  ] as const;
  const seedBeneficios = db.transaction(() => { for (const b of beneficios) inserirBeneficio.run(...b); });
  seedBeneficios();
  console.log(`  ✔  ${beneficios.length} benefícios inseridos`);

  // ============================================================
  // Eleição — configuração padrão
  // ============================================================
  const eleicaoExiste = db.prepare("SELECT id FROM eleicao_configuracao LIMIT 1").get();
  if (!eleicaoExiste) {
    db.prepare(`
      INSERT INTO eleicao_configuracao (titulo, descricao, status) VALUES (?,?,?)
    `).run(
      "Eleição do Conselho Deliberativo e Fiscal — 2026",
      "Eleição para escolha dos representantes dos servidores nos Conselhos do INPREC.",
      "inativa"
    );
    console.log("  ✔  Configuração de eleição inserida");
  }

  // ============================================================
  // Banner de aviso
  // ============================================================
  const bannerExiste = db.prepare("SELECT id FROM banner_aviso LIMIT 1").get();
  if (!bannerExiste) {
    db.prepare(`
      INSERT INTO banner_aviso (texto, link_url, link_label, cor_fundo, ativo) VALUES (?,?,?,?,?)
    `).run(
      "Período de recadastramento anual: 15/04 a 15/05/2026. Clique para saber mais.",
      "/noticias", "Saiba mais", "#1a3a5c", 0
    );
    console.log("  ✔  Banner de aviso inserido");
  }

  console.log("\n🎉 Seed concluído com sucesso!\n");
}

// Executar diretamente: npm run seed
seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
