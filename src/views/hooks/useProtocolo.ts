export type StatusProtocolo = "pendente" | "em-analise" | "respondida" | "arquivada";

export interface RegistroProtocolo {
  protocolo: string;
  tipo: string;
  assunto: string;
  status: StatusProtocolo;
  dataEnvio: string;
  email: string;
  prazoResposta: string;
  resposta?: string;
}

export function useProtocoloOuvidoria() {
  return {
    registrar: () => "",
    consultar: () => null as RegistroProtocolo | null,
  };
}

export function useProtocoloLAI() {
  return {
    registrar: () => "",
    consultar: () => null as RegistroProtocolo | null,
  };
}

export function formatarData(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const STATUS_CONFIG: Record<StatusProtocolo, { label: string; cor: string; icone: string }> = {
  pendente: { label: "Pendente", cor: "#D97706", icone: "ri-time-line" },
  "em-analise": { label: "Em análise", cor: "#2563EB", icone: "ri-search-line" },
  respondida: { label: "Respondida", cor: "#059669", icone: "ri-check-double-line" },
  arquivada: { label: "Arquivada", cor: "#6B7280", icone: "ri-archive-line" },
};
