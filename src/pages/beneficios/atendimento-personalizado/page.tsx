import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const servicos = [
  { titulo: "Simulação de Aposentadoria", desc: "Cálculo estimado da data e valor de sua aposentadoria conforme as regras vigentes, orientado por um de nossos técnicos.", icon: "ri-calculator-line" },
  { titulo: "Análise do Extrato Previdenciário", desc: "Verificação detalhada do seu histórico de contribuições e tempo de serviço registrado no INPREC e CNIS.", icon: "ri-file-search-line" },
  { titulo: "Regularização de Vínculos", desc: "Auxílio na resolução de períodos sem registro, averbação de tempo de contribuição anterior e CTC.", icon: "ri-links-line" },
  { titulo: "Orientação sobre Benefícios", desc: "Esclarecimentos sobre todos os benefícios disponíveis: aposentadorias, pensões, auxílios e abono de permanência.", icon: "ri-question-answer-line" },
  { titulo: "Acompanhamento de Processos", desc: "Atualização e orientação sobre processos em andamento, solicitação de pendências e prazos.", icon: "ri-map-pin-time-line" },
  { titulo: "Atendimento aos Dependentes", desc: "Orientação para familiares e dependentes sobre pensão por morte, habilitação e documentação necessária.", icon: "ri-group-line" },
];

const canais = [
  { canal: "Presencial", desc: "Av. Condor, Nº 2588, Centro, Cujubim — RO. Atendimento de seg. a sex., das 07h30 às 13h30.", icon: "ri-building-2-line", acao: "Ver no Mapa", href: "/enderecos" },
  { canal: "WhatsApp", desc: "Envie mensagem para o nosso WhatsApp (69) 99250-9093 e receba orientação direta da equipe.", icon: "ri-whatsapp-line", acao: "Enviar Mensagem", href: "https://wa.me/5569992509093" },
  { canal: "E-mail", desc: "Envie sua dúvida ou documentação para inprec@cujubim.ro.gov.br. Respondemos rápido.", icon: "ri-mail-line", acao: "Enviar E-mail", href: "mailto:inprec@cujubim.ro.gov.br" },
  { canal: "Telefone", desc: "Ligue para (69) 99250-9093 durante o horário de atendimento para falar diretamente com nossa equipe.", icon: "ri-phone-line", acao: "Ligar Agora", href: "tel:69992509093" },
];

export default function AtendimentoPersonalizadoPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });
  const blocos = usePageContent("beneficios-atendimento");

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
                <i className="ri-customer-service-2-line"></i>
                Serviço ao Servidor
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Atendimento<br />Personalizado
              </h1>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                Equipe especializada para orientação previdenciária individual. Cada servidor tem uma situação única — no INPREC você recebe atenção personalizada para suas necessidades específicas.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/contato" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90" style={{ color: config.primaryColor }}>
                  <i className="ri-calendar-check-line"></i>
                  Agendar Atendimento
                </Link>
                <Link to="/perguntas-frequentes" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 cursor-pointer whitespace-nowrap transition-all hover:bg-white/20">
                  <i className="ri-question-answer-line"></i>
                  Perguntas Frequentes
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex w-40 h-40 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm flex-shrink-0">
              <i className="ri-customer-service-2-line text-6xl text-white/80"></i>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Horário de Atendimento", valor: "07h30 – 13h30", desc: "Segunda a Sexta-feira" },
            { label: "Prazo de Resposta por E-mail", valor: "2 dias úteis", desc: "para dúvidas enviadas por e-mail" },
            { label: "Atendimento", valor: "Gratuito", desc: "para todos os servidores municipais" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <p className="text-lg font-bold" style={{ color: config.primaryColor, fontFamily: "'Poppins', sans-serif" }}>{item.valor}</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={bodyRef as React.RefObject<HTMLElement>}
        className={`py-14 px-4 transition-all duration-700 ${bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>O que você pode solicitar</h2>
            <p className="text-sm text-gray-500 mb-8">Serviços disponíveis para todos os servidores municipais ativos, inativos e pensionistas.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicos.map((s) => (
                <div key={s.titulo} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${s.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{s.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Canais de Atendimento</h2>
            <p className="text-sm text-gray-500 mb-8">Escolha o canal que melhor se adapta à sua necessidade.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {canais.map((c) => (
                <div key={c.canal} className="flex flex-col p-5 bg-white rounded-2xl border border-gray-100">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${c.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{c.canal}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{c.desc}</p>
                  {c.href.startsWith("http") || c.href.startsWith("mailto:") || c.href.startsWith("tel:") ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold cursor-pointer transition-opacity hover:opacity-70"
                      style={{ color: config.primaryColor }}
                    >
                      {c.acao}
                      <i className="ri-arrow-right-line"></i>
                    </a>
                  ) : (
                    <Link
                      to={c.href}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold cursor-pointer transition-opacity hover:opacity-70"
                      style={{ color: config.primaryColor }}
                    >
                      {c.acao}
                      <i className="ri-arrow-right-line"></i>
                    </Link>
                  )}
                </div>
              ))}
            </div>
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
              { label: "Fundo Previdenciário", href: "/beneficios/fundo-previdenciario", icon: "ri-bank-line" },
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
