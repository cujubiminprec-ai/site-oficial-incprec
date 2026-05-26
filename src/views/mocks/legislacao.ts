export interface Lei {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: "Lei Federal" | "Lei Municipal" | "Decreto" | "Resolução" | "Portaria" | "Instrução Normativa";
  ano: number;
  publicacao: string;
  link?: string;
  destaque?: boolean;
}

export const categorias = [
  "Todas",
  "RPPS - Regime Geral",
  "Aposentadoria",
  "Pensão por Morte",
  "Contribuição Previdenciária",
  "Gestão de Investimentos",
  "Transparência e Controle",
  "Benefícios",
  "Legislação Municipal",
];

export const leis: Lei[] = [];
