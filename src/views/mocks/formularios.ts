export interface Formulario {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: string;
  tamanho: string;
  dataPublicacao: string;
  url?: string;
  ativo: boolean;
  destaque?: boolean;
}

export const categoriasFormularios = [
  "Aposentadoria",
  "Pensão",
  "Requerimentos Gerais",
  "Check-Lists",
  "Declarações",
  "Isenção de IR",
];

export const formularios: Formulario[] = [
  { id: 1, titulo: "Check-List — Aposentadoria Compulsória", descricao: "Lista de documentos necessários para requerimento de aposentadoria compulsória por idade", categoria: "Check-Lists", tipo: "PDF", tamanho: "185 KB", dataPublicacao: "2024-01-10", ativo: true, destaque: true },
  { id: 2, titulo: "Check-List — Aposentadoria de Professor", descricao: "Documentação exigida para professores solicitarem aposentadoria especial", categoria: "Check-Lists", tipo: "PDF", tamanho: "190 KB", dataPublicacao: "2024-01-10", ativo: true, destaque: true },
  { id: 3, titulo: "Check-List — Aposentadoria por Incapacidade Permanente", descricao: "Lista de documentos para aposentadoria por incapacidade permanente (invalidez)", categoria: "Check-Lists", tipo: "PDF", tamanho: "192 KB", dataPublicacao: "2024-01-10", ativo: true },
  { id: 4, titulo: "Check-List — Aposentadoria Voluntária", descricao: "Check-list para solicitação de aposentadoria voluntária por tempo de contribuição", categoria: "Check-Lists", tipo: "PDF", tamanho: "188 KB", dataPublicacao: "2024-01-10", ativo: true },
  { id: 5, titulo: "Check-List — Aposentadoria em Atividade Nociva à Saúde", descricao: "Documentação para aposentadoria de servidor exposto a agentes nocivos à saúde", categoria: "Check-Lists", tipo: "PDF", tamanho: "195 KB", dataPublicacao: "2024-01-10", ativo: true },
  { id: 6, titulo: "Check-List — Isenção de Imposto de Renda", descricao: "Documentos necessários para solicitação de isenção de IRRF sobre benefícios previdenciários", categoria: "Isenção de IR", tipo: "PDF", tamanho: "175 KB", dataPublicacao: "2024-02-01", ativo: true },
  { id: 7, titulo: "Check-List — Averbação de Tempo de Contribuição de Outros Regimes", descricao: "Lista de documentos para averbação de certidão de tempo de contribuição de outros regimes previdenciários", categoria: "Check-Lists", tipo: "PDF", tamanho: "182 KB", dataPublicacao: "2024-02-01", ativo: true },
  { id: 8, titulo: "Formulário — Declaração de Acúmulo de Cargos e/ou Benefícios Previdenciários", descricao: "Declaração obrigatória de acúmulo de cargos ou benefícios junto ao INPREC", categoria: "Declarações", tipo: "PDF", tamanho: "120 KB", dataPublicacao: "2024-02-15", ativo: true },
  { id: 9, titulo: "Formulário — Termo de Opção por Benefício Mais Vantajoso", descricao: "Formulário de opção pelo benefício previdenciário mais vantajoso entre regimes", categoria: "Requerimentos Gerais", tipo: "PDF", tamanho: "115 KB", dataPublicacao: "2024-03-01", ativo: true },
  { id: 10, titulo: "Requerimento de Aposentadorias — Direito Adquirido (Regras Anteriores)", descricao: "Formulário para requerimento de aposentadoria com base em regras anteriores — Direito Adquirido", categoria: "Aposentadoria", tipo: "PDF", tamanho: "140 KB", dataPublicacao: "2024-03-01", ativo: true, destaque: true },
  { id: 11, titulo: "Requerimento Geral", descricao: "Formulário de requerimento geral para solicitação de serviços ao INPREC", categoria: "Requerimentos Gerais", tipo: "PDF", tamanho: "98 KB", dataPublicacao: "2024-03-01", ativo: true },
  { id: 12, titulo: "Requerimento de Pensão por Morte", descricao: "Formulário de requerimento de pensão por morte para dependentes de servidor falecido", categoria: "Pensão", tipo: "PDF", tamanho: "130 KB", dataPublicacao: "2024-03-01", ativo: true, destaque: true },
  { id: 13, titulo: "Formulário — Atualização de Dados Cadastrais", descricao: "Formulário para atualização de dados pessoais e cadastrais junto ao INPREC", categoria: "Requerimentos Gerais", tipo: "PDF", tamanho: "105 KB", dataPublicacao: "2024-04-01", ativo: true },
  { id: 14, titulo: "Declaração de Dependentes Econômicos", descricao: "Declaração de dependentes para fins de concessão de pensão por morte e outros benefícios", categoria: "Declarações", tipo: "PDF", tamanho: "112 KB", dataPublicacao: "2024-04-01", ativo: true },
];
