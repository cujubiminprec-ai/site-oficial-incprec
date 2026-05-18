import { useCallback } from "react";

export type StatusProtocolo = "pendente" | "em-analise" | "respondida" | "arquivada";

export interface RegistroProtocolo {
  protocolo: string;
  tipo: string;
  assunto: string;
  status: StatusProtocolo;
  dataEnvio: string;      // ISO string
  email: string;
  prazoResposta: string;  // ISO string
  resposta?: string;
}

const STORAGE_KEY_OUVIDORIA = "inprec_ouvidoria_protocolos";
const STORAGE_KEY_LAI       = "inprec_lai_protocolos";

function gerarCodigo(prefixo: string): string {
  const agora = new Date();
  const ano  = agora.getFullYear();
  const mes  = String(agora.getMonth() + 1).padStart(2, "0");
  const dia  = String(agora.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefixo}-${ano}${mes}${dia}-${rand}`;
}

function calcularPrazo(diasUteis: number): string {
  const data = new Date();
  let adicionados = 0;
  while (adicionados < diasUteis) {
    data.setDate(data.getDate() + 1);
    const diaSemana = data.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) adicionados++;
  }
  return data.toISOString();
}

function lerRegistros(storageKey: string): RegistroProtocolo[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as RegistroProtocolo[]) : [];
  } catch {
    return [];
  }
}

function salvarRegistros(storageKey: string, registros: RegistroProtocolo[]): void {
  localStorage.setItem(storageKey, JSON.stringify(registros));
}

export function useProtocoloOuvidoria() {
  const registrar = useCallback(
    (dados: { tipo: string; assunto: string; email: string }): string => {
      const codigo = gerarCodigo("OUV");
      const registro: RegistroProtocolo = {
        protocolo: codigo,
        tipo:       dados.tipo,
        assunto:    dados.assunto,
        email:      dados.email,
        status:     "pendente",
        dataEnvio:  new Date().toISOString(),
        prazoResposta: calcularPrazo(20),
      };
      const lista = lerRegistros(STORAGE_KEY_OUVIDORIA);
      salvarRegistros(STORAGE_KEY_OUVIDORIA, [registro, ...lista]);
      return codigo;
    },
    []
  );

  const consultar = useCallback((codigo: string): RegistroProtocolo | null => {
    const lista = lerRegistros(STORAGE_KEY_OUVIDORIA);
    return lista.find(r => r.protocolo.toUpperCase() === codigo.toUpperCase()) ?? null;
  }, []);

  return { registrar, consultar };
}

export function useProtocoloLAI() {
  const registrar = useCallback(
    (dados: { tipo: string; assunto: string; email: string }): string => {
      const codigo = gerarCodigo("LAI");
      const registro: RegistroProtocolo = {
        protocolo: codigo,
        tipo:       dados.tipo,
        assunto:    dados.assunto,
        email:      dados.email,
        status:     "pendente",
        dataEnvio:  new Date().toISOString(),
        prazoResposta: calcularPrazo(20),
      };
      const lista = lerRegistros(STORAGE_KEY_LAI);
      salvarRegistros(STORAGE_KEY_LAI, [registro, ...lista]);
      return codigo;
    },
    []
  );

  const consultar = useCallback((codigo: string): RegistroProtocolo | null => {
    const lista = lerRegistros(STORAGE_KEY_LAI);
    return lista.find(r => r.protocolo.toUpperCase() === codigo.toUpperCase()) ?? null;
  }, []);

  return { registrar, consultar };
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const STATUS_CONFIG: Record<StatusProtocolo, { label: string; cor: string; icone: string }> = {
  pendente:     { label: "Pendente",     cor: "#D97706", icone: "ri-time-line" },
  "em-analise": { label: "Em análise",   cor: "#2563EB", icone: "ri-search-line" },
  respondida:   { label: "Respondida",   cor: "#059669", icone: "ri-check-double-line" },
  arquivada:    { label: "Arquivada",    cor: "#6B7280", icone: "ri-archive-line" },
};
