export type SecaoTransparencia = "primario" | "secundario" | "recursos" | "financas" | "lgpd";

export interface DocumentoTransparencia {
  id: number;
  titulo: string;
  descricao?: string;
  secao: SecaoTransparencia;
  menu: string;
  categoria: string;
  ano: number;
  tamanho: string;
  tipo: string;
  data: string;
  icone: string;
  link?: string;
  arquivoNome?: string;
  ativo?: boolean;
}

export const secoesTransparencia: { key: SecaoTransparencia; label: string; descricao: string; icon: string }[] = [
  { key: "primario", label: "Menu Primário", descricao: "Documentos dos principais itens do Portal da Transparência", icon: "ri-layout-grid-line" },
  { key: "secundario", label: "Menu Secundário", descricao: "Documentos e atalhos complementares", icon: "ri-node-tree" },
  { key: "recursos", label: "Links e recursos complementares", descricao: "Arquivos de apoio, links externos e materiais extras", icon: "ri-links-line" },
  { key: "financas", label: "Finanças e Investimentos", descricao: "Prestação de contas, balanços, investimentos e relatórios financeiros", icon: "ri-line-chart-line" },
  { key: "lgpd", label: "LGPD", descricao: "Documentos da Lei Geral de Proteção de Dados", icon: "ri-shield-user-line" },
];

export interface TransparenciaMenu {
  id: string;
  icon: string;
  titulo: string;
  descricao: string;
  href?: string;
  ativo?: boolean;
}

export const defaultMenusPrimarios: TransparenciaMenu[] = [
  { id: "1", icon: "ri-organization-chart", titulo: "Estrutura Organizacional", descricao: "Organograma, cargos e competencias", href: "/estrutura", ativo: true },
  { id: "2", icon: "ri-speak-line", titulo: "Ouvidoria", descricao: "Denuncias, reclamacoes e sugestoes", href: "/ouvidoria", ativo: true },
  { id: "3", icon: "ri-scales-3-line", titulo: "Legislacao", descricao: "Base legal do RPPS e normas vigentes", href: "/legislacao", ativo: true },
  { id: "4", icon: "ri-group-2-line", titulo: "Orgaos Colegiados", descricao: "Conselhos Deliberativo e Fiscal", href: "/gestores", ativo: true },
  { id: "5", icon: "ri-money-dollar-box-line", titulo: "Receitas", descricao: "Arrecadacao e fontes de receita", ativo: true },
  { id: "6", icon: "ri-coins-line", titulo: "Despesas", descricao: "Gastos e pagamentos realizados", ativo: true },
  { id: "7", icon: "ri-funds-line", titulo: "Investimentos", descricao: "Carteira de ativos e rentabilidade", ativo: true },
  { id: "8", icon: "ri-team-line", titulo: "Gestao de Pessoas", descricao: "Quadro de servidores e remuneracoes", href: "https://transparencia.cujubim.ro.gov.br/novo/PREVIDENCIA/2026/18/recursos-humanos/folha-pagamento?tipo_referencia=2590&perPage=10&page=1", ativo: true },
  { id: "9", icon: "ri-shield-check-line", titulo: "PRO-GESTÃO", descricao: "Programa de certificacao institucional", href: "https://transparencia.cujubim.ro.gov.br/novo/PREVIDENCIA/publicacoes/documentos/2026/10?grupo=141&perPage=10&page=1", ativo: true },
  { id: "10", icon: "ri-line-chart-line", titulo: "Relatorio de Gestão dos Investimentos", descricao: "Relatorios de gestao de investimentos", href: "https://transparencia.cujubim.ro.gov.br/novo/PREVIDENCIA/publicacoes/documentos/2026/10?empresa%5B0%5D=9&grupo=131&page=1&perPage=10", ativo: true },
  { id: "11", icon: "ri-bank-card-line", titulo: "Credenciamento das Instituições Financeiras", descricao: "Credenciamento de bancos e fundos de investimentos", href: "https://transparencia.cujubim.ro.gov.br/novo/PREVIDENCIA/publicacoes/documentos/2026/10?grupo=101&subgrupos[0]=112&perPage=10&page=1", ativo: true },
  { id: "12", icon: "ri-auction-line", titulo: "Licitacoes e Contratos", descricao: "Processos licitatorios e contratos", ativo: true },
  { id: "13", icon: "ri-truck-line", titulo: "Fornecedores e Repasses", descricao: "Repasses a terceiros e fornecedores", ativo: true },
  { id: "14", icon: "ri-folder-info-line", titulo: "e-SIC / LAI", descricao: "Sistema de Informacao ao Cidadao", href: "/lai", ativo: true },
  { id: "15", icon: "ri-calendar-todo-line", titulo: "Planejamento Governamental", descricao: "PPA, LDO, LOA e metas fiscais", ativo: true },
  { id: "16", icon: "ri-bank-line", titulo: "Prestacao de Contas", descricao: "Relatorios anuais e pareceres", ativo: true },
  { id: "17", icon: "ri-file-chart-2-line", titulo: "Relatorios e Demonstrativos", descricao: "DIPR, DAIR e demonstracoes contabeis", ativo: true },
  { id: "18", icon: "ri-megaphone-line", titulo: "Acoes de Dialogos com Segurados", descricao: "Reunioes, audiencias e comunicados", href: "/eventos", ativo: true },
  { id: "19", icon: "ri-bar-chart-grouped-line", titulo: "Dashboards INPREC", descricao: "Indicadores e dados em tempo real", ativo: true },
];

export function obterMenusPrimariosDinamicos(): TransparenciaMenu[] {
  return defaultMenusPrimarios;
}

export const menusPrimarios = obterMenusPrimariosDinamicos().map((m) => m.titulo);

export const menusSecundarios = [
  "Legislacao Estadual",
  "Ouvidoria Geral",
  "Governo do Estado",
  "Enderecos INPREC",
  "Recadastramento INPREC",
  "CADPREV",
];

export const menusRecursos = [
  "Links uteis",
  "Manuais",
  "Cartilhas",
  "Sistemas externos",
  "Publicacoes complementares",
];

export const menusFinancas = [
  "Visão Geral",
  "Prestação de Contas",
  "Avaliação Atuarial",
  "Balanço Anual",
  "Balancetes de Receitas e Despesas",
  "Credenciamento de Inst. Financeiras",
  "Investimentos (DAIR / APR)",
  "Relatório Completo",
  "Relatório Consolidado",
  "Política de Investimentos",
];

export const menusLGPD = [
  "Encarregado de Dados Pessoais",
  "Termo de Consentimento do Uso de Dados",
  "Legislacao LGPD",
  "Canais de Comunicacao",
  "Cartilha",
  "Politica de Privacidade e Protecao de Dados",
  "Programa de Governanca em Privacidade",
  "Perguntas Frequentes",
  "Aviso de Privacidade",
];

const menusPorSecaoRaw = {
  primario: defaultMenusPrimarios.map((m) => m.titulo),
  secundario: menusSecundarios,
  recursos: menusRecursos,
  financas: menusFinancas,
  lgpd: menusLGPD,
};

export const menusPorSecao: Record<SecaoTransparencia, string[]> = new Proxy(menusPorSecaoRaw, {
  get(target, prop: SecaoTransparencia) {
    if (prop === "primario") {
      return obterMenusPrimariosDinamicos().map((m) => m.titulo);
    }
    return target[prop];
  }
}) as unknown as Record<SecaoTransparencia, string[]>;

export const categoriasDocs = ["Todos", "Relatorios", "Balancos", "Prestacao de Contas", "Licitacoes", "Contratos", "Avaliacoes", "Portarias", "LGPD", "Links", "Outros"];
export const anosDocs = ["Todos", "2026", "2025", "2024", "2023", "2022", "2021", "2020"];

export const documentos: DocumentoTransparencia[] = [];
