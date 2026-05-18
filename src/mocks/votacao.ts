export interface Candidato {
  id: number;
  numero: number;
  nomeCompleto: string;
  foto: string;
  cargo: string;
  conselho: "deliberativo" | "fiscal" | "comite_investimento";
  tipo: "titular" | "suplente";
  matricula: string;
  lotacao: string;
  categoria: "servidor_ativo" | "aposentado";
  slogan: string;
  proposta: string;
  ativo: boolean;
}

export interface VotacaoConfig {
  ativa: boolean;
  exibirResultados: boolean;
  exibirNumeros: boolean;
  exibirFotos: boolean;
  permitirCandidatura: boolean;
  linkInscricaoOnline: string;
  mensagemInscricao: string;
  tituloVotacao: string;
}

export const votacaoConfigDefault: VotacaoConfig = {
  ativa: false,
  exibirResultados: false,
  exibirNumeros: true,
  exibirFotos: true,
  permitirCandidatura: false,
  linkInscricaoOnline: "",
  mensagemInscricao: "",
  tituloVotacao: "Candidatos à Eleição",
};

export const candidatosDefault: Candidato[] = [];
