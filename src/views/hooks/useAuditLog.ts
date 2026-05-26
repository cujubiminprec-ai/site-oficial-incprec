import { useCallback } from "react";
import { apiFetch } from "@/services/api";
import { AuditoriaRegistro, AuditoriaAcao, AuditoriaModulo } from "@/mocks/auditoria";

export async function loadAuditLog(): Promise<AuditoriaRegistro[]> {
  return apiFetch<AuditoriaRegistro[]>("/auditoria");
}

export async function clearAuditLog(): Promise<void> {
  await apiFetch<void>("/auditoria", { method: "DELETE" });
}

export function appendAuditEntry(
  _usuarioId: string,
  _usuarioNome: string,
  _usuarioEmail: string,
  _acao: AuditoriaAcao,
  _modulo: AuditoriaModulo,
  _descricao: string,
  _detalhes?: string
): void {}

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
    [usuarioEmail, usuarioId, usuarioNome]
  );

  return { registrar };
}
