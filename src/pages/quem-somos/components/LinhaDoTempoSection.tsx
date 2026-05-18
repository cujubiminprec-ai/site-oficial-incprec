import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";

interface Marco {
  ano: string;
  titulo: string;
  descricao: string;
  icone: string;
  destaque?: boolean;
}

const marcos: Marco[] = [
  {
    ano: "2003",
    titulo: "Criação do INPREC",
    descricao: "Fundação do Instituto de Previdência Social dos Servidores Públicos Municipais de Cujubim, com missão de garantir a previdência complementar dos servidores municipais.",
    icone: "ri-building-2-line",
    destaque: true,
  },
  {
    ano: "2005",
    titulo: "Início das Operações Previdenciárias",
    descricao: "Implantação dos primeiros processos de aposentadoria e pensão por morte, atendendo os servidores do município de Cujubim.",
    icone: "ri-shield-check-line",
  },
  {
    ano: "2008",
    titulo: "Digitalização dos Processos",
    descricao: "Modernização dos procedimentos com adoção de sistemas digitais para gestão de benefícios, aumentando a agilidade no atendimento.",
    icone: "ri-computer-line",
  },
  {
    ano: "2011",
    titulo: "Certificação Pró-Gestão RPPS",
    descricao: "Obtenção da primeira certificação do Programa Pró-Gestão RPPS do Ministério da Previdência Social, atestando a qualidade da gestão previdenciária.",
    icone: "ri-medal-2-line",
    destaque: true,
  },
  {
    ano: "2014",
    titulo: "Ampliação dos Serviços",
    descricao: "Expansão do portfólio com novos serviços ao servidor: simulador de aposentadoria online, atendimento por agendamento e portal de transparência.",
    icone: "ri-service-line",
  },
  {
    ano: "2016",
    titulo: "Lei Complementar de Reestruturação",
    descricao: "Promulgação da Lei Complementar que reestruturou o INPREC, modernizando sua governança, conselhos deliberativo e fiscal, e plano de custeio.",
    icone: "ri-scales-3-line",
  },
  {
    ano: "2018",
    titulo: "Portal da Transparência",
    descricao: "Lançamento do Portal da Transparência, disponibilizando online relatórios, balancetes, demonstrativos contábeis e dados de receitas e despesas.",
    icone: "ri-eye-line",
  },
  {
    ano: "2020",
    titulo: "Atendimento 100% Digital",
    descricao: "Em resposta à pandemia, o INPREC implantou atendimento totalmente digital, incluindo protocolo eletrônico de requerimentos e reuniões remotas dos conselhos.",
    icone: "ri-global-line",
    destaque: true,
  },
  {
    ano: "2022",
    titulo: "Recertificação Pró-Gestão",
    descricao: "Renovação da certificação Pró-Gestão RPPS com upgrade para nível superior, demonstrando a evolução contínua da qualidade da gestão institucional.",
    icone: "ri-award-line",
  },
  {
    ano: "2024",
    titulo: "LGPD e Compliance",
    descricao: "Implementação completa da Lei Geral de Proteção de Dados (LGPD), com designação do Encarregado de Dados, políticas de privacidade e conscientização dos servidores.",
    icone: "ri-shield-user-line",
  },
  {
    ano: "2025",
    titulo: "Novo Portal Institucional",
    descricao: "Lançamento do novo portal digital institucional com design moderno, acessibilidade aprimorada, gestão de conteúdo e integração com sistemas de transparência.",
    icone: "ri-rocket-line",
    destaque: true,
  },
];

export default function LinhaDoTempoSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { config } = useSiteConfig();

  return (
    <section
      id="historia"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 px-4 overflow-hidden"
      style={{ backgroundColor: `${config.primaryColor}06` }}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 ${animClass(isVisible, "slide-up", 0)}`}>
          <span
            className="text-xs font-semibold tracking-widest uppercase mb-3 block"
            style={{ color: config.primaryColor }}
          >
            Linha do Tempo
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Nossa História
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Mais de duas décadas de dedicação à previdência dos servidores públicos municipais de Cujubim — marcos, conquistas e evolução contínua.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px hidden md:block"
            style={{ backgroundColor: `${config.primaryColor}30` }}
          ></div>

          <div className="flex flex-col gap-0">
            {marcos.map((marco, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={marco.ano}
                  className={`relative flex items-center gap-0 md:gap-8 ${animClass(isVisible, isLeft ? "slide-left" : "slide-right", i * 60)}`}
                >
                  {/* Left side */}
                  <div className={`flex-1 ${isLeft ? "text-right pr-8" : "hidden md:block pl-8"}`}>
                    {isLeft && (
                      <div className="inline-block">
                        <div
                          className={`rounded-2xl p-5 border transition-all duration-300 hover:border-opacity-50 text-left ${marco.destaque ? "bg-white border-2" : "bg-white border border-gray-100"}`}
                          style={marco.destaque ? { borderColor: config.primaryColor } : {}}
                        >
                          {marco.destaque && (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block text-white"
                              style={{ backgroundColor: config.primaryColor }}
                            >
                              Marco Importante
                            </span>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
                              style={{ backgroundColor: `${config.primaryColor}15` }}
                            >
                              <i className={`${marco.icone} text-sm`} style={{ color: config.primaryColor }}></i>
                            </div>
                            <h3
                              className="text-sm font-bold text-gray-900"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              {marco.titulo}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{marco.descricao}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center dot + year */}
                  <div className="relative flex flex-col items-center flex-shrink-0 z-10 md:w-24">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: marco.destaque ? config.primaryColor : `${config.primaryColor}80` }}
                    >
                      <i className={`${marco.icone} text-sm`}></i>
                    </div>
                    <span
                      className="text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: marco.destaque ? config.primaryColor : `${config.primaryColor}70` }}
                    >
                      {marco.ano}
                    </span>
                  </div>

                  {/* Right side */}
                  <div className={`flex-1 ${!isLeft ? "pl-8" : "hidden md:block pr-8"}`}>
                    {!isLeft && (
                      <div
                        className={`rounded-2xl p-5 border transition-all duration-300 ${marco.destaque ? "bg-white border-2" : "bg-white border border-gray-100"}`}
                        style={marco.destaque ? { borderColor: config.primaryColor } : {}}
                      >
                        {marco.destaque && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block text-white"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            Marco Importante
                          </span>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
                            style={{ backgroundColor: `${config.primaryColor}15` }}
                          >
                            <i className={`${marco.icone} text-sm`} style={{ color: config.primaryColor }}></i>
                          </div>
                          <h3
                            className="text-sm font-bold text-gray-900"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {marco.titulo}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{marco.descricao}</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile: card full width */}
                  <div className="flex-1 md:hidden pl-4">
                    <div
                      className={`rounded-2xl p-4 border ${marco.destaque ? "bg-white border-2" : "bg-white border border-gray-100"}`}
                      style={marco.destaque ? { borderColor: config.primaryColor } : {}}
                    >
                      {marco.destaque && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block text-white"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Marco Importante
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {marco.titulo}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{marco.descricao}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
