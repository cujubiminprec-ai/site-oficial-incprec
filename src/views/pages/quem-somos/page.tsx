import { useEffect, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { grupos, Gestor, gestores as gestoresMock } from "@/mocks/gestores";
import { gestoresService } from "@/services/gestores.service";
import LinhaDoTempoSection from "@/pages/quem-somos/components/LinhaDoTempoSection";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="pt-28 md:pt-32 pb-14 md:pb-20 px-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-white/30"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full border border-white/20"></div>
      </div>
      <div className="max-w-screen-xl mx-auto text-center relative z-10">
        <div className={animClass(isVisible, "slide-up", 0)}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            Conheça o INPREC
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Quem Somos
          </h1>
          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Somos um instituto dedicado ao fortalecimento da gestão pública, servindo a cidadãos, servidores e gestores com transparência e excelência.
          </p>
        </div>
      </div>
    </section>
  );
}

function HistoriaSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { config } = useSiteConfig();
  return (
    <section id="historia" ref={ref as React.RefObject<HTMLElement>} className="py-14 md:py-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className={animClass(isVisible, "slide-left", 0)}>
            <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: config.primaryColor }}>Nossa História</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Duas décadas a serviço<br />da gestão pública
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Fundado em 2005, o INPREC nasceu da necessidade de modernizar a gestão pública municipal, oferecendo suporte técnico especializado, capacitação de servidores e assessoria em políticas públicas.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Ao longo dos anos, expandimos nossa atuação para mais de 15 municípios, sempre com o compromisso de fortalecer as instituições públicas e melhorar a qualidade dos serviços prestados ao cidadão.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Hoje somos referência em gestão pública municipal, reconhecidos por nossa metodologia inovadora, equipe altamente qualificada e resultados comprovados.
            </p>
            <div className="flex flex-wrap gap-4 md:gap-4">
              {[
                { v: "2005", l: "Fundação" },
                { v: "15+", l: "Municípios" },
                { v: "2000+", l: "Servidores formados" },
                { v: "50+", l: "Projetos realizados" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-xl md:text-2xl font-bold" style={{ color: config.primaryColor, fontFamily: "'Poppins', sans-serif" }}>{s.v}</div>
                  <div className="text-xs text-gray-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={`relative ${animClass(isVisible, "slide-right", 150)}`}>
            <div className="w-full h-56 md:h-80 rounded-2xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20government%20institution%20building%20exterior%20architectural%20facade%20professional%20corporate%20urban%20city%20clean%20white%20structure&width=700&height=500&seq=qs1&orientation=landscape"
                alt="Sede do INPREC"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-4 md:-bottom-5 left-2 md:-left-5 bg-white rounded-2xl p-3 md:p-4 border border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}20` }}>
                  <i className="ri-award-line text-base md:text-lg" style={{ color: config.primaryColor }}></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Certificado de Excelência</p>
                  <p className="text-xs text-gray-400">Gestão Pública 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MVVSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { config } = useSiteConfig();
  const items = [
    {
      icon: "ri-focus-3-line",
      title: "Missão",
      text: "Fortalecer a gestão pública municipal por meio de capacitação, assessoria técnica e inovação, contribuindo para a melhoria da qualidade dos serviços prestados ao cidadão.",
      color: config.primaryColor,
    },
    {
      icon: "ri-eye-line",
      title: "Visão",
      text: "Ser o principal instituto de referência em gestão pública do Estado, reconhecido pela excelência, inovação e impacto positivo na vida dos cidadãos até 2030.",
      color: "#0891B2",
    },
    {
      icon: "ri-heart-line",
      title: "Valores",
      text: "Transparência, ética e integridade em todos os atos. Inovação e melhoria contínua. Comprometimento com os resultados. Respeito ao cidadão e ao servidor público.",
      color: "#059669",
    },
  ];
  return (
    <section
      id="missao"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 px-4"
      style={{ backgroundColor: `${config.primaryColor}06` }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Missão, Visão e Valores
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`bg-white rounded-2xl p-6 md:p-8 border border-gray-100 ${animClass(isVisible, "slide-up", i * 120)}`}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl mb-5"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <i className={`${item.icon} text-xl`} style={{ color: item.color }}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrganogramaSection({ gestores }: { gestores: Gestor[] }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  const ativos = gestores.filter((gestor) => gestor.ativo !== false);
  const presidente = ativos.filter((gestor) => gestor.grupo === "diretoria" && gestor.cargo.toLowerCase().includes("superintendente")).slice(0, 1);
  const diretores = ativos.filter((gestor) => gestor.grupo === "diretoria" && !presidente.some((item) => item.id === gestor.id));
  const coordenadores = ativos.filter((gestor) => gestor.grupo !== "diretoria");
  return (
    <section
      id="organograma"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 px-4"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className={`text-center mb-12 ${animClass(isVisible, "fade", 0)}`}>
          <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: config.primaryColor }}>Estrutura</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Organograma
          </h2>
        </div>

        {/* Presidente */}
        <div className={`flex justify-center mb-8 ${animClass(isVisible, "slide-up", 100)}`}>
          {presidente.map((p) => (
            <div key={p.id} className="text-center">
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden ring-4"
                style={{ border: `3px solid ${config.primaryColor}`, boxShadow: `0 0 0 4px ${config.primaryColor}33` }}
              >
                <img src={p.foto} alt={p.nome} className="w-full h-full object-cover object-top" />
              </div>
              <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.nome}</p>
              <p className="text-xs font-semibold mt-0.5 px-3 py-0.5 rounded-full inline-block text-white" style={{ backgroundColor: config.primaryColor }}>{p.cargo}</p>
            </div>
          ))}
        </div>

        {/* Connector */}
        <div className="flex justify-center mb-8">
          <div className="w-px h-8 bg-gray-200"></div>
        </div>

        {/* Diretores */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 ${animClass(isVisible, "slide-up", 200)}`}>
          {diretores.map((d) => (
            <div key={d.id} className="text-center">
              <div className="w-16 h-16 rounded-xl mx-auto mb-3 overflow-hidden border-2 border-gray-200">
                <img src={d.foto} alt={d.nome} className="w-full h-full object-cover object-top" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{d.nome}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.cargo}</p>
            </div>
          ))}
        </div>

        {/* Coordenadores */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 ${animClass(isVisible, "slide-up", 300)}`}>
          {coordenadores.map((c) => (
            <div key={c.id} className="text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="w-12 h-12 rounded-xl mx-auto mb-2 overflow-hidden">
                <img src={c.foto} alt={c.nome} className="w-full h-full object-cover object-top" />
              </div>
              <p className="text-xs font-semibold text-gray-800">{c.nome}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.cargo}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EquipeSection({ gestores }: { gestores: Gestor[] }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  const equipe = gestores.filter((gestor) => gestor.ativo);
  return (
    <section id="equipe" ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
      <div className="max-w-screen-xl mx-auto">
        <div className={`text-center mb-10 ${animClass(isVisible, "fade", 0)}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Nossa Equipe</h2>
          <p className="text-gray-500 text-sm">Profissionais dedicados e altamente qualificados</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {equipe.map((membro, i) => (
            <div
              key={membro.id}
              className={`bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 ${animClass(isVisible, "scale", i * 60)}`}
            >
              <div className="w-full h-40 overflow-hidden">
                <img src={membro.foto} alt={membro.nome} className="w-full h-full object-cover object-top" />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-900">{membro.nome}</p>
                <p className="text-xs text-gray-400 mt-0.5">{membro.cargo}</p>
                <div
                  className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}
                >
                  {grupos.find((grupo) => grupo.key === membro.grupo)?.label || membro.grupo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function QuemSomosPage() {
  const blocos = usePageContent("quem-somos");
  const [gestores, setGestores] = useState<Gestor[]>(gestoresMock);
  const hasHeroBloco = blocos.some(b => b.tipo === "hero");
  const blocosNaoHero = blocos.filter(b => b.tipo !== "hero");
  const heroBlocos = blocos.filter(b => b.tipo === "hero");

  useEffect(() => {
    let isMounted = true;
    gestoresService.listar().then((data) => {
      if (isMounted) {
        setGestores(data);
      }
    }).catch(() => {
      setGestores(gestoresMock);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <PageLayout>
      {/* Se há bloco hero editado, usar ele; caso contrário, usar o hero original */}
      {hasHeroBloco ? (
        <PaginaBlocosRenderer blocos={heroBlocos} />
      ) : (
        <HeroSection />
      )}
      {/* Blocos editados pelo admin (exceto hero, já renderizado acima) */}
      {blocosNaoHero.length > 0 && (
        <PaginaBlocosRenderer blocos={blocosNaoHero} />
      )}
      {/* Conteúdo original da página */}
      <HistoriaSection />
      <LinhaDoTempoSection />
      <MVVSection />
      <OrganogramaSection gestores={gestores} />
      <EquipeSection gestores={gestores} />
    </PageLayout>
  );
}
