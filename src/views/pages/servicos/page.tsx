import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";
import { ServicoSite, servicosService } from "@/services/servicos.service";
import { configuracoesService, type ServicosStats, servicosStatsDefault } from "@/services/configuracoes.service";

function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className="pt-32 pb-20 px-4"
      style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
    >
      <div className="max-w-screen-xl mx-auto text-center">
        <div className={animClass(isVisible, "slide-up", 0)}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            Nossos Serviços
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Soluções para a<br />Gestão Pública
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Oferecemos serviços especializados para modernizar e fortalecer a administração pública municipal, com foco em eficiência, transparência e cidadania.
          </p>
        </div>
      </div>
    </section>
  );
}

interface ServicoItem {
  id: number;
  icone: string;
  titulo: string;
  descricao: string;
  link?: string;
}

function ServicoCard({ servico, index }: { servico: ServicoItem; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  return (
    <Link
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      to={servico.link || "/servicos"}
      className={`bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 group cursor-pointer block ${animClass(isVisible, "slide-up", (index % 3) * 100)}`}
    >
      <div
        className="w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300"
        style={{ backgroundColor: `${config.primaryColor}15` }}
      >
        <i className={`${servico.icone} text-xl`} style={{ color: config.primaryColor }}></i>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {servico.titulo}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">{servico.descricao}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: config.primaryColor }}>
        Saiba mais <i className="ri-arrow-right-line"></i>
      </div>
    </Link>
  );
}

function StatsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { config } = useSiteConfig();
  const [statsConfig, setStatsConfig] = useState<ServicosStats>(servicosStatsDefault);

  useEffect(() => {
    configuracoesService.obterServicosStats()
      .then((d) => { if (d?.itens) setStatsConfig(d); })
      .catch(() => {});
  }, []);

  if (!statsConfig.ativo || !statsConfig.itens.some((s) => s.value)) return null;

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ backgroundColor: `${config.primaryColor}08` }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.itens.filter((s) => s.value).map((s, i) => (
            <div key={s.label} className={`text-center ${animClass(isVisible, "scale", i * 100)}`}>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${config.primaryColor}20` }}>
                <i className={`${s.icon} text-xl`} style={{ color: config.primaryColor }}></i>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: config.primaryColor, fontFamily: "'Poppins', sans-serif" }}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicosPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const blocos = usePageContent("servicos");
  const [servicosSite, setServicosSite] = useState<ServicoSite[]>([]);
  const [carregando, setCarregando] = useState(true);
  const hasHeroBloco = blocos.some(b => b.tipo === "hero");
  const heroBlocos = blocos.filter(b => b.tipo === "hero");
  const blocosNaoHero = blocos.filter(b => b.tipo !== "hero");

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const lista = await servicosService.listar();
        if (!ativo) return;
        setServicosSite(lista.filter((item) => item.ativo !== false));
      } catch {
        if (ativo) setServicosSite([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void carregar();

    window.addEventListener("inprec-servicos-updated", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-servicos-updated", carregar);
    };
  }, []);

  return (
    <PageLayout>
      {hasHeroBloco ? (
        <PaginaBlocosRenderer blocos={heroBlocos} />
      ) : (
        <HeroSection />
      )}
      {blocosNaoHero.length > 0 && (
        <PaginaBlocosRenderer blocos={blocosNaoHero} />
      )}
      <StatsSection />
      <section className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Todos os Serviços
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Conheça o portfólio completo de serviços que oferecemos para municípios e cidadãos.
            </p>
          </div>
          {carregando ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <i className="ri-loader-4-line animate-spin"></i>
              <span className="text-sm">Carregando serviços...</span>
            </div>
          ) : servicosSite.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <i className="ri-service-line text-4xl block mb-3 text-gray-200"></i>
              <p className="text-sm font-medium">Nenhum serviço publicado no momento.</p>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicosSite.map((s, i) => <ServicoCard key={s.id} servico={s} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
