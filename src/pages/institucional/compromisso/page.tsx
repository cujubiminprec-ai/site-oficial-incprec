import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

const compromissos = [
  { icon: "ri-shield-check-line", titulo: "Segurança Previdenciária", descricao: "Garantir a segurança financeira e previdenciária de todos os servidores municipais efetivos, assegurando o pagamento regular dos benefícios previstos em lei.", cor: "#059669" },
  { icon: "ri-eye-line", titulo: "Transparência Total", descricao: "Manter canais abertos de comunicação e prestação de contas à sociedade, ao servidor e aos órgãos de controle, divulgando relatórios, balanços e informações tempestivamente.", cor: "#0891B2" },
  { icon: "ri-customer-service-2-line", titulo: "Atendimento Humanizado", descricao: "Oferecer atendimento presencial e digital de qualidade, com empatia, agilidade e respeito à dignidade de cada servidor e seus dependentes.", cor: "#D97706" },
  { icon: "ri-book-open-line", titulo: "Educação Previdenciária", descricao: "Promover ações de educação previdenciária, capacitando os servidores para que compreendam seus direitos e deveres junto ao RPPS Municipal.", cor: "#7C3AED" },
  { icon: "ri-line-chart-line", titulo: "Gestão Responsável dos Ativos", descricao: "Aplicar os recursos previdenciários com responsabilidade, prudência e conformidade às normas do CMN, priorizando a sustentabilidade do RPPS a longo prazo.", cor: "#DC2626" },
  { icon: "ri-scales-3-line", titulo: "Cumprimento da Legislação", descricao: "Agir sempre em conformidade com a legislação previdenciária, especialmente a Lei 9.717/1998, EC 103/2019 e as normas do Ministério da Previdência Social.", cor: "#374151" },
];

const metas = [
  { meta: "Reduzir tempo de concessão de benefícios para até 30 dias", progresso: 75 },
  { meta: "100% dos documentos disponibilizados digitalmente", progresso: 90 },
  { meta: "Pró-Gestão Nível IV — Certificação plena até 2025", progresso: 50 },
  { meta: "Zero pendências no CADPREV até dezembro/2025", progresso: 85 },
  { meta: "Implementação completa da LGPD no INPREC", progresso: 70 },
];

export default function CompromissoPage() {
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
          <div className="absolute -bottom-10 left-10 w-56 h-56 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-heart-line"></i>Institucional
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Compromisso com<br />o Servidor
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            O INPREC reafirma diariamente seu compromisso com a segurança previdenciária, a transparência e o bem-estar dos servidores públicos municipais de Cujubim e seus dependentes.
          </p>
        </div>
      </section>

      {/* Compromissos */}
      <section ref={s1Ref as React.RefObject<HTMLElement>} className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className={`text-center mb-12 ${animClass(s1Visible, "fade", 0)}`}>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Nossos Compromissos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {compromissos.map((c, i) => (
              <div key={c.titulo} className={`bg-white rounded-2xl border border-gray-100 p-6 ${animClass(s1Visible, "slide-up", i * 80)}`}>
                <div className="w-11 h-11 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: `${c.cor}15` }}>
                  <i className={`${c.icon} text-lg`} style={{ color: c.cor }}></i>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metas */}
      <section ref={s2Ref as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-3xl mx-auto">
          <div className={`text-center mb-10 ${animClass(s2Visible, "fade", 0)}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Metas e Avanços 2024–2025</h2>
            <p className="text-sm text-gray-500">Acompanhe o progresso das principais metas institucionais do INPREC</p>
          </div>
          <div className="flex flex-col gap-4">
            {metas.map((m, i) => (
              <div key={i} className={`bg-white rounded-2xl border border-gray-100 p-5 ${animClass(s2Visible, "slide-up", i * 80)}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800">{m.meta}</p>
                  <span className="text-sm font-bold ml-4 flex-shrink-0" style={{ color: config.primaryColor }}>{m.progresso}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.progresso}%`, backgroundColor: config.primaryColor }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PageLayout>
  );
}
