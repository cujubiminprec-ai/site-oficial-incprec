export type AuditoriaAcao =
  | "login"
  | "logout"
  | "criar"
  | "editar"
  | "atualizar"
  | "responder"
  | "excluir"
  | "ativar"
  | "desativar"
  | "publicar"
  | "arquivar"
  | "exportar"
  | "upload"
  | "configurar"
  | "restaurar";

export type AuditoriaModulo = string;

export interface AuditoriaRegistro {
  id: string;
  timestamp: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  acao: AuditoriaAcao;
  modulo: AuditoriaModulo;
  descricao: string;
  detalhes?: string;
  ip?: string;
}

export const AUDITORIA_STORAGE_KEY = "inprec_auditoria_log";
export const AUDITORIA_MAX_REGISTROS = 500;

export const auditoriaDefault: AuditoriaRegistro[] = [];
