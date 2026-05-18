import { gestores as gestoresMock, Gestor } from "@/mocks/gestores";

export const GESTORES_STORAGE_KEY = "inprec_gestores";
export const GESTORES_UPDATED_EVENT = "inprec-gestores-updated";

const nomesBaseAntiga = [
  "Dr. Carlos Eduardo Mendes",
  "Dra. Fernanda Lima",
  "Dr. Ricardo Souza",
  "Dra. PatrÃ­cia Alves",
  "Dra. Patrícia Alves",
];

export function carregarGestoresAtualizados(): Gestor[] {
  try {
    const saved = localStorage.getItem(GESTORES_STORAGE_KEY);
    if (!saved) return gestoresMock;
    const parsed = JSON.parse(saved) as Gestor[];
    if (!Array.isArray(parsed)) return gestoresMock;
    const temBaseAntiga = parsed.some((g) => nomesBaseAntiga.includes(g.nome));
    const temComposicaoAtual = parsed.some((g) => g.nome === "Elias Cruz Santos");
    return temBaseAntiga || !temComposicaoAtual ? gestoresMock : parsed;
  } catch {
    return gestoresMock;
  }
}

export function salvarGestoresAtualizados(gestores: Gestor[]): Gestor[] {
  localStorage.setItem(GESTORES_STORAGE_KEY, JSON.stringify(gestores));
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event(GESTORES_UPDATED_EVENT));
  return gestores;
}
