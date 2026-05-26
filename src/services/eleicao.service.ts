import { apiFetch, getToken } from "./api";

export interface EleicaoConfig {
  titulo: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  status: string;
  eleitoresAptos?: number;
  [key: string]: any;
}

export interface Candidato {
  id: number;
  numero: number;
  nome: string;
  nomeCompleto: string;
  cargo: string;
  cargoCandidato: string;
  conselho: string;
  foto: string;
  fotoUrl: string;
  bio: string;
  proposta: string;
  votos: number;
  ativo: boolean;
  eleito?: boolean;
  [key: string]: any;
}

export const eleicaoService = {
  obterConfig(): Promise<any> {
    return apiFetch<any>("/eleicao/config");
  },
  salvarConfig(payload: any): Promise<any> {
    const token = getToken();
    return apiFetch<any>("/eleicao/config", { method: "PUT", body: payload, token });
  },
  obterVotacaoConfig(): Promise<Record<string, any>> {
    return apiFetch<Record<string, any>>("/eleicao/votacao-config");
  },
  salvarVotacaoConfig(payload: Record<string, any>): Promise<Record<string, any>> {
    const token = getToken();
    return apiFetch<Record<string, any>>("/eleicao/votacao-config", { method: "PUT", body: payload, token });
  },
  listarCandidatos(): Promise<any[]> {
    return apiFetch<any[]>("/eleicao/candidatos");
  },
  listarCandidatosAdmin(): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/eleicao/candidatos/admin", { token });
  },
  salvarCandidatos(candidatos: any[]): Promise<any[]> {
    const token = getToken();
    return apiFetch<any[]>("/eleicao/candidatos/bulk", { method: "PUT", body: { candidatos }, token });
  },
  enviarInscricaoCandidatura(payload: Record<string, unknown>): Promise<unknown> {
    return apiFetch("/eleicao/candidatura", { method: "POST", body: payload });
  },
};
