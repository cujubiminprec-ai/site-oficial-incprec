import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

const principios = [
  { icon: "ri-hand-heart-line", titulo: "Honestidade e Probidade", descricao: "Atuar com honestidade e probidade em todos os atos praticados, zelando pela moralidade e ética administrativa." },
  { icon: "ri-eye-line", titulo: "Transparência", descricao: "Transparência nas ações e decisões institucionais, garantindo o acesso à informação conforme previsto em lei." },
  { icon: "ri-earth-line", titulo: "Responsabilidade Social e Ambiental", descricao: "Responsabilidade social e ambiental nas práticas institucionais, contribuindo para o desenvolvimento sustentável." },
  { icon: "ri-user-star-line", titulo: "Valorização do Servidor", descricao: "Valorização do servidor e do serviço público, reconhecendo o papel fundamental dos agentes na prestação de serviços à sociedade." },
  { icon: "ri-shield-check-line", titulo: "Legalidade", descricao: "Obediência estrita à lei e ao ordenamento jurídico, agindo sempre dentro dos limites estabelecidos pela Constituição e legislação vigente." },
  { icon: "ri-group-line", titulo: "Respeito ao Cidadão", descricao: "Respeito à dignidade das pessoas e ao interesse público, colocando o cidadão e o servidor segurado no centro de todas as ações." },
];

const deveres = [
  "Agir com lealdade à instituição e à missão do INPREC",
  "Manter conduta ética no exercício do cargo e nas relações com colegas, servidores e cidadãos",
  "Guardar sigilo sobre assuntos e informações confidenciais",
  "Comunicar irregularidades ou desvios éticos que tenha conhecimento",
  "Tratar todos com urbanidade, respeito e igualdade",
  "Cumprir as normas, regulamentos e orientações superiores",
  "Zelar pela boa imagem do INPREC e do serviço público",
  "Recusar presentes, vantagens ou favores que possam comprometer a imparcialidade",
];

const vedacoes = [
  "Utilizar o cargo para obter vantagens pessoais indevidas",
  "Participar de decisões nas quais haja conflito de interesses",
  "Divulgar informações sigilosas ou privilegiadas",
  "Praticar atos de discriminação, assédio ou violência",
  "Receber comissões, presentes ou benesses de fornecedores ou contratados",
  "Exercer atividades paralelas que conflitem com os deveres do cargo",
];

export default function CodigoDeEticaPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: s1Ref, isVisible: s1Visible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: s2Ref, isVisible: s2Visible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: s3Ref, isVisible: s3Visible } = useScrollAnimation({ threshold: 0.1 });

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
            <i className="ri-scales-3-line"></i>Institucional
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Código de Ética
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Instituído pelo Decreto Municipal nº 28.434/2023, o Código de Ética do INPREC estabelece os princípios e valores que orientam a conduta de todos os agentes públicos, colaboradores e dirigentes do Instituto.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs">
              <i className="ri-file-text-line"></i>Decreto Municipal nº 28.434/2023
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs">
              <i className="ri-calendar-line"></i>14 de setembro de 2023
            </span>
          </div>
        </div>
      </section>

      {/* Introdução */}
      <section ref={s1Ref as React.RefObject<HTMLElement>} className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className={`max-w-3xl mx-auto text-center mb-12 ${animClass(s1Visible, "slide-up", 0)}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Fundamentos do Código</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Entre os fundamentos do Código de Ética do INPREC, destacam-se os valores que norteiam todas as ações institucionais e as relações com servidores, segurados e a sociedade.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {principios.map((p, i) => (
              <div key={p.titulo} className={`bg-white rounded-2xl border border-gray-100 p-6 ${animClass(s1Visible, "slide-up", i * 80)}`}>
                <div className="w-11 h-11 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${p.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deveres e Vedações */}
      <section ref={s2Ref as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-screen-xl mx-auto">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 ${animClass(s2Visible, "slide-up", 0)}`}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className="ri-checkbox-circle-line text-lg" style={{ color: config.primaryColor }}></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Deveres dos Agentes Públicos</h2>
              </div>
              <div className="flex flex-col gap-2">
                {deveres.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: `${config.primaryColor}15` }}>
                      <i className="ri-check-line text-xs" style={{ color: config.primaryColor }}></i>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50">
                  <i className="ri-close-circle-line text-lg text-red-500"></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Vedações e Proibições</h2>
              </div>
              <div className="flex flex-col gap-2">
                {vedacoes.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 bg-red-50">
                      <i className="ri-close-line text-xs text-red-500"></i>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </PageLayout>
  );
}
