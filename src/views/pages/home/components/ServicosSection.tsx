import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { servicos as servicosMock } from "@/mocks/servicos";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { servicosService, ServicoSite } from "@/services/servicos.service";
import { configuracoesService } from "@/services/configuracoes.service";

type CardSize = "compact" | "medium" | "large";

export default function ServicosSection() {
  const { config } = useSiteConfig();
  const [servicos, setServicos] = useState<ServicoSite[]>(servicosMock.map((item) => ({ ...item, ativo: true })));
  const [cardSize, setCardSize] = useState<CardSize>("compact");

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      const [lista, size] = await Promise.all([
        servicosService.listar().catch(() => servicosMock.map((item) => ({ ...item, ativo: true }))),
        configuracoesService.obterServicosCardSize().catch(() => "compact"),
      ]);

      if (!ativo) return;
      setServicos((lista || []).filter((item) => item.ativo !== false));
      setCardSize((size as CardSize) || "compact");
    };

    void carregar();
    window.addEventListener("inprec-servicos-updated", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-servicos-updated", carregar);
    };
  }, []);

  const gridCols =
    cardSize === "compact"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : cardSize === "medium"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const cardPad = cardSize === "compact" ? "p-4" : cardSize === "medium" ? "p-5" : "p-8";
  const iconSize = cardSize === "compact" ? "w-9 h-9" : cardSize === "medium" ? "w-10 h-10" : "w-12 h-12";
  const iconText = cardSize === "compact" ? "text-base" : cardSize === "medium" ? "text-lg" : "text-xl";
  const titleSize = cardSize === "compact" ? "text-xs font-bold" : cardSize === "medium" ? "text-sm font-bold" : "text-base font-bold";
  const descSize = cardSize === "compact" ? "text-[11px]" : "text-xs sm:text-sm";
  const iconBg = cardSize === "compact" ? "rounded-lg mb-3" : "rounded-xl mb-4 sm:mb-5";

  return (
    <section className="py-10 md:py-14 bg-white" id="servicos">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-10">
          <span
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full border text-[10px] font-semibold tracking-wider uppercase mb-3"
            style={{ borderColor: `${config.primaryColor}40`, color: config.primaryColor }}
          >
            Nossos Servicos
          </span>
          <h2
            className="text-xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: config.secondaryColor }}
          >
            O que o INPREC oferece
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Solucoes completas para modernizar a gestao publica e aproximar o cidadao dos servicos do Estado.
          </p>
        </div>

        <div className={`grid ${gridCols} gap-3 md:gap-4`}>
          {servicos.map((servico) => (
            <Link
              key={servico.id}
              to={servico.link || "/servicos"}
              className={`group bg-white border border-gray-100 rounded-xl ${cardPad} cursor-pointer transition-all duration-300 hover:border-transparent block`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "";
              }}
            >
              <div className={`${iconSize} flex items-center justify-center ${iconBg} group-hover:bg-white/20 transition-colors duration-300`} style={{ backgroundColor: `${config.primaryColor}20` }}>
                <i className={`${servico.icone} ${iconText} group-hover:text-white transition-colors duration-300`} style={{ color: config.primaryColor }}></i>
              </div>
              <h3 className={`${titleSize} group-hover:text-white mb-1 transition-colors duration-300 leading-tight`} style={{ fontFamily: "'Poppins', sans-serif", color: config.secondaryColor }}>
                {servico.titulo}
              </h3>
              {cardSize !== "compact" ? (
                <p className={`${descSize} text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors duration-300`}>{servico.descricao}</p>
              ) : (
                <p className="text-[10px] text-gray-400 group-hover:text-white/70 leading-relaxed transition-colors duration-300 line-clamp-2">{servico.descricao}</p>
              )}
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-10">
          <Link to="/servicos" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-xs transition-all duration-300 cursor-pointer whitespace-nowrap hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
            Ver todos os servicos
            <i className="ri-arrow-right-line text-sm"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
