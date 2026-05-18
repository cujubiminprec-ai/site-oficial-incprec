export interface PainelSlide {
  id: number;
  titulo: string;
  embedUrl: string;
  sourceUrl?: string;
  tipo?: "PDF" | "PPT" | "LINK";
  tamanho?: string;
  ativo: boolean;
  ordem: number;
  descricao?: string;
  dataAtualizacao?: string;
  slidesImg?: string[];
}

export const painelTransparenciaDefault: PainelSlide[] = [
  {
    id: 1,
    titulo: "Avaliação Atuarial 2026",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: 1,
    descricao: "Estudo técnico que analisa os compromissos futuros do regime próprio de previdência social e define o plano de custeio atuarial.",
    dataAtualizacao: "2026-02-15",
    slidesImg: []
  },
  {
    id: 2,
    titulo: "Relatório Financeiro Fevereiro/2026",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: 2,
    descricao: "Demonstrativo detalhado das receitas arrecadadas, despesas previdenciárias e fluxo de caixa mensal do INPREC.",
    dataAtualizacao: "2026-03-05",
    slidesImg: []
  },
  {
    id: 3,
    titulo: "Relatório de Investimentos Anual 2025",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: 3,
    descricao: "Análise consolidada da carteira de investimentos do instituto no ano, incluindo rentabilidade, alocação por ativos e aderência à Política de Investimentos.",
    dataAtualizacao: "2026-01-20",
    slidesImg: []
  },
  {
    id: 4,
    titulo: "Relatório Investimentos 3º Trimestre 2025",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: 4,
    descricao: "Desempenho trimestral das aplicações financeiras, rentabilidade comparada com o meta atuarial e relatórios de enquadramento do terceiro trimestre.",
    dataAtualizacao: "2025-10-15",
    slidesImg: []
  },
  {
    id: 5,
    titulo: "Demonstrativo de Aplicações 2025",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: 5,
    descricao: "DAIR (Demonstrativo das Aplicações e Investimentos dos Recursos) contendo a prestação de contas mensal enviada à Secretaria de Previdência.",
    dataAtualizacao: "2025-12-31",
    slidesImg: []
  },
  {
    id: 6,
    titulo: "Balanço Anual 2024",
    embedUrl: "",
    sourceUrl: "",
    tipo: "PDF",
    tamanho: "",
    ativo: true,
    ordem: 6,
    descricao: "Demonstrações contábeis consolidadas do exercício de 2024, compreendendo o balanço patrimonial, orçamentário e financeiro.",
    dataAtualizacao: "2025-03-25",
    slidesImg: []
  }
];

export const painelTransparenciaConfigDefault = {
  titulo: "Painel de Transparência",
  subtitulo: "Acompanhe os relatórios e documentos financeiros do INPREC em tempo real",
  cardHeight: 360,
  columnsLayout: "2",
  autoSlideDelay: 5000,
  showFixedSix: true,
  layoutVersion: "painel-flex-grid-v2"
};
