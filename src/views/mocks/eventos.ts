export interface Evento {
  id: number;
  titulo: string;
  tipo: "audiencia" | "evento" | "reuniao" | "capacitacao" | "curso";
  data: string;
  hora: string;
  local: string;
  descricao: string;
  imagem: string;
  status: "aberto" | "encerrado" | "em-breve";
  vagas?: number;
  vagasRestantes?: number;
  online: boolean;
  linkOnline?: string;
  palestrante?: string;
  categoria: string;
  cargaHoraria?: string;
  certificado?: boolean;
  bannerUrl?: string;
  pdfUrl?: string;
  conteudoProgramatico?: string;
}

export const eventos: Evento[] = [];
