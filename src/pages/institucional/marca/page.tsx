import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

export default function MarcaPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: s1Ref, isVisible: s1Visible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: s2Ref, isVisible: s2Visible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-16 w-72 h-72 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-palette-line"></i>Identidade Visual
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Marca do INPREC
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Conheça a identidade visual do Instituto de Previdência Social dos Servidores Públicos Municipais de Cujubim — INPREC.
          </p>
        </div>
      </section>

      {/* Logo principal */}
      <section ref={s1Ref as React.RefObject<HTMLElement>} className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className={`text-center mb-12 ${animClass(s1Visible, "fade", 0)}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Logotipo Institucional</h2>
            <p className="text-sm text-gray-500">A marca do INPREC representa proteção, inclusão e longevidade — valores fundamentais da previdência municipal.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Logo em fundo claro */}
            <div className={`bg-gray-50 rounded-2xl border border-gray-100 p-12 flex items-center justify-center ${animClass(s1Visible, "slide-left", 0)}`}>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 overflow-hidden rounded-2xl">
                  <img
                    src="https://readdy.ai/api/search-image?query=institutional%20logo%20Brazilian%20municipal%20social%20security%20government%20INPREC%20tree%20silhouettes%20people%20cyclists%20elderly%20wheelchair%20family%20minimalist%20clean%20white%20background%20vector%20style&width=400&height=400&seq=marca1&orientation=squarish"
                    alt="Logotipo INPREC — versão fundo claro"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">Versão fundo claro</p>
              </div>
            </div>
            {/* Logo em fundo escuro */}
            <div className={`rounded-2xl p-12 flex items-center justify-center ${animClass(s1Visible, "slide-right", 100)}`} style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/20 mb-3">
                    <i className={`${config.logoIcon} text-white text-4xl`}></i>
                  </div>
                  <p className="text-white text-2xl font-black tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>INPREC</p>
                  <p className="text-white/70 text-[10px] tracking-widest uppercase mt-1">Instituto de Previdência</p>
                </div>
                <p className="text-white/60 text-xs font-medium">Versão fundo escuro</p>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className={`max-w-3xl mx-auto ${animClass(s1Visible, "slide-up", 200)}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Slogan Institucional</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                "INPREC — Cuidando do Futuro<br className="hidden sm:block" />de Quem Cuida da Cidade"
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mt-4">
                O slogan reforça o posicionamento do INPREC como guardião dos direitos previdenciários dos servidores públicos municipais. A árvore frondosa na marca simboliza a <strong>longevidade, proteção e crescimento</strong>, enquanto as silhuetas ao redor representam a <strong>diversidade e inclusão</strong> — ciclistas, idosos, cadeirantes, mães e crianças — todos amparados pelo INPREC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Significado da marca */}
      <section ref={s2Ref as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-screen-xl mx-auto">
          <div className={`text-center mb-10 ${animClass(s2Visible, "fade", 0)}`}>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Significado dos Elementos Visuais</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "ri-plant-line", titulo: "A Árvore", descricao: "Representa a solidez, perenidade e crescimento do patrimônio previdenciário ao longo do tempo. Raízes profundas = segurança. Copa frondosa = prosperidade.", cor: "#059669" },
              { icon: "ri-group-line", titulo: "As Silhuetas", descricao: "Representam a diversidade dos servidores e dependentes amparados pelo INPREC — ciclistas, idosos, deficientes, famílias e crianças.", cor: config.primaryColor },
              { icon: "ri-font-size", titulo: "A Tipografia", descricao: "Letras maiúsculas e bold transmitem autoridade, confiança e seriedade institucional. A fonte é limpa e legível para comunicação oficial.", cor: "#374151" },
              { icon: "ri-palette-line", titulo: "A Identidade Cromática", descricao: "As cores institucionais transmitem profissionalismo, seriedade e conectividade com os valores do serviço público municipal.", cor: "#D97706" },
            ].map((el, i) => (
              <div key={el.titulo} className={`bg-white rounded-2xl p-6 border border-gray-100 ${animClass(s2Visible, "slide-up", i * 80)}`}>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: `${el.cor}15` }}>
                  <i className={`${el.icon} text-base`} style={{ color: el.cor }}></i>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{el.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{el.descricao}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
