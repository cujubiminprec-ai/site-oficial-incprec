import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { configuracoesService } from "@/services/configuracoes.service";
import { getCookie, setCookie } from "@/utils/cookies";

export interface BannerAvisoConfig {
  ativo: boolean;
  texto: string;
  cor: string;
  textoCor: string;
  link: string;
  linkTexto: string;
  icone: string;
}

export const bannerAvisoDefault: BannerAvisoConfig = {
  ativo: false,
  texto: "Recadastramento Obrigatório 2026 — Prazo até 31 de julho. Não perca o prazo!",
  cor: "#16a34a",
  textoCor: "#ffffff",
  link: "/noticias",
  linkTexto: "Saiba mais",
  icone: "ri-megaphone-line",
};

export function useBannerAviso(): [BannerAvisoConfig, (c: BannerAvisoConfig) => void] {
  const [config, setConfig] = useState<BannerAvisoConfig>(bannerAvisoDefault);

  useEffect(() => {
    let ativo = true;
    configuracoesService
      .obterBanner()
      .then((banner) => {
        if (!ativo) return;
        if (banner) {
          setConfig({ ...bannerAvisoDefault, ...banner });
        } else {
          setConfig((prev) => ({ ...prev, ativo: false }));
        }
      })
      .catch(() => {
        if (ativo) setConfig((prev) => ({ ...prev, ativo: false }));
      });
    return () => {
      ativo = false;
    };
  }, []);

  const update = (c: BannerAvisoConfig) => {
    setConfig(c);
    window.dispatchEvent(new Event("inprec-banner-aviso-updated"));
  };

  return [config, update];
}

export default function BannerAviso() {
  const [config] = useBannerAviso();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const key = `inprec_banner_dismissed_${config.texto.slice(0, 20)}`;
    const wasDismissed = getCookie(key) === "true";
    setDismissed(wasDismissed);
    setMounted(true);
  }, [config.texto]);

  useEffect(() => {
    const recarregar = () => {
      configuracoesService
        .obterBanner()
        .then((banner) => {
          if (banner && banner.ativo) {
            setDismissed(false);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("inprec-banner-aviso-updated", recarregar);
    return () => window.removeEventListener("inprec-banner-aviso-updated", recarregar);
  }, []);

  const handleDismiss = () => {
    const key = `inprec_banner_dismissed_${config.texto.slice(0, 20)}`;
    setCookie(key, "true", 7);
    setDismissed(true);
  };

  if (!mounted || !config.ativo || dismissed) return null;

  const isExternal = config.link.startsWith("http");

  return (
    <div
      className="w-full z-[60] relative"
      style={{ backgroundColor: config.cor, color: config.textoCor }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className={`${config.icone} text-sm`}></i>
          </div>
          <p className="text-xs sm:text-sm font-medium truncate" style={{ color: config.textoCor }}>
            {config.texto}
          </p>
          {config.link && config.linkTexto && (
            isExternal ? (
              <a
                href={config.link}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex-shrink-0 text-xs font-bold underline underline-offset-2 cursor-pointer whitespace-nowrap hover:opacity-80 transition-opacity"
                style={{ color: config.textoCor }}
              >
                {config.linkTexto} &rarr;
              </a>
            ) : (
              <Link
                to={config.link}
                className="flex-shrink-0 text-xs font-bold underline underline-offset-2 cursor-pointer whitespace-nowrap hover:opacity-80 transition-opacity"
                style={{ color: config.textoCor }}
              >
                {config.linkTexto} &rarr;
              </Link>
            )
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer hover:bg-black/10 transition-colors"
          aria-label="Fechar aviso"
        >
          <i className="ri-close-line text-sm" style={{ color: config.textoCor }}></i>
        </button>
      </div>
    </div>
  );
}
