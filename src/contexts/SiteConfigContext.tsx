import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { configuracoesService, SiteConfigApi } from "@/services/configuracoes.service";

export interface SiteConfig {
  primaryColor: string;
  secondaryColor: string;
  siteName: string;
  siteSlogan: string;
  sloganLogo: string;
  whatsapp: string;
  email: string;
  telefone: string;
  endereco: string;
  horario: string;
  logoIcon: string;
  logoImageUrl: string;
  sloganImageUrl: string;
  sloganImageVisivel: boolean;
  sloganImageLocal: string;
  proGestaoSeloUrl: string;
  proGestaoLink: string;
  proGestaoVisivel: boolean;
  topbarVisivel: boolean;
  topbarEmailVisivel: boolean;
  topbarTelefoneVisivel: boolean;
  topbarRedesVisivel: boolean;
  topbarMapaSiteVisivel: boolean;
  layoutZoom: number;
}

const defaultConfig: SiteConfig = {
  primaryColor: "#16a34a",
  secondaryColor: "#14532D",
  siteName: "INPREC",
  siteSlogan: "Instituto de Previdência Municipal",
  sloganLogo: "Cuidando do Futuro de Quem Cuida da Cidade",
  whatsapp: "(69) 99250-9093",
  email: "inprec@cujubim.ro.gov.br",
  telefone: "(69) 99250-9093",
  endereco: "Av. Condor, n° 2588 Centro, CEP: 76.864-000",
  horario: "De Segunda a Sexta, das 07:30h às 13:30h",
  logoIcon: "ri-government-line",
  logoImageUrl: "",
  sloganImageUrl: "",
  sloganImageVisivel: true,
  sloganImageLocal: "navbar,footer",
  proGestaoSeloUrl: "https://static.readdy.ai/image/98faa14093f63576e4d8e45c39fe43a1/3530c89e141078fc96c8dfcde60f7395.jpeg",
  proGestaoLink: "/pro-gestao",
  proGestaoVisivel: true,
  topbarVisivel: true,
  topbarEmailVisivel: true,
  topbarTelefoneVisivel: true,
  topbarRedesVisivel: true,
  topbarMapaSiteVisivel: true,
  layoutZoom: 100,
};

function configsToSiteConfig(configs: SiteConfigApi[]): SiteConfig {
  const map: Record<string, string | boolean | number> = {};
  configs.forEach((c) => {
    if (c.tipo === "boolean") {
      map[c.chave] = c.valor === "true";
    } else if (c.tipo === "number") {
      map[c.chave] = Number(c.valor);
    } else {
      map[c.chave] = c.valor;
    }
  });

  return {
    primaryColor: String(map.primaryColor || defaultConfig.primaryColor),
    secondaryColor: String(map.secondaryColor || defaultConfig.secondaryColor),
    siteName: String(map.siteName || defaultConfig.siteName),
    siteSlogan: String(map.siteSlogan || defaultConfig.siteSlogan),
    sloganLogo: String(map.sloganLogo || defaultConfig.sloganLogo),
    whatsapp: String(map.whatsapp || defaultConfig.whatsapp),
    email: String(map.email || defaultConfig.email),
    telefone: String(map.telefone || defaultConfig.telefone),
    endereco: String(map.endereco || defaultConfig.endereco),
    horario: String(map.horario || defaultConfig.horario),
    logoIcon: String(map.logoIcon || defaultConfig.logoIcon),
    logoImageUrl: String(map.logoImageUrl || defaultConfig.logoImageUrl),
    sloganImageUrl: String(map.sloganImageUrl || defaultConfig.sloganImageUrl),
    sloganImageVisivel: map.sloganImageVisivel !== undefined ? Boolean(map.sloganImageVisivel) : defaultConfig.sloganImageVisivel,
    sloganImageLocal: String(map.sloganImageLocal || defaultConfig.sloganImageLocal),
    proGestaoSeloUrl: String(map.proGestaoSeloUrl || defaultConfig.proGestaoSeloUrl),
    proGestaoLink: String(map.proGestaoLink || defaultConfig.proGestaoLink),
    proGestaoVisivel: map.proGestaoVisivel !== undefined ? Boolean(map.proGestaoVisivel) : defaultConfig.proGestaoVisivel,
    topbarVisivel: map.topbarVisivel !== undefined ? Boolean(map.topbarVisivel) : defaultConfig.topbarVisivel,
    topbarEmailVisivel: map.topbarEmailVisivel !== undefined ? Boolean(map.topbarEmailVisivel) : defaultConfig.topbarEmailVisivel,
    topbarTelefoneVisivel: map.topbarTelefoneVisivel !== undefined ? Boolean(map.topbarTelefoneVisivel) : defaultConfig.topbarTelefoneVisivel,
    topbarRedesVisivel: map.topbarRedesVisivel !== undefined ? Boolean(map.topbarRedesVisivel) : defaultConfig.topbarRedesVisivel,
    topbarMapaSiteVisivel: map.topbarMapaSiteVisivel !== undefined ? Boolean(map.topbarMapaSiteVisivel) : defaultConfig.topbarMapaSiteVisivel,
    layoutZoom: map.layoutZoom !== undefined ? Number(map.layoutZoom) : defaultConfig.layoutZoom,
  };
}

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  carregando: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  carregando: true,
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [carregando, setCarregando] = useState(true);

  // Carrega do backend ao iniciar
  useEffect(() => {
    const carregar = async () => {
      try {
        const configs = await configuracoesService.listar();
        const parsed = configsToSiteConfig(configs);

        // Limpa dados de contato fictícios antigos do cache/banco
        if (
          parsed.email === "contato@inprec.net" ||
          parsed.email === "atendimento@inprec.gov.br" ||
          parsed.telefone?.includes("3000-0000") ||
          parsed.endereco?.includes("Av. Institucional")
        ) {
          parsed.email = defaultConfig.email;
          parsed.telefone = defaultConfig.telefone;
          parsed.whatsapp = defaultConfig.whatsapp;
          parsed.endereco = defaultConfig.endereco;
          parsed.horario = defaultConfig.horario;
        }

        setConfig(parsed);
        localStorage.setItem("inprec_site_config", JSON.stringify(parsed));
      } catch {
        // Fallback para localStorage
        try {
          const saved = localStorage.getItem("inprec_site_config");
          if (saved) {
            const parsed = { ...defaultConfig, ...JSON.parse(saved) };
            if (
              parsed.email === "contato@inprec.net" ||
              parsed.email === "atendimento@inprec.gov.br" ||
              parsed.telefone?.includes("3000-0000") ||
              parsed.endereco?.includes("Av. Institucional")
            ) {
              parsed.email = defaultConfig.email;
              parsed.telefone = defaultConfig.telefone;
              parsed.whatsapp = defaultConfig.whatsapp;
              parsed.endereco = defaultConfig.endereco;
              parsed.horario = defaultConfig.horario;
              localStorage.setItem("inprec_site_config", JSON.stringify(parsed));
            }
            setConfig(parsed);
          }
        } catch {
          // mantém default
        }
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", config.primaryColor);
    document.documentElement.style.setProperty("--color-secondary", config.secondaryColor);

    // Aplicar Zoom Global
    const zoomVal = (config.layoutZoom || 100) / 100;
    // @ts-ignore
    document.documentElement.style.zoom = zoomVal.toString();
    
    // Fallback para Firefox
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
  }, [config.primaryColor, config.secondaryColor, config.layoutZoom]);

  const updateConfig = async (updates: Partial<SiteConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("inprec_site_config", JSON.stringify(next));
      return next;
    });

    // Sincroniza com backend
    try {
      const entries = Object.entries(updates);
      for (const [chave, valor] of entries) {
        const tipo: SiteConfigApi["tipo"] =
          typeof valor === "boolean" ? "boolean" : typeof valor === "number" ? "number" : "string";
        await configuracoesService.atualizar({
          chave,
          valor: String(valor),
          tipo,
        });
      }
    } catch {
      // Silencia erro de sincronização
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