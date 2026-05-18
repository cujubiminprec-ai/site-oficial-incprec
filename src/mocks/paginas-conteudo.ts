export type BlocoTipo = "hero" | "texto" | "imagem" | "lista" | "cta" | "aviso" | "divisor" | "colunas";

export interface BlocoConteudo {
  id: string;
  tipo: BlocoTipo;
  titulo?: string;
  subtitulo?: string;
  texto?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  itens?: string[];
  colunas?: { titulo: string; texto: string; icone?: string }[];
  cor?: string;
  alinhamento?: "left" | "center" | "right";
}

export interface PaginaConteudo {
  pageId: string;
  blocos: BlocoConteudo[];
  ultimaEdicao?: string;
}

export const paginasConteudoDefault: PaginaConteudo[] = [
  {
    pageId: "lgpd",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "lgpd-hero",
        tipo: "hero",
        titulo: "Lei Geral de Proteção de Dados — LGPD",
        subtitulo: "Como o INPREC protege seus dados pessoais. Conheça seus direitos como titular.",
        alinhamento: "center"
      },
      {
        id: "lgpd-intro",
        tipo: "texto",
        titulo: "O que é a LGPD",
        texto: "A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) regula o tratamento de dados pessoais no Brasil por pessoas físicas ou jurídicas, de direito público ou privado.\n\nO INPREC está comprometido com o cumprimento integral da LGPD, garantindo transparência, segurança e respeito à privacidade de todos os titulares de dados com quem se relaciona."
      },
      {
        id: "lgpd-direitos",
        tipo: "colunas",
        titulo: "Seus Direitos como Titular",
        colunas: [
          { titulo: "Acesso e Correção", texto: "Você pode solicitar acesso aos seus dados e corrigi-los quando estiverem incorretos ou desatualizados.", icone: "ri-eye-line" },
          { titulo: "Exclusão e Portabilidade", texto: "Solicite a exclusão de dados desnecessários ou a portabilidade para outro prestador de serviços.", icone: "ri-delete-bin-line" },
          { titulo: "Revogação", texto: "Você pode revogar o consentimento para tratamento de dados a qualquer momento, quando aplicável.", icone: "ri-close-circle-line" }
        ]
      },
      {
        id: "lgpd-aviso",
        tipo: "aviso",
        titulo: "Encarregado de Dados (DPO)",
        texto: "O encarregado pelo tratamento de dados pessoais do INPREC é o Dr. Ricardo Souza. Contato: inprec@cujubim.ro.gov.br | (69) 99250-9093.",
        cor: "#7C3AED"
      },
      {
        id: "lgpd-cta",
        tipo: "cta",
        titulo: "Exercer seus direitos ou tirar dúvidas?",
        texto: "Entre em contato com nosso canal de atendimento à LGPD.",
        ctaLabel: "Fale com o DPO",
        ctaUrl: "/contato"
      }
    ]
  },
  {
    pageId: "beneficios-aposentadoria-idade",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "apo-idade-aviso",
        tipo: "aviso",
        titulo: "Regra de Transição — EC 103/2019",
        texto: "Servidores que ingressaram antes da Reforma da Previdência podem ter regras de transição específicas aplicadas. Consulte o INPREC para verificar seu caso.",
        cor: "#D97706"
      }
    ]
  },
  {
    pageId: "beneficios-aposentadoria-invalidez",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "apo-inv-aviso",
        tipo: "aviso",
        titulo: "Perícia Médica Obrigatória",
        texto: "A concessão da aposentadoria por invalidez está condicionada à realização de perícia médica oficial. O INPREC agendará o exame após protocolo do requerimento.",
        cor: "#DC2626"
      }
    ]
  },
  {
    pageId: "beneficios-pensao-morte",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "pensao-aviso",
        tipo: "aviso",
        titulo: "Prazo de 90 dias para solicitação",
        texto: "O requerimento de pensão por morte deve ser protocolado em até 90 dias corridos após o óbito. Após esse prazo, o benefício só é pago a partir da data do pedido.",
        cor: "#7C3AED"
      }
    ]
  },
  {
    pageId: "beneficios-auxilio-doenca",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "aux-doenca-aviso",
        tipo: "aviso",
        titulo: "Afastamento mínimo de 30 dias",
        texto: "O Auxílio-Doença é concedido apenas após 30 dias consecutivos de afastamento médico comprovado. Os primeiros 30 dias são de responsabilidade do órgão empregador.",
        cor: "#0891B2"
      }
    ]
  },
  {
    pageId: "beneficios-fundo-previdenciario",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "fundo-cta",
        tipo: "cta",
        titulo: "Acompanhe os relatórios do Fundo",
        texto: "Acesse o Portal da Transparência para ver relatórios mensais, trimestrais e anuais.",
        ctaLabel: "Ver Portal da Transparência",
        ctaUrl: "/transparencia"
      }
    ]
  },
  {
    pageId: "beneficios-atendimento",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "atend-colunas",
        tipo: "colunas",
        titulo: "Canais de Atendimento",
        colunas: [
          { titulo: "Presencial", texto: "Av. Condor, n° 2588 Centro — Cujubim. Seg–Sex, 07h30 às 13h30.", icone: "ri-building-2-line" },
          { titulo: "WhatsApp & Telefone", texto: "(69) 99250-9093. Atendimento no horário de funcionamento.", icone: "ri-phone-line" },
          { titulo: "E-mail", texto: "inprec@cujubim.ro.gov.br. Respondemos em até 2 dias úteis.", icone: "ri-mail-line" }
        ]
      }
    ]
  },
  {
    pageId: "quem-somos",
    ultimaEdicao: "2026-04-10",
    blocos: [
      {
        id: "qs-hero",
        tipo: "hero",
        titulo: "Quem Somos",
        subtitulo: "Conheça o INPREC — Instituto de Previdência do Município",
        imageUrl: "https://readdy.ai/api/search-image?query=modern%20government%20building%20exterior%20with%20clean%20architecture%20and%20greenery%2C%20professional%20institutional%20photography%2C%20bright%20natural%20lighting%2C%20minimalist%20design&width=1200&height=400&seq=qs-hero-01&orientation=landscape",
        alinhamento: "center"
      },
      {
        id: "qs-missao",
        tipo: "colunas",
        titulo: "Nossa Missão, Visão e Valores",
        colunas: [
          { titulo: "Missão", texto: "Garantir a proteção previdenciária dos servidores municipais com eficiência, transparência e responsabilidade fiscal.", icone: "ri-flag-line" },
          { titulo: "Visão", texto: "Ser referência nacional em gestão previdenciária pública, reconhecida pela excelência e inovação nos serviços prestados.", icone: "ri-eye-line" },
          { titulo: "Valores", texto: "Transparência, Ética, Responsabilidade, Comprometimento com o servidor público e sustentabilidade do regime.", icone: "ri-heart-line" }
        ]
      },
      {
        id: "qs-historia",
        tipo: "texto",
        titulo: "Nossa História",
        texto: "O INPREC foi criado com o objetivo de garantir a seguridade social dos servidores municipais efetivos. Ao longo dos anos, evoluímos continuamente para oferecer serviços de qualidade e transparência total na gestão dos recursos previdenciários.\n\nNossa trajetória é marcada pela busca constante de inovação administrativa e pela proximidade com os servidores, que são nossa razão de existir."
      }
    ]
  },
  {
    pageId: "servicos",
    ultimaEdicao: "2026-04-08",
    blocos: [
      {
        id: "sv-hero",
        tipo: "hero",
        titulo: "Nossos Serviços",
        subtitulo: "Tudo que você precisa para garantir sua previdência com tranquilidade",
        alinhamento: "center"
      },
      {
        id: "sv-intro",
        tipo: "texto",
        titulo: "Como podemos te ajudar",
        texto: "O INPREC disponibiliza uma série de serviços para os servidores municipais ativos, inativos e pensionistas. Confira abaixo todos os benefícios e saiba como solicitar cada um deles.\n\nPara dúvidas, entre em contato pelo nosso canal de atendimento personalizado ou acesse a ouvidoria."
      },
      {
        id: "sv-doc",
        tipo: "lista",
        titulo: "Documentos necessários para solicitação",
        itens: [
          "Documento de identidade com foto (RG ou CNH)",
          "CPF e comprovante de situação cadastral",
          "Comprovante de residência atualizado (últimos 3 meses)",
          "Contracheque ou declaração de renda",
          "Certidão de tempo de serviço emitida pelo RH"
        ]
      }
    ]
  },
  {
    pageId: "transparencia",
    ultimaEdicao: "2026-04-12",
    blocos: [
      {
        id: "tr-hero",
        tipo: "hero",
        titulo: "Portal da Transparência",
        subtitulo: "Acesso livre e irrestrito às informações financeiras e administrativas do INPREC",
        alinhamento: "center"
      },
      {
        id: "tr-aviso",
        tipo: "aviso",
        titulo: "Compromisso com a Transparência",
        texto: "Em cumprimento à Lei de Responsabilidade Fiscal e à Lei de Acesso à Informação (nº 12.527/2011), disponibilizamos todos os dados financeiros, contratos e relatórios de gestão.",
        cor: "#059669"
      },
      {
        id: "tr-texto",
        tipo: "texto",
        titulo: "Sobre o Portal",
        texto: "Este portal centraliza todas as informações de interesse público sobre a gestão do INPREC. Aqui você encontra relatórios atuariais, demonstrativos financeiros, atas de reunião, contratos e licitações.\n\nTodas as informações são atualizadas regularmente conforme os prazos legais estabelecidos pelas normas federais de transparência."
      }
    ]
  },
  {
    pageId: "contato",
    ultimaEdicao: "2026-04-05",
    blocos: [
      {
        id: "ct-hero",
        tipo: "hero",
        titulo: "Entre em Contato",
        subtitulo: "Estamos aqui para ajudar você. Envie sua mensagem ou visite nossa sede.",
        alinhamento: "center"
      },
      {
        id: "ct-info",
        tipo: "colunas",
        titulo: "Canais de Atendimento",
        colunas: [
          { titulo: "Telefone", texto: "(69) 99250-9093 — Seg a Sex das 07:30h às 13:30h", icone: "ri-phone-line" },
          { titulo: "E-mail", texto: "inprec@cujubim.ro.gov.br — Resposta em até 2 dias úteis", icone: "ri-mail-line" },
          { titulo: "Presencial", texto: "Av. Condor, n° 2588 Centro, CEP: 76.864-000 — Cujubim. Seg a Sex das 07:30h às 13:30h", icone: "ri-map-pin-line" }
        ]
      }
    ]
  },
  {
    pageId: "ouvidoria",
    ultimaEdicao: "2026-04-01",
    blocos: [
      {
        id: "ov-hero",
        tipo: "hero",
        titulo: "Ouvidoria",
        subtitulo: "Canal oficial para reclamações, denúncias, sugestões e elogios",
        alinhamento: "center"
      },
      {
        id: "ov-aviso",
        tipo: "aviso",
        titulo: "Sigilo Garantido",
        texto: "Todas as manifestações recebidas pela Ouvidoria são tratadas com total sigilo e imparcialidade, conforme determina a legislação vigente.",
        cor: "#6D28D9"
      },
      {
        id: "ov-texto",
        tipo: "texto",
        titulo: "Como funciona a Ouvidoria",
        texto: "A Ouvidoria do INPREC é o canal direto de comunicação entre o cidadão e a instituição. Por meio dela, você pode registrar reclamações sobre serviços, denúncias de irregularidades, sugestões de melhoria e elogios.\n\nTodas as manifestações são respondidas em até 30 dias corridos, conforme prazo legal estabelecido pela Ouvidoria-Geral da União."
      },
      {
        id: "ov-lista",
        tipo: "lista",
        titulo: "Tipos de manifestação aceitas",
        itens: [
          "Reclamação: insatisfação com serviço prestado",
          "Denúncia: irregularidades, fraudes ou condutas impróprias",
          "Sugestão: ideias para melhorar os serviços",
          "Elogio: reconhecimento por bom atendimento",
          "Solicitação de informação: pedidos gerais de informação"
        ]
      }
    ]
  }
];
