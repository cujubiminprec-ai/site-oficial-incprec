export type PermissaoModulo =
  | "dashboard"
  | "banner"
  | "floating"
  | "slides"
  | "painel"
  | "aparencia"
  | "paginas"
  | "menu"
  | "cursos"
  | "eventos"
  | "eleicao"
  | "votacao"
  | "eventos-inscritos"
  | "noticias"
  | "servicos"
  | "gestores"
  | "transparencia"
  | "faq"
  | "financas"
  | "ouvidoria-admin"
  | "lai-admin"
  | "contato-admin"
  | "pesquisa-admin"
  | "chat-admin"
  | "analytics"
  | "configuracoes"
  | "usuarios"
  | "auditoria";

export type NivelAcesso = "superadmin" | "admin" | "operador";

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  senha: string;
  nivelAcesso: NivelAcesso;
  permissoes: PermissaoModulo[];
  avatar: string;
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso?: string;
  descricao?: string;
}

export const MODULOS_DISPONIVEIS: {
  key: PermissaoModulo;
  label: string;
  icon: string;
  grupo: string;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: "ri-dashboard-line", grupo: "Geral" },
  { key: "analytics", label: "Analytics", icon: "ri-line-chart-line", grupo: "Geral" },
  { key: "noticias", label: "Notícias", icon: "ri-newspaper-line", grupo: "Conteúdo" },
  { key: "eventos", label: "Eventos & Audiências", icon: "ri-calendar-event-line", grupo: "Conteúdo" },
  { key: "cursos", label: "Cursos & Capacitações", icon: "ri-graduation-cap-line", grupo: "Conteúdo" },
  { key: "eventos-inscritos", label: "Inscritos em Eventos", icon: "ri-team-line", grupo: "Conteúdo" },
  { key: "servicos", label: "Serviços", icon: "ri-service-line", grupo: "Conteúdo" },
  { key: "faq", label: "Perguntas Frequentes", icon: "ri-question-answer-line", grupo: "Conteúdo" },
  { key: "ouvidoria-admin", label: "Ouvidoria", icon: "ri-speak-line", grupo: "Atendimento" },
  { key: "lai-admin", label: "LAI (Acesso à Informação)", icon: "ri-file-info-line", grupo: "Atendimento" },
  { key: "contato-admin", label: "Contato & Mensagens", icon: "ri-mail-line", grupo: "Atendimento" },
  { key: "pesquisa-admin", label: "Pesquisa de Satisfação", icon: "ri-survey-line", grupo: "Atendimento" },
  { key: "chat-admin", label: "Chat Online", icon: "ri-chat-3-line", grupo: "Atendimento" },
  { key: "slides", label: "Slides da Home", icon: "ri-slideshow-line", grupo: "Aparência" },
  { key: "banner", label: "Banner de Aviso", icon: "ri-megaphone-line", grupo: "Aparência" },
  { key: "floating", label: "Botões Flutuantes", icon: "ri-layout-bottom-2-line", grupo: "Aparência" },
  { key: "painel", label: "Painel Transparência", icon: "ri-bar-chart-box-line", grupo: "Aparência" },
  { key: "aparencia", label: "Layout & Cores", icon: "ri-palette-line", grupo: "Aparência" },
  { key: "menu", label: "Navegação / Menus", icon: "ri-menu-2-line", grupo: "Aparência" },
  { key: "paginas", label: "Páginas", icon: "ri-pages-line", grupo: "Aparência" },
  { key: "gestores", label: "Gestores", icon: "ri-group-line", grupo: "Institucional" },
  { key: "eleicao", label: "Eleição / Conselhos", icon: "ri-checkbox-circle-line", grupo: "Institucional" },
  { key: "votacao", label: "Candidatos / Votação", icon: "ri-user-star-line", grupo: "Institucional" },
  { key: "transparencia", label: "Transparência Docs", icon: "ri-file-chart-line", grupo: "Institucional" },
  { key: "financas", label: "Finanças e Invest.", icon: "ri-funds-line", grupo: "Institucional" },
  { key: "configuracoes", label: "Configurações", icon: "ri-settings-3-line", grupo: "Sistema" },
  { key: "usuarios", label: "Gerenciar Usuários", icon: "ri-user-settings-line", grupo: "Sistema" },
  { key: "auditoria", label: "Registro de Atividades", icon: "ri-history-line", grupo: "Sistema" },
];

export const PERMISSOES_POR_NIVEL: Record<NivelAcesso, PermissaoModulo[]> = {
  superadmin: MODULOS_DISPONIVEIS.map(m => m.key),
  admin: [
    "dashboard", "analytics", "noticias", "eventos", "cursos", "eventos-inscritos",
    "servicos", "faq", "ouvidoria-admin", "lai-admin", "contato-admin",
    "pesquisa-admin", "chat-admin", "slides", "banner", "floating", "painel",
    "gestores", "eleicao", "votacao", "transparencia", "financas",
    "menu", "aparencia", "paginas", "auditoria",
  ],
  operador: ["dashboard", "ouvidoria-admin", "lai-admin", "contato-admin", "pesquisa-admin", "chat-admin"],
};

const TODAS_PERMISSOES = MODULOS_DISPONIVEIS.map(m => m.key);

export const usuariosAdminDefault: UsuarioAdmin[] = [
  {
    id: "superadmin-001",
    nome: "Administrador Geral",
    email: "admin@inprec.com",
    senha: "admin123",
    nivelAcesso: "superadmin",
    permissoes: TODAS_PERMISSOES,
    avatar: "",
    ativo: true,
    criadoEm: "2026-01-01",
    ultimoAcesso: "2026-04-14",
    descricao: "Superadministrador com acesso total ao sistema",
  },
  {
    id: "op-ouvidoria-001",
    nome: "Ana Paula Souza",
    email: "ouvidoria@inprec.net",
    senha: "ouvidoria@2026",
    nivelAcesso: "operador",
    permissoes: ["dashboard", "ouvidoria-admin", "lai-admin", "contato-admin"],
    avatar: "",
    ativo: true,
    criadoEm: "2026-02-10",
    ultimoAcesso: "2026-04-13",
    descricao: "Responsável pelo atendimento da ouvidoria e LAI",
  },
  {
    id: "op-conteudo-001",
    nome: "Carlos Eduardo Lima",
    email: "conteudo@inprec.net",
    senha: "conteudo@2026",
    nivelAcesso: "operador",
    permissoes: ["dashboard", "noticias", "eventos", "cursos", "eventos-inscritos", "servicos", "faq"],
    avatar: "",
    ativo: true,
    criadoEm: "2026-02-15",
    ultimoAcesso: "2026-04-12",
    descricao: "Editor de conteúdo: notícias, eventos e cursos",
  },
  {
    id: "op-atendimento-001",
    nome: "Fernanda Costa",
    email: "atendimento@inprec.net",
    senha: "atend@2026",
    nivelAcesso: "operador",
    permissoes: ["dashboard", "contato-admin", "pesquisa-admin", "chat-admin", "ouvidoria-admin"],
    avatar: "",
    ativo: false,
    criadoEm: "2026-03-01",
    descricao: "Atendimento ao servidor: chat, contato e pesquisa",
  },
];
