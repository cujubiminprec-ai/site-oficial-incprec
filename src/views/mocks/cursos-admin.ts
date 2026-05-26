export interface CursoItem {
  id: number;
  titulo: string;
  tipo: "curso" | "capacitacao";
  categoria: string;
  status: "aberto" | "em-breve" | "encerrado" | "rascunho";
  data: string;
  dataFim?: string;
  hora: string;
  local: string;
  descricao: string;
  conteudoProgramatico: string;
  palestrante: string;
  cargaHoraria: string;
  certificado: boolean;
  vagasIlimitadas: boolean;
  vagas: number;
  vagasRestantes: number;
  online: boolean;
  linkOnline?: string;
  bannerUrl: string;
  pdfUrl: string;
  imagem: string;
  publicado: boolean;
  destaque: boolean;
  criado: string;
}

export const cursosAdminDefault: CursoItem[] = [];
