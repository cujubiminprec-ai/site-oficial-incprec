export interface DocFinanceiro {
  id: number;
  titulo: string;
  secao: string;
  ano: number;
  tipo: string;
  tamanho: string;
  data: string;
  link: string;
  ativo: boolean;
  descricao?: string;
}

export const secoesFinancas = [
  { key: "visao-geral", label: "Visão Geral", icon: "ri-dashboard-line" },
  { key: "prestacao-contas", label: "Prestação de Contas", icon: "ri-file-list-3-line" },
  { key: "avaliacao-atuarial", label: "Avaliação Atuarial", icon: "ri-survey-line" },
  { key: "balanco-anual", label: "Balanço Anual", icon: "ri-bar-chart-box-line" },
  { key: "balancetes", label: "Balancetes de Receitas e Despesas", icon: "ri-file-chart-line" },
  { key: "credenciamento", label: "Credenciamento de Inst. Financeiras", icon: "ri-bank-line" },
  { key: "investimentos", label: "Investimentos (DAIR / APR)", icon: "ri-line-chart-line" },
  { key: "relatorio-completo", label: "Relatório Completo", icon: "ri-file-paper-2-line" },
  { key: "relatorio-consolidado", label: "Relatório Consolidado", icon: "ri-file-copy-2-line" },
  { key: "politica-investimentos", label: "Política de Investimentos", icon: "ri-funds-line" },
];

export const docsFinanceiros: DocFinanceiro[] = [];
