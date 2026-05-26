import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { configuracoesService, SiteConfigApi } from "@/services/configuracoes.service";

export type SiteConfig = SiteConfigApi;

const defaultConfig: SiteConfig = {
  primaryColor: "#16a34a",
  secondaryColor: "#14532D",
  siteName: "INPREC",
  siteSlogan: "Instituto de Previdencia Municipal",
  sloganLogo: "Cuidando do Futuro de Quem Cuida da Cidade",
  whatsapp: "(69) 99250-9093",
  email: "inprec@cujubim.ro.gov.br",
  telefone: "(69) 99250-9093",
  endereco: "Av. Condor, n 2588 Centro, CEP: 76.864-000",
  horario: "Segunda a Sexta — 07h30 às 13h30",
  horarioSeg: "Segunda a Sexta — 07h30 às 13h30",
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

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => Promise<void>;
  carregando: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: defaultConfig,
  updateConfig: async () => {},
  carregando: true,
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const remoto = await configuracoesService.obter();
        setConfig({ ...defaultConfig, ...remoto });
      } catch {
        setConfig(defaultConfig);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  useEffect(() => {
    const rootStyle = document.documentElement.style as CSSStyleDeclaration & { zoom?: string };
    document.documentElement.style.setProperty("--color-primary", config.primaryColor);
    document.documentElement.style.setProperty("--color-secondary", config.secondaryColor);
    document.documentElement.style.setProperty("--font-heading", config.fontFamily);
    document.documentElement.style.setProperty("--radius-scale", config.borderRadius);

    const zoomVal = (config.layoutZoom || 100) / 100;
    rootStyle.zoom = zoomVal.toString();

    if (navigator.userAgent.toLowerCase().includes("firefox")) {
      if (zoomVal !== 1) {
        document.documentElement.style.transform = `scale(${zoomVal})`;
        document.documentElement.style.transformOrigin = "top center";
        document.documentElement.style.width = `${100 / zoomVal}%`;
      } else {
        document.documentElement.style.transform = "";
        document.documentElement.style.width = "";
      }
    }
  }, [config]);

  const updateConfig = async (updates: Partial<SiteConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);

    try {
      const salvo = await configuracoesService.atualizar(updates);
      setConfig((prev) => ({ ...prev, ...salvo }));
    } catch {
      setConfig(config);
    }
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, carregando }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
