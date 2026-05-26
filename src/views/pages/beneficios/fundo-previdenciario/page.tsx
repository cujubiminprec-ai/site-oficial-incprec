import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const pilares = [
  { titulo: "Segregação de Massas", desc: "Separação entre segurados do plano previdenciário e os servidores mais antigos, garantindo equilíbrio financeiro de longo prazo.", icon: "ri-pie-chart-2-line" },
  { titulo: "Política de Investimentos", desc: "Investimentos criteriosamente selecionados com base na resolução CMN 4.963/2021, priorizando segurança e rentabilidade.", icon: "ri-line-chart-line" },
  { titulo: "Avaliação Atuarial", desc: "Realizada anualmente por atuário habilitado para garantir o equilíbrio financeiro e atuarial do fundo.", icon: "ri-bar-chart-grouped-line" },
  { titulo: "Transparência Total", desc: "Relatórios mensais, trimestrais e anuais publicados no Portal da Transparência e enviados aos órgãos reguladores.", icon: "ri-eye-line" },
];

const investimentos = [
  { categoria: "Renda Fixa — Títulos Públicos (Tesouro Nacional)", percentual: 65, cor: "#16a34a" },
  { categoria: "Renda Fixa — Fundos referenciados DI", percentual: 20, cor: "#15803d" },
  { categoria: "Renda Variável — Fundos de Ações", percentual: 10, cor: "#86efac" },
  { categoria: "Operações Compromissadas", percentual: 5, cor: "#bbf7d0" },
];

const indicadores = [
  { label: "Rentabilidade Anual 2024", valor: "12,4%", icon: "ri-arrow-up-line", positivo: true },
  { label: "Meta Atuarial INPC + 6% a.a.", valor: "10,8%", icon: "ri-focus-3-line", positivo: true },
  { label: "Total Sob Gestão (2024)", valor: "R$ 4,2 M", icon: "ri-bank-line", positivo: true },
  { label: "Índice de Cobertura", valor: "98,7%", icon: "ri-shield-check-line", positivo: true },
];

export default function FundoPrevidenciarioPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });
  const blocos = usePageContent("beneficios-fundo-previdenciario");

  return (
    <PageLayout>
      <PaginaBlocosRenderer blocos={blocos} />
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-32 pb-16 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 right-16 w-64 h-64 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4">
                <i className="ri-shield-check-line"></i>
                Gestão Previdenciária
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Fundo<br />Previdenciário
              </h1>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                Gestão responsável e transparente dos recursos para garantia futura dos servidores. O INPREC administra o patrimônio previdenciário do município de Cujubim com segurança e eficiência.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/transparencia" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90" style={{ color: config.primaryColor }}>
                  <i className="ri-eye-line"></i>
                  Ver Transparência
                </Link>
                <Link to="/contato" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 cursor-pointer whitespace-nowrap transition-all hover:bg-white/20">
                  <i className="ri-phone-line"></i>
                  Falar com o INPREC
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex w-40 h-40 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm flex-shrink-0">
              <i className="ri-bank-line text-6xl text-white/80"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section className="py-10 px-4 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {indicadores.map((ind) => (
            <div key={ind.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${ind.icon} text-base`} style={{ color: config.primaryColor }}></i>
                </div>
                {ind.positivo && <span className="text-xs text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full">Positivo</span>}
              </div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{ind.valor}</p>
              <p className="text-xs text-gray-500 mt-1">{ind.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={bodyRef as React.RefObject<HTMLElement>}
        className={`py-14 px-4 transition-all duration-700 ${bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Pilares da Gestão do Fundo</h2>
            <div className="flex flex-col gap-4">
              {pilares.map((p) => (
                <div key={p.titulo} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${p.icon} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{p.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Composição da Carteira 2024</h2>
            <div className="flex flex-col gap-4">
              {investimentos.map((inv) => (
                <div key={inv.categoria} className="bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">{inv.categoria}</p>
                    <span className="text-sm font-bold" style={{ color: inv.cor }}>{inv.percentual}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${inv.percentual}%`, backgroundColor: inv.cor }}></div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center mt-2">* Dados referentes ao fechamento do exercício de 2024. Composição sujeita à revisão anual conforme Política de Investimentos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4" style={{ backgroundColor: `${config.primaryColor}08` }}>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Quer saber mais sobre seus investimentos?</h2>
            <p className="text-sm text-gray-500">Acesse o Portal da Transparência ou entre em contato com o INPREC.</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Link to="/transparencia" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
              <i className="ri-eye-line"></i>
              Portal da Transparência
            </Link>
            <Link to="/contato" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap transition-all border" style={{ borderColor: config.primaryColor, color: config.primaryColor }}>
              <i className="ri-phone-line"></i>
              Fale Conosco
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Outros Benefícios do INPREC</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Aposentadoria por Idade", href: "/beneficios/aposentadoria-por-idade", icon: "ri-user-star-line" },
              { label: "Aposentadoria por Invalidez", href: "/beneficios/aposentadoria-por-invalidez", icon: "ri-shield-user-line" },
              { label: "Pensão por Morte", href: "/beneficios/pensao-por-morte", icon: "ri-heart-pulse-line" },
              { label: "Auxílio-Doença", href: "/beneficios/auxilio-doenca", icon: "ri-hospital-line" },
              { label: "Atendimento Personalizado", href: "/beneficios/atendimento-personalizado", icon: "ri-customer-service-2-line" },
            ].map((b) => (
              <Link key={b.href} to={b.href} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 text-center cursor-pointer transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${b.icon} text-base`} style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-snug">{b.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
