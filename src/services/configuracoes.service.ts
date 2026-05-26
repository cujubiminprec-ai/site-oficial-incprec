import { apiFetch, getToken } from "./api";
import type { BannerAvisoConfig } from "@/components/feature/BannerAviso";
import type { FloatingButtonConfig } from "@/mocks/floating-buttons";
import type { HomeSectionConfig } from "@/mocks/home-sections";

export interface SiteConfigApi {
  primaryColor: string;
  secondaryColor: string;
  siteName: string;
  siteSlogan: string;
  sloganLogo: string;
  whatsapp: string;
  email: string;
  telefone: string;
  endereco: string;
  horario?: string;
  horarioSeg?: string;
  horarioSab?: string;
  horarioDom?: string;
  contrachequeUrl: string;
  mapEmbedUrl?: string;
  logoIcon: string;
  logoImageUrl: string;
  sloganImageUrl: string;
  sloganImageVisivel: boolean;
  sloganImageLocal: string;
  proGestaoSeloUrl: string;
  proGestaoLink: string;
  proGestaoVisivel: boolean;
  proGestaoLocais: string;
  topbarVisivel: boolean;
  topbarEmailVisivel: boolean;
  topbarTelefoneVisivel: boolean;
  topbarRedesVisivel: boolean;
  topbarMapaSiteVisivel: boolean;
  layoutZoom: number;
  fontFamily: string;
  borderRadius: string;
  redeFacebook: string;
  redeInstagram: string;
  redeYoutube: string;
  redeLinkedin: string;
  [key: string]: any;
}

type LegacyConfigRow = Record<string, any>;

const defaultConfig: SiteConfigApi = {
  primaryColor: "#16a34a",
  secondaryColor: "#14532D",
  siteName: "INPREC",
  siteSlogan: "Instituto de Previdencia Municipal",
  sloganLogo: "Cuidando do Futuro de Quem Cuida da Cidade",
  whatsapp: "(69) 99250-9093",
  email: "inprec@cujubim.ro.gov.br",
  telefone: "(69) 99250-9093",
  endereco: "Av. Condor, n 2588 Centro, CEP: 76.864-000",
  horario: "Segunda a Sexta - 07h30 as 13h30",
  horarioSeg: "Segunda a Sexta - 07h30 as 13h30",
  horarioSab: "",
  horarioDom: "",
  contrachequeUrl: "",
  mapEmbedUrl: "",
  logoIcon: "ri-government-line",
  logoImageUrl: "",
  sloganImageUrl: "",
  sloganImageVisivel: true,
  sloganImageLocal: "navbar,footer",
  proGestaoSeloUrl: "",
  proGestaoLink: "/pro-gestao",
  proGestaoVisivel: true,
  proGestaoLocais: "navbar,footer,home,conteudo",
  topbarVisivel: true,
  topbarEmailVisivel: true,
  topbarTelefoneVisivel: true,
  topbarRedesVisivel: true,
  topbarMapaSiteVisivel: true,
  layoutZoom: 100,
  fontFamily: "Poppins",
  borderRadius: "lg",
  redeFacebook: "https://facebook.com/inprec",
  redeInstagram: "https://instagram.com/inprec",
  redeYoutube: "https://youtube.com/@inprec",
  redeLinkedin: "",
};

function boolValue(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "sim", "yes"].includes(value.toLowerCase());
  return fallback;
}

function numberValue(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapConfig(row: LegacyConfigRow | null | undefined): SiteConfigApi {
  if (!row) return defaultConfig;
  return {
    ...defaultConfig,
    ...row,
    primaryColor: row.primaryColor ?? row.cor_primaria ?? defaultConfig.primaryColor,
    secondaryColor: row.secondaryColor ?? row.cor_secundaria ?? defaultConfig.secondaryColor,
    siteName: row.siteName ?? row.nome_site ?? defaultConfig.siteName,
    siteSlogan: row.siteSlogan ?? row.descricao_site ?? defaultConfig.siteSlogan,
    sloganLogo: row.sloganLogo ?? defaultConfig.sloganLogo,
    whatsapp: row.whatsapp ?? row.telefone_whatsapp ?? defaultConfig.whatsapp,
    email: row.email ?? row.email_contato ?? defaultConfig.email,
    telefone: row.telefone ?? row.telefone_principal ?? defaultConfig.telefone,
    endereco: row.endereco ?? ([row.endereco_logradouro, row.endereco_cidade, row.endereco_estado, row.endereco_cep].filter(Boolean).join(", ") || defaultConfig.endereco),
    horario: row.horario ?? row.horario_atendimento ?? defaultConfig.horario,
    horarioSeg: row.horarioSeg ?? row.horario_atendimento ?? defaultConfig.horarioSeg,
    contrachequeUrl: row.contrachequeUrl ?? row.contracheque_url ?? defaultConfig.contrachequeUrl,
    mapEmbedUrl: row.mapEmbedUrl ?? row.map_embed_url ?? defaultConfig.mapEmbedUrl,
    logoIcon: row.logoIcon ?? defaultConfig.logoIcon,
    logoImageUrl: row.logoImageUrl ?? row.logo_url ?? defaultConfig.logoImageUrl,
    sloganImageUrl: row.sloganImageUrl ?? defaultConfig.sloganImageUrl,
    sloganImageVisivel: boolValue(row.sloganImageVisivel, defaultConfig.sloganImageVisivel),
    proGestaoVisivel: boolValue(row.proGestaoVisivel, defaultConfig.proGestaoVisivel),
    topbarVisivel: boolValue(row.topbarVisivel, defaultConfig.topbarVisivel),
    topbarEmailVisivel: boolValue(row.topbarEmailVisivel, defaultConfig.topbarEmailVisivel),
    topbarTelefoneVisivel: boolValue(row.topbarTelefoneVisivel, defaultConfig.topbarTelefoneVisivel),
    topbarRedesVisivel: boolValue(row.topbarRedesVisivel, defaultConfig.topbarRedesVisivel),
    topbarMapaSiteVisivel: boolValue(row.topbarMapaSiteVisivel, defaultConfig.topbarMapaSiteVisivel),
    layoutZoom: numberValue(row.layoutZoom, defaultConfig.layoutZoom),
    fontFamily: row.fontFamily ?? row.fonte_principal ?? defaultConfig.fontFamily,
    redeFacebook: row.redeFacebook ?? row.facebook_url ?? defaultConfig.redeFacebook,
    redeInstagram: row.redeInstagram ?? row.instagram_url ?? defaultConfig.redeInstagram,
    redeYoutube: row.redeYoutube ?? row.youtube_url ?? defaultConfig.redeYoutube,
    redeLinkedin: row.redeLinkedin ?? row.linkedin_url ?? defaultConfig.redeLinkedin,
  };
}

function toLegacyPayload(config: Partial<SiteConfigApi>): Record<string, unknown> {
  return {
    ...config,
    nome_site: config.siteName,
    descricao_site: config.siteSlogan,
    logo_url: config.logoImageUrl,
    cor_primaria: config.primaryColor,
    cor_secundaria: config.secondaryColor,
    fonte_principal: config.fontFamily,
    email_contato: config.email,
    telefone_principal: config.telefone,
    telefone_whatsapp: config.whatsapp,
    horario_atendimento: config.horario ?? config.horarioSeg,
    facebook_url: config.redeFacebook,
    instagram_url: config.redeInstagram,
    youtube_url: config.redeYoutube,
    linkedin_url: config.redeLinkedin,
  };
}

export interface BannerConfig {
  id?: string;
  titulo: string;
  subtitulo?: string;
  imagem?: string;
  link?: string;
  ativo: boolean;
  ordem: number;
  data_inicio?: string;
  data_fim?: string;
}

export const configuracoesService = {
  async listar(): Promise<SiteConfigApi[]> {
    return [await this.obter()];
  },

  async obter(_chave?: string): Promise<SiteConfigApi> {
    const data = await apiFetch<LegacyConfigRow>("/configuracoes");
    return mapConfig(data);
  },

  async atualizar(config: Partial<SiteConfigApi>): Promise<SiteConfigApi> {
    const token = getToken();
    const data = await apiFetch<LegacyConfigRow>("/configuracoes", {
      method: "PUT",
      body: toLegacyPayload(config),
      token,
    });
    return mapConfig(data);
  },

  async obterBanner(): Promise<BannerAvisoConfig | null> {
    const data = await apiFetch<LegacyConfigRow | null>("/configuracoes/banner");
    if (!data) return null;
    return {
      ativo: boolValue(data.ativo, true),
      texto: data.texto ?? data.titulo ?? "",
      cor: data.cor ?? data.cor_fundo ?? "#16a34a",
      textoCor: data.textoCor ?? data.cor_texto ?? "#ffffff",
      link: data.link ?? data.link_url ?? "",
      linkTexto: data.linkTexto ?? data.link_label ?? "",
      icone: data.icone ?? "ri-megaphone-line",
    };
  },

  async salvarBanner(banner: BannerAvisoConfig): Promise<BannerAvisoConfig> {
    const token = getToken();
    const data = await apiFetch<LegacyConfigRow>("/configuracoes/banner", {
      method: "PUT",
      body: {
        texto: banner.texto,
        link_url: banner.link,
        link_label: banner.linkTexto,
        cor_fundo: banner.cor,
        cor_texto: banner.textoCor,
        ativo: banner.ativo,
        icone: banner.icone,
      },
      token,
    });
    return {
      ativo: boolValue(data.ativo, banner.ativo),
      texto: data.texto ?? banner.texto,
      cor: data.cor_fundo ?? banner.cor,
      textoCor: data.cor_texto ?? banner.textoCor,
      link: data.link_url ?? banner.link,
      linkTexto: data.link_label ?? banner.linkTexto,
      icone: data.icone ?? banner.icone,
    };
  },

  async obterFloatingButtons(): Promise<FloatingButtonConfig[]> {
    return apiFetch<FloatingButtonConfig[]>("/configuracoes/app/floating_buttons").catch(() => []);
  },

  async salvarFloatingButtons(buttons: FloatingButtonConfig[]): Promise<FloatingButtonConfig[]> {
    const token = getToken();
    return apiFetch<FloatingButtonConfig[]>("/configuracoes/app/floating_buttons", {
      method: "PUT",
      body: buttons,
      token,
    });
  },

  async listarHomeSections(): Promise<HomeSectionConfig[]> {
    return apiFetch<HomeSectionConfig[]>("/configuracoes/app/home_sections").catch(() => []);
  },

  async salvarHomeSections(sections: HomeSectionConfig[]): Promise<HomeSectionConfig[]> {
    const token = getToken();
    return apiFetch<HomeSectionConfig[]>("/configuracoes/app/home_sections", {
      method: "PUT",
      body: sections,
      token,
    });
  },

  async obterServicosCardSize(): Promise<"compact" | "medium" | "large"> {
    const value = await apiFetch<string>("/configuracoes/app/servicos_card_size").catch(() => "compact");
    return value === "large" || value === "medium" ? value : "compact";
  },

  async salvarServicosCardSize(size: "compact" | "medium" | "large"): Promise<"compact" | "medium" | "large"> {
    const token = getToken();
    return apiFetch<"compact" | "large">("/configuracoes/app/servicos_card_size", {
      method: "PUT",
      body: size,
      token,
    });
  },

  async listarBanners(): Promise<BannerConfig[]> {
    return apiFetch<BannerConfig[]>("/configuracoes/banners");
  },

  async criarBanner(banner: BannerConfig): Promise<BannerConfig> {
    const token = getToken();
    return apiFetch<BannerConfig>("/configuracoes/banners", { method: "POST", body: banner, token });
  },

  async atualizarBanner(id: string, banner: Partial<BannerConfig>): Promise<BannerConfig> {
    const token = getToken();
    return apiFetch<BannerConfig>(`/configuracoes/banners/${id}`, { method: "PUT", body: banner, token });
  },

  async deletarBanner(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/configuracoes/banners/${id}`, { method: "DELETE", token });
  },
};
