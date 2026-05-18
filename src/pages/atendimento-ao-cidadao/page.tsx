import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { Link } from "react-router-dom";

export default function AtendimentoAoCidadaoPage() {
  const { config } = useSiteConfig();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });

  const canais = [
    {
      titulo: "WhatsApp de Atendimento",
      descricao: "Converse em tempo real com nossa equipe de suporte para tirar dúvidas e obter orientações rápidas.",
      icone: "ri-whatsapp-line",
      cor: "#25D366",
      acaoTexto: "Iniciar conversa",
      link: `https://wa.me/5569992509093`,
      externo: true,
    },
    {
      titulo: "Ouvidoria Geral",
      descricao: "Canal oficial para envio de reclamações, denúncias, elogios, sugestões ou solicitações relativas ao INPREC.",
      icone: "ri-feedback-line",
      cor: "#3B82F6",
      acaoTexto: "Acessar Ouvidoria",
      link: "/ouvidoria",
      externo: false,
    },
    {
      titulo: "e-SIC / Acesso à Informação",
      descricao: "Solicite documentos, relatórios ou informações públicas institucionais formalmente pela Lei de Acesso à Informação (LAI).",
      icone: "ri-folder-info-line",
      cor: "#F59E0B",
      acaoTexto: "Solicitar Informação",
      link: "/lai",
      externo: false,
    },
    {
      titulo: "Perguntas Frequentes (FAQ)",
      descricao: "Encontre respostas imediatas para as principais dúvidas sobre previdência, aposentadoria e processos administrativos.",
      icone: "ri-question-line",
      cor: "#8B5CF6",
      acaoTexto: "Ver dúvidas comuns",
      link: "/perguntas-frequentes",
      externo: false,
    },
    {
      titulo: "Pesquisa de Satisfação",
      descricao: "Sua opinião é fundamental. Avalie os nossos serviços para nos ajudar a aprimorar o atendimento público.",
      icone: "ri-star-line",
      cor: "#EC4899",
      acaoTexto: "Responder pesquisa",
      link: "/pesquisa-satisfacao",
      externo: false,
    },
    {
      titulo: "Canais de Contato",
      descricao: "Prefere e-mail ou telefone fixo? Veja nossa central de contatos direta e fale conosco por meios convencionais.",
      icone: "ri-mail-line",
      cor: "#10B981",
      acaoTexto: "Ver telefones e e-mails",
      link: "/contato",
      externo: false,
    },
    {
      titulo: "Atendimento Presencial",
      descricao: "Encontre o endereço oficial do INPREC, mapa interativo de localização e detalhes para atendimento físico.",
      icone: "ri-map-pin-line",
      cor: "#EF4444",
      acaoTexto: "Ver localização",
      link: "/enderecos",
      externo: false,
    },
  ];

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
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-customer-service-2-line"></i> Relacionamento
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Atendimento ao Cidadão
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
            Canais de atendimento presencial e digital para demandas, ouvidoria e serviços ao cidadão de forma clara, ágil e transparente.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section
        ref={contentRef as React.RefObject<HTMLElement>}
        className={`py-16 px-4 bg-gray-50/50 transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Info Banner */}
          <div className="mb-12 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className="ri-information-line text-2xl" style={{ color: config.primaryColor }}></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Horário de Funcionamento do INPREC
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Estamos à disposição para atendê-lo das <strong className="text-gray-700">{config.horario || "De Segunda a Sexta, das 07:30h às 13:30h"}</strong>.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Av. Condor, n° 2588 Centro, CEP: 76.864-000 · Cujubim — RO
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <a
                href="tel:69992509093"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center cursor-pointer"
              >
                <i className="ri-phone-line text-base text-gray-400"></i>
                Ligar para o INPREC
              </a>
              <a
                href={`https://wa.me/5569992509093`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity text-center cursor-pointer"
                style={{ backgroundColor: config.primaryColor }}
              >
                <i className="ri-whatsapp-line text-base"></i>
                Chamar no WhatsApp
              </a>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canais.map((canal, index) => {
              const CardWrapper = canal.externo ? "a" : Link;
              const linkProps = canal.externo
                ? { href: canal.link, target: "_blank", rel: "noopener noreferrer" }
                : { to: canal.link };

              return (
                // @ts-ignore
                <CardWrapper
                  key={index}
                  {...linkProps}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${canal.cor}12` }}
                    >
                      <i className={`${canal.icone} text-2xl`} style={{ color: canal.cor }}></i>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {canal.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                      {canal.descricao}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2 text-xs font-semibold mt-auto"
                    style={{ color: config.primaryColor }}
                  >
                    <span>{canal.acaoTexto}</span>
                    <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
