import { useCallback } from "react";
import {
  AuditoriaRegistro,
  AuditoriaAcao,
  AuditoriaModulo,
  AUDITORIA_STORAGE_KEY,
  AUDITORIA_MAX_REGISTROS,
  auditoriaDefault,
} from "@/mocks/auditoria";

export function loadAuditLog(): AuditoriaRegistro[] {
  try {
    const s = localStorage.getItem(AUDITORIA_STORAGE_KEY);
    return s ? JSON.parse(s) : auditoriaDefault;
  } catch {
    return auditoriaDefault;
  }
}

function saveAuditLog(registros: AuditoriaRegistro[]): void {
  // Mantém apenas os N mais recentes
  const trimmed = registros.slice(0, AUDITORIA_MAX_REGISTROS);
  localStorage.setItem(AUDITORIA_STORAGE_KEY, JSON.stringify(trimmed));
}

export function appendAuditEntry(
  usuarioId: string,
  usuarioNome: string,
  usuarioEmail: string,
  acao: AuditoriaAcao,
  modulo: AuditoriaModulo,
  descricao: string,
  detalhes?: string
): void {
  const atual = loadAuditLog();
  const novoRegistro: AuditoriaRegistro = {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    usuarioId,
    usuarioNome,
    usuarioEmail,
    acao,
    modulo,
    descricao,
    detalhes,
  };
  saveAuditLog([novoRegistro, ...atual]);
}

interface UseAuditLogReturn {
  registrar: (
    acao: AuditoriaAcao,
    modulo: AuditoriaModulo,
    descricao: string,
    detalhes?: string
  ) => void;
}

export function useAuditLog(
  usuarioId: string,
  usuarioNome: string,
  usuarioEmail: string
): UseAuditLogReturn {
  const registrar = useCallback(
    (
      acao: AuditoriaAcao,
      modulo: AuditoriaModulo,
      descricao: string,
      detalhes?: string
    ) => {
      appendAuditEntry(usuarioId, usuarioNome, usuarioEmail, acao, modulo, descricao, detalhes);
    },
    [usuarioId, usuarioNome, usuarioEmail]
  );

  return { registrar };
}
