export type HomeSectionKind =
  | "builtin"
  | "custom";

export type HomeSectionKey =
  | "hero"
  | "acesso"
  | "eleicao"
  | "painel"
  | "servicos"
  | "quem"
  | "noticias"
  | "progestao"
  | "transparencia"
  | "contato"
  | `custom-${string}`;

export interface HomeSectionConfig {
  id: HomeSectionKey;
  kind: HomeSectionKind;
  titulo: string;
  descricao: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  cor?: string;
  linkLabel?: string;
  linkUrl?: string;
}

export const HOME_SECTIONS_STORAGE_KEY = "inprec_home_sections";
export const HOME_SECTIONS_UPDATED_EVENT = "inprec-home-sections-updated";

export const homeSectionsDefault: HomeSectionConfig[] = [
  { id: "hero", kind: "builtin", titulo: "Slides da Home", descricao: "Banner principal com carrossel de imagens.", icone: "ri-slideshow-line", ativo: true, ordem: 1, cor: "#059669" },
  { id: "acesso", kind: "builtin", titulo: "Acesso Rapido", descricao: "Atalhos principais do portal.", icone: "ri-dashboard-3-line", ativo: true, ordem: 2, cor: "#0891B2" },
  { id: "eleicao", kind: "builtin", titulo: "Eleicao / Conselhos", descricao: "Banner de eleicao e participacao.", icone: "ri-checkbox-circle-line", ativo: true, ordem: 3, cor: "#7C3AED" },
  { id: "painel", kind: "builtin", titulo: "Painel de Transparencia", descricao: "Relatorios institucionais e documentos financeiros.", icone: "ri-bar-chart-box-line", ativo: true, ordem: 4, cor: "#16A34A" },
  { id: "servicos", kind: "builtin", titulo: "Servicos", descricao: "Cards de servicos do INPREC.", icone: "ri-service-line", ativo: true, ordem: 5, cor: "#2563EB" },
  { id: "quem", kind: "builtin", titulo: "Quem Somos", descricao: "Apresentacao institucional do INPREC.", icone: "ri-building-2-line", ativo: true, ordem: 6, cor: "#0F766E" },
  { id: "noticias", kind: "builtin", titulo: "Noticias", descricao: "Ultimas noticias publicadas.", icone: "ri-newspaper-line", ativo: true, ordem: 7, cor: "#D97706" },
  { id: "progestao", kind: "builtin", titulo: "Pro-Gestao", descricao: "Bloco institucional de certificacao e gestao.", icone: "ri-award-line", ativo: true, ordem: 8, cor: "#9333EA" },
  { id: "transparencia", kind: "builtin", titulo: "Transparencia", descricao: "Documentos e recursos de transparencia.", icone: "ri-file-chart-line", ativo: true, ordem: 9, cor: "#047857" },
  { id: "contato", kind: "builtin", titulo: "Contato", descricao: "Informacoes de contato e localizacao.", icone: "ri-contacts-line", ativo: true, ordem: 10, cor: "#DC2626" },
];

export function normalizeHomeSections(list: Partial<HomeSectionConfig>[] | null | undefined): HomeSectionConfig[] {
  const saved = Array.isArray(list) ? list : [];
  const merged = homeSectionsDefault.map((def) => ({ ...def, ...(saved.find((item) => item.id === def.id) || {}) }));
  const custom = saved
    .filter((item) => item.kind === "custom" && item.id && !homeSectionsDefault.some((def) => def.id === item.id))
    .map((item, index) => ({
      id: item.id as HomeSectionKey,
      kind: "custom" as const,
      titulo: item.titulo || `Bloco personalizado ${index + 1}`,
      descricao: item.descricao || "",
      icone: item.icone || "ri-layout-row-line",
      ativo: item.ativo !== false,
      ordem: Number(item.ordem || merged.length + index + 1),
      cor: item.cor || "#059669",
      linkLabel: item.linkLabel || "",
      linkUrl: item.linkUrl || "",
    }));

  return [...merged, ...custom]
    .sort((a, b) => Number(a.ordem) - Number(b.ordem))
    .map((item, index) => ({ ...item, ordem: index + 1 }));
}

export function loadHomeSections(): HomeSectionConfig[] {
  try {
    const saved = localStorage.getItem(HOME_SECTIONS_STORAGE_KEY);
    return normalizeHomeSections(saved ? JSON.parse(saved) : homeSectionsDefault);
  } catch {
    return normalizeHomeSections(homeSectionsDefault);
  }
}

export function saveHomeSections(sections: Partial<HomeSectionConfig>[]): HomeSectionConfig[] {
  const normalized = normalizeHomeSections(sections);
  localStorage.setItem(HOME_SECTIONS_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event(HOME_SECTIONS_UPDATED_EVENT));
  return normalized;
}
