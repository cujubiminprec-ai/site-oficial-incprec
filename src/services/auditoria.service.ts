import { apiFetch, getToken } from "./api";
import type { AuditoriaAcao } from "@/mocks/auditoria";

export interface AuditoriaRegistro {
  id: string;
  timestamp: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  acao: AuditoriaAcao;
  modulo: string;
  descricao: string;
  detalhes?: string;
  [key: string]: any;
}

export const auditoriaService = {
  listar() {
    return apiFetch<AuditoriaRegistro[]>("/auditoria", { token: getToken() });
  },
  limpar() {
    return apiFetch("/auditoria", { method: "DELETE", token: getToken() });
  },
};
