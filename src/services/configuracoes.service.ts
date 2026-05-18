import { apiFetch, getToken } from "./api";

export interface SiteConfigApi {
  id?: string;
  chave: string;
  valor: string;
  tipo: "string" | "number" | "boolean" | "json" | "color";
  descricao?: string;
  categoria?: string;
  atualizado_em?: string;
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
    return apiFetch<SiteConfigApi[]>("/configuracoes");
  },

  async obter(chave: string): Promise<SiteConfigApi> {
    return apiFetch<SiteConfigApi>(`/configuracoes/${chave}`);
  },

  async atualizar(config: SiteConfigApi): Promise<SiteConfigApi> {
    const token = getToken();
    return apiFetch<SiteConfigApi>("/configuracoes", {
      method: "PUT",
      body: config,
      token,
    });
  },

  async listarBanners(): Promise<BannerConfig[]> {
    return apiFetch<BannerConfig[]>("/configuracoes/banners");
  },

  async criarBanner(banner: BannerConfig): Promise<BannerConfig> {
    const token = getToken();
    return apiFetch<BannerConfig>("/configuracoes/banners", {
      method: "POST",
      body: banner,
      token,
    });
  },

  async atualizarBanner(id: string, banner: Partial<BannerConfig>): Promise<BannerConfig> {
    const token = getToken();
    return apiFetch<BannerConfig>(`/configuracoes/banners/${id}`, {
      method: "PUT",
      body: banner,
      token,
    });
  },

  async deletarBanner(id: string): Promise<void> {
    const token = getToken();
    return apiFetch<void>(`/configuracoes/banners/${id}`, {
      method: "DELETE",
      token,
    });
  },
};