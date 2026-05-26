/**
 * Gera código de protocolo único para Ouvidoria e LAI.
 * Formato: OUV-YYYYMMDD-XXXX ou LAI-YYYYMMDD-XXXX
 */
export function gerarProtocolo(prefixo: "OUV" | "LAI"): string {
  const agora   = new Date();
  const ano     = agora.getFullYear();
  const mes     = String(agora.getMonth() + 1).padStart(2, "0");
  const dia     = String(agora.getDate()).padStart(2, "0");
  const aleatorio = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `${prefixo}-${ano}${mes}${dia}-${aleatorio}`;
}

/**
 * Calcula prazo legal em dias corridos a partir de hoje.
 */
export function calcularPrazoLegal(diasCorridos: number): string {
  const prazo = new Date();
  prazo.setDate(prazo.getDate() + diasCorridos);
  return prazo.toISOString().split("T")[0]; // YYYY-MM-DD
}
