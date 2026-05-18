import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const tipos = [
  {
    titulo: "Invalidez Permanente por Doença",
    desc: "Incapacidade permanente para o trabalho, por doença ou acidente sem relação com o serviço. Proventos calculados conforme tempo de contribuição.",
    icon: "ri-stethoscope-line",
    badge: "Proporcional ou Integral",
  },
  {
    titulo: "Invalidez por Acidente em Serviço",
    desc: "Incapacidade decorrente de acidente ocorrido durante o exercício das atribuições do cargo. Garante proventos integrais ao servidor.",
    icon: "ri-alert-line",
    badge: "Proventos Integrais",
  },
  {
    titulo: "Doenças Graves Especificadas em Lei",
    desc: "Doenças como tuberculose ativa, alienação mental, neoplasia maligna, cegueira, cardiopatia grave, entre outras previstas em lei. Garante proventos integrais.",
    icon: "ri-heart-pulse-line",
    badge: "Proventos Integrais",
  },
];

const documentos = [
  { nome: "Requerimento de Aposentadoria por Invalidez", tipo: "Formulário" },
  { nome: "Laudo médico pericial detalhado com CID", tipo: "Documento Médico" },
  { nome: "Relatório médico de acompanhamento", tipo: "Documento Médico" },
  { nome: "Exames complementares recentes", tipo: "Documento Médico" },
  { nome: "RG e CPF do servidor", tipo: "Documento Pessoal" },
  { nome: "Ficha Funcional emitida pelo RH", tipo: "Documento Funcional" },
  { nome: "Boletim de Ocorrência (se acidente)", tipo: "Documento Complementar" },
  { nome: "Declaração de Incapacidade de Retorno ao Trabalho", tipo: "Declaração" },
];

export default function AposentadoriaPorInvalidezPage() {
  const { config } = useSiteConfig();
  const [tabAtiva, setTabAtiva] = useState<"tipos" | "documentos" | "calculo">("tipos");
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });
  const blocos = usePageContent("beneficios-aposentadoria-invalidez");

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
                Benefício Previdenciário
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Aposentadoria<br />por Invalidez
              </h1>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                Proteção em caso de incapacidade permanente para o trabalho. O INPREC assegura proventos ao servidor municipal de Cujubim que não possa mais exercer suas funções por motivo de doença ou acidente.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a href="/formularios" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90" style={{ color: config.primaryColor }}>
                  <i className="ri-file-download-line"></i>
                  Baixar Formulário
                </a>
                <Link to="/contato" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 cursor-pointer whitespace-nowrap transition-all hover:bg-white/20">
                  <i className="ri-phone-line"></i>
                  Falar com o INPREC
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex w-40 h-40 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm flex-shrink-0">
              <i className="ri-shield-user-line text-6xl text-white/80"></i>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Tipo de Incapacidade", valor: "Permanente", desc: "sem possibilidade de retorno ao trabalho" },
            { label: "Proventos Integrais", valor: "Em 3 casos", desc: "doença grave, acidente em serviço e outros" },
            { label: "Revisão", valor: "A cada 2 anos", desc: "por perícia médica obrigatória" },
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
          <div className="flex border-b border-gray-200 mb-10 overflow-x-auto">
            {([
              { key: "tipos", label: "Tipos de Invalidez", icon: "ri-list-check-2" },
              { key: "documentos", label: "Documentos", icon: "ri-folder-open-line" },
              { key: "calculo", label: "Cálculo dos Proventos", icon: "ri-calculator-line" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTabAtiva(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${tabAtiva === tab.key ? "border-current" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                style={tabAtiva === tab.key ? { color: config.primaryColor, borderColor: config.primaryColor } : {}}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {tabAtiva === "tipos" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tipos.map((tipo) => (
                <div key={tipo.titulo} className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${tipo.icon} text-xl`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold self-start" style={{ backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }}>
                    {tipo.badge}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">{tipo.titulo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tipo.desc}</p>
                </div>
              ))}
            </div>
          )}

          {tabAtiva === "documentos" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documentos.map((doc, idx) => (
                <div key={doc.nome} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <span className="text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12`, color: config.primaryColor }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{doc.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tabAtiva === "calculo" && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 gap-4">
              {[
                { titulo: "Proventos Integrais (100%)", desc: "Garantidos nos casos de: acidente em serviço ou doença profissional; doenças graves listadas em lei (neoplasia maligna, cardiopatia grave, cegueira, tuberculose ativa, entre outras); e alienação mental.", cor: config.primaryColor },
                { titulo: "Proventos Proporcionais", desc: "Para os demais casos de invalidez, o cálculo é feito com base no tempo de contribuição do servidor, conforme as regras de cálculo vigentes da Emenda Constitucional 103/2019.", cor: "#64748b" },
                { titulo: "Revisão Periódica", desc: "O beneficiário é submetido a perícia médica a cada 2 anos para verificação da continuidade da incapacidade. Caso o servidor se recupere, o benefício é cessado e ele retorna ao serviço.", cor: "#64748b" },
              ].map((item) => (
                <div key={item.titulo} className="p-5 rounded-2xl border border-gray-100 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.cor }}></div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1" style={{ color: item.cor }}>{item.titulo}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4" style={{ backgroundColor: `${config.primaryColor}08` }}>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Situação de invalidez? Fale conosco</h2>
            <p className="text-sm text-gray-500">Nossos especialistas orientam você sobre o processo e seus direitos.</p>
          </div>
          <Link to="/contato" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90 flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
            <i className="ri-customer-service-line"></i>
            Falar com o INPREC
          </Link>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Outros Benefícios do INPREC</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Aposentadoria por Idade", href: "/beneficios/aposentadoria-por-idade", icon: "ri-user-star-line" },
              { label: "Pensão por Morte", href: "/beneficios/pensao-por-morte", icon: "ri-heart-pulse-line" },
              { label: "Auxílio-Doença", href: "/beneficios/auxilio-doenca", icon: "ri-hospital-line" },
              { label: "Fundo Previdenciário", href: "/beneficios/fundo-previdenciario", icon: "ri-bank-line" },
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
