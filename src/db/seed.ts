import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { fecharConexao, query, queryOne } from "../config/database";
import { runMigrations } from "./migrate";

async function seed(): Promise<void> {
  console.log("\nIniciando seed inicial...\n");
  await runMigrations();

  const emailAdmin = (process.env.ADMIN_EMAIL ?? "admin@inprec.com").toLowerCase().trim();
  const senhaAdmin = process.env.ADMIN_PASSWORD ?? "admin123";
  const senhaHash = await bcrypt.hash(senhaAdmin, 12);

  const adminExiste = await queryOne("SELECT id FROM usuarios_admin WHERE email = $1", [emailAdmin]);
  if (!adminExiste) {
    const permissoes = [
      "dashboard", "analytics", "noticias", "eventos", "cursos", "eventos-inscritos",
      "servicos", "faq", "ouvidoria-admin", "lai-admin", "contato-admin", "pesquisa-admin",
      "slides", "banner", "floating", "painel", "gestores", "eleicao", "transparencia",
      "financas", "menu", "aparencia", "paginas", "configuracoes", "usuarios", "auditoria", "arquivos",
    ];

    await query(
      `INSERT INTO usuarios_admin (id, nome, email, senha_hash, nivel_acesso, permissoes, ativo, descricao)
       VALUES ($1, $2, $3, $4, 'superadmin', $5, 1, 'Superadministrador com acesso total ao sistema')`,
      [uuidv4(), "Administrador Geral", emailAdmin, senhaHash, permissoes],
    );
    console.log(`  OK Admin criado: ${emailAdmin} / ${senhaAdmin}`);
  } else {
    console.log(`  OK Admin ja existe: ${emailAdmin}`);
  }

  const configExiste = await queryOne("SELECT id FROM configuracoes_site WHERE id = 1");
  if (!configExiste) {
    await query(
      `INSERT INTO configuracoes_site (
        id, nome_site, nome_completo, descricao_site, cor_primaria, cor_secundaria, cor_destaque,
        email_contato, telefone_principal, telefone_whatsapp, endereco_logradouro, endereco_cidade,
        endereco_estado, endereco_cep, horario_atendimento, rodape_texto, meta_titulo, meta_descricao
      ) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        "INPREC",
        "Instituto de Previdencia dos Servidores Publicos Municipais de Cujubim",
        "Garantindo a protecao previdenciaria dos servidores municipais com eficiencia e transparencia.",
        "#1a3a5c", "#c8a951", "#e55f1c",
        "inprec@cujubim.ro.gov.br", "(69) 99250-9093", "(69) 99250-9093",
        "Av. Condor, n 2588 Centro", "Cujubim", "RO", "76.864-000",
        "Segunda a Sexta - 07h30 as 13h30",
        "2026 INPREC - Instituto de Previdencia dos Servidores Publicos Municipais de Cujubim/RO.",
        "INPREC - Previdencia Municipal Cujubim/RO",
        "Instituto de Previdencia dos Servidores Publicos Municipais de Cujubim.",
      ],
    );
    console.log("  OK Configuracoes do site inseridas");
  }

  const paginas = [
    ["home", "Home", "/", "publicada"],
    ["quem-somos", "Quem Somos", "/quem-somos", "publicada"],
    ["servicos", "Servicos", "/servicos", "publicada"],
    ["transparencia", "Portal da Transparencia", "/transparencia", "publicada"],
    ["financas-investimentos", "Financas e Investimentos", "/financas-investimentos", "publicada"],
    ["legislacao", "Legislacao", "/legislacao", "publicada"],
    ["gestores", "Gestores", "/gestores", "publicada"],
    ["lai", "Lei de Acesso a Informacao", "/lai", "publicada"],
    ["lgpd", "LGPD", "/lgpd", "publicada"],
    ["contato", "Contato", "/contato", "publicada"],
    ["ouvidoria", "Ouvidoria", "/ouvidoria", "publicada"],
    ["eventos", "Eventos e Audiencias", "/eventos", "publicada"],
    ["noticias", "Noticias", "/noticias", "publicada"],
    ["cursos", "Cursos e Capacitacoes", "/cursos", "publicada"],
    ["faq", "Perguntas Frequentes", "/faq", "publicada"],
    ["estrutura", "Estrutura Organizacional", "/estrutura", "publicada"],
    ["previdencia", "Previdencia", "/previdencia", "publicada"],
    ["formularios", "Formularios", "/formularios", "publicada"],
    ["mapa-do-site", "Mapa do Site", "/mapa-do-site", "publicada"],
  ] as const;
  for (const pagina of paginas) {
    await query("INSERT IGNORE INTO paginas (page_id, nome, rota, status) VALUES ($1,$2,$3,$4)", [...pagina]);
  }
  console.log(`  OK ${paginas.length} paginas inseridas`);

  const servicos = [
    ["ri-government-line", "Gestao Administrativa", "Suporte completo a gestao de orgaos publicos.", 1, 1],
    ["ri-book-open-line", "Capacitacao de Servidores", "Programas de formacao continuada para servidores municipais.", 2, 1],
    ["ri-file-chart-line", "Planejamento Estrategico", "Elaboracao de planos estrategicos institucionais.", 3, 0],
    ["ri-shield-check-line", "Controle e Fiscalizacao", "Auditorias, fiscalizacao de contratos e compliance.", 4, 0],
    ["ri-community-line", "Atendimento ao Cidadao", "Canais de atendimento presencial e digital.", 5, 0],
    ["ri-bar-chart-box-line", "Dados e Transparencia", "Publicacao de dados abertos e relatorios financeiros.", 6, 0],
  ] as const;
  for (const servico of servicos) {
    await query("INSERT IGNORE INTO servicos (icone, titulo, descricao, posicao, destaque) VALUES ($1,$2,$3,$4,$5)", [...servico]);
  }
  console.log(`  OK ${servicos.length} servicos inseridos`);

  const noticiaExiste = await queryOne("SELECT id FROM noticias WHERE slug = $1", ["audiencia-publica-inprec-2025"]);
  if (!noticiaExiste) {
    await query(
      `INSERT INTO noticias (titulo, slug, resumo, conteudo, image_url, image_alt, categoria, autor, destaque, publicado, publicado_em, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,1,$9,$10)`,
      [
        "Audiencia Publica INPREC 2025",
        "audiencia-publica-inprec-2025",
        "INPREC realiza audiencia publica para apresentacao e transparencia das acoes previdenciarias.",
        "Audiencia publica para prestar contas e ampliar a participacao social na gestao previdenciaria municipal.",
        "/uploads/noticias/audiencias-publicas-2025/capa/audiencia-publica-inprec-2025-capa.jpg",
        "Audiencia Publica INPREC 2025",
        "Audiencia Publica",
        "INPREC",
        "2025-01-01 12:00:00",
        ["audiencia-publica", "transparencia", "inprec"],
      ],
    );
    console.log("  OK Noticia real de audiencia publica inserida");
  }

  const eventoExiste = await queryOne("SELECT id FROM eventos WHERE titulo = $1", ["Audiencia Publica INPREC 2025"]);
  if (!eventoExiste) {
    await query(
      `INSERT INTO eventos (titulo, tipo, status, data_inicio, hora_inicio, local, descricao, imagem_url, categoria, publicado, destaque)
       VALUES ($1,'audiencia','encerrado','2025-01-01','09:00',$2,$3,$4,'Audiencia Publica',1,1)`,
      [
        "Audiencia Publica INPREC 2025",
        "INPREC - Cujubim/RO",
        "Audiencia publica para apresentacao de informacoes, prestacao de contas e participacao social.",
        "/uploads/noticias/audiencias-publicas-2025/capa/audiencia-publica-inprec-2025-capa.jpg",
      ],
    );
    console.log("  OK Evento de audiencia publica inserido");
  }

  const faqs = [
    ["Quem tem direito a aposentadoria pelo RPPS?", "Os servidores publicos municipais efetivos vinculados ao INPREC.", "Aposentadoria", 1],
    ["Como solicitar a aposentadoria?", "O servidor deve protocolar requerimento no INPREC com a documentacao exigida.", "Aposentadoria", 2],
    ["Quais documentos sao necessarios para aposentadoria?", "RG, CPF, comprovante de residencia e documentos funcionais.", "Documentacao", 3],
    ["Como funciona a pensao por morte?", "A pensao e concedida aos dependentes do servidor falecido.", "Pensao", 4],
    ["Como acessar o extrato previdenciario?", "Acesse o Portal do Servidor ou entre em contato com o INPREC.", "Portal", 5],
    ["O INPREC tem atendimento online?", "Sim, pelo e-mail institucional e pela ouvidoria online.", "Atendimento", 6],
  ] as const;
  for (const faq of faqs) {
    await query("INSERT IGNORE INTO faq (pergunta, resposta, categoria, posicao) VALUES ($1,$2,$3,$4)", [...faq]);
  }
  console.log(`  OK ${faqs.length} FAQs inseridas`);

  const beneficios = [
    ["aposentadoria-por-idade", "Aposentadoria por Idade", "Direito ao servidor que atingiu os requisitos.", "ri-user-star-line", 1],
    ["aposentadoria-por-invalidez", "Aposentadoria por Invalidez", "Concedida ao servidor incapaz permanentemente.", "ri-heart-pulse-line", 2],
    ["pensao-por-morte", "Pensao por Morte", "Beneficio concedido aos dependentes.", "ri-group-line", 3],
    ["auxilio-doenca", "Auxilio-Doenca", "Beneficio concedido em afastamento medico.", "ri-hospital-line", 4],
    ["fundo-previdenciario", "Fundo Previdenciario", "Gestao dos recursos previdenciarios.", "ri-funds-line", 5],
    ["atendimento-personalizado", "Atendimento Personalizado", "Atendimento especializado ao servidor.", "ri-customer-service-2-line", 6],
  ] as const;
  for (const beneficio of beneficios) {
    await query("INSERT IGNORE INTO beneficios (slug, titulo, descricao_curta, icone, posicao) VALUES ($1,$2,$3,$4,$5)", [...beneficio]);
  }
  console.log(`  OK ${beneficios.length} beneficios inseridos`);

  const eleicaoExiste = await queryOne("SELECT id FROM eleicao_configuracao LIMIT 1");
  if (!eleicaoExiste) {
    await query("INSERT INTO eleicao_configuracao (titulo, descricao, status) VALUES ($1,$2,'inativa')", [
      "Eleicao do Conselho Deliberativo e Fiscal - 2026",
      "Eleicao para escolha dos representantes dos servidores nos Conselhos do INPREC.",
    ]);
    console.log("  OK Configuracao de eleicao inserida");
  }

  const bannerExiste = await queryOne("SELECT id FROM banner_aviso LIMIT 1");
  if (!bannerExiste) {
    await query("INSERT INTO banner_aviso (texto, link_url, link_label, cor_fundo, ativo) VALUES ($1,$2,$3,$4,0)", [
      "Periodo de recadastramento anual: 15/04 a 15/05/2026. Clique para saber mais.",
      "/noticias",
      "Saiba mais",
      "#1a3a5c",
    ]);
    console.log("  OK Banner de aviso inserido");
  }

  console.log("\nSeed concluido com sucesso!\n");
}

seed()
  .then(() => fecharConexao())
  .catch(async (err) => {
    console.error("Erro no seed:", err);
    await fecharConexao().catch(() => undefined);
    process.exit(1);
  });
