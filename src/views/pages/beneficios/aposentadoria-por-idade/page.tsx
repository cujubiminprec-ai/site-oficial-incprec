import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const requisitos = [
  { titulo: "Idade Mínima", desc: "60 anos para homens e 55 anos para mulheres servidores municipais de Cujubim.", icon: "ri-user-3-line" },
  { titulo: "Tempo de Contribuição", desc: "Mínimo de 35 anos para homens e 30 anos para mulheres ao RPPS ou RGPS.", icon: "ri-time-line" },
  { titulo: "Tempo no Cargo", desc: "Pelo menos 5 anos efetivos no cargo atual em que se dará a aposentadoria.", icon: "ri-briefcase-line" },
  { titulo: "Tempo no Serviço Público", desc: "No mínimo 10 anos de efetivo exercício no serviço público municipal.", icon: "ri-government-line" },
];

const documentos = [
  { nome: "Requerimento de Aposentadoria por Idade", tipo: "Formulário", icon: "ri-file-list-3-line" },
  { nome: "Cópia autenticada do RG e CPF", tipo: "Documento Pessoal", icon: "ri-id-card-line" },
  { nome: "Certidão de Nascimento ou Casamento", tipo: "Documento Pessoal", icon: "ri-file-paper-2-line" },
  { nome: "Comprovante de residência atualizado", tipo: "Documento Pessoal", icon: "ri-map-pin-line" },
  { nome: "Ficha Funcional completa emitida pelo RH", tipo: "Documento Funcional", icon: "ri-profile-line" },
  { nome: "Certidão de Tempo de Contribuição (CTC)", tipo: "Documento Previdenciário", icon: "ri-award-line" },
  { nome: "Extrato do CNIS — INSS", tipo: "Documento Previdenciário", icon: "ri-file-download-line" },
  { nome: "Laudo médico pericial (se necessário)", tipo: "Documento Médico", icon: "ri-stethoscope-line" },
];

const etapas = [
  { num: "01", titulo: "Protocolo do Requerimento", desc: "Servidor entrega requerimento com documentos ao setor de RH do município ou diretamente ao INPREC.", icon: "ri-file-add-line" },
  { num: "02", titulo: "Análise Documental", desc: "Equipe do INPREC verifica toda a documentação e solicita pendências, se houver.", icon: "ri-search-2-line" },
  { num: "03", titulo: "Cálculo do Benefício", desc: "Setor de benefícios realiza o cálculo da aposentadoria conforme legislação vigente.", icon: "ri-calculator-line" },
  { num: "04", titulo: "Parecer Jurídico", desc: "Análise jurídica para garantir a conformidade legal do processo.", icon: "ri-scales-3-line" },
  { num: "05", titulo: "Publicação em Diário Oficial", desc: "Portaria de aposentadoria publicada no Diário Oficial do Município de Cujubim.", icon: "ri-newspaper-line" },
  { num: "06", titulo: "Início do Pagamento", desc: "Primeiro pagamento realizado no mês subsequente à publicação da portaria.", icon: "ri-money-dollar-circle-line" },
];

export default function AposentadoriaPorIdadePage() {
  const { config } = useSiteConfig();
  const [tabAtiva, setTabAtiva] = useState<"requisitos" | "documentos" | "processo">("requisitos");
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });
  const blocos = usePageContent("beneficios-aposentadoria-idade");

  return (
    <PageLayout>
      <PaginaBlocosRenderer blocos={blocos} />
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-32 pb-16 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 right-16 w-64 h-64 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-white/10"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full border border-white/5"></div>
        </div>
        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4">
                <i className="ri-shield-check-line"></i>
                Benefício Previdenciário
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Aposentadoria<br />por Idade
              </h1>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                Garantia de renda vitalícia após uma carreira dedicada ao serviço público municipal de Cujubim. Conheça todos os requisitos, documentos e o passo a passo do processo.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="/formularios"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
                  style={{ color: config.primaryColor }}
                >
                  <i className="ri-file-download-line"></i>
                  Baixar Formulário
                </a>
                <Link
                  to="/contato"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 cursor-pointer whitespace-nowrap transition-all hover:bg-white/20"
                >
                  <i className="ri-phone-line"></i>
                  Falar com o INPREC
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex w-40 h-40 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm flex-shrink-0">
              <i className="ri-user-star-line text-6xl text-white/80"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Destaque Info Cards */}
      <section className="py-10 px-4 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Idade mínima (H)", valor: "60 anos", icon: "ri-men-line" },
            { label: "Idade mínima (M)", valor: "55 anos", icon: "ri-women-line" },
            { label: "Contribuição (H)", valor: "35 anos", icon: "ri-time-line" },
            { label: "Contribuição (M)", valor: "30 anos", icon: "ri-time-line" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className={`${item.icon} text-base`} style={{ color: config.primaryColor }}></i>
              </div>
              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.valor}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section
        ref={bodyRef as React.RefObject<HTMLElement>}
        className={`py-14 px-4 transition-all duration-700 ${bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex border-b border-gray-200 mb-10 overflow-x-auto">
            {([
              { key: "requisitos", label: "Requisitos", icon: "ri-check-double-line" },
              { key: "documentos", label: "Documentos", icon: "ri-folder-open-line" },
              { key: "processo", label: "Passo a Passo", icon: "ri-route-line" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTabAtiva(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                  tabAtiva === tab.key ? "border-current" : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
                style={tabAtiva === tab.key ? { color: config.primaryColor, borderColor: config.primaryColor } : {}}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {tabAtiva === "requisitos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {requisitos.map((req) => (
                <div key={req.titulo} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${req.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{req.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{req.desc}</p>
                  </div>
                </div>
              ))}
              <div className="md:col-span-2 p-5 rounded-2xl border" style={{ backgroundColor: `${config.primaryColor}08`, borderColor: `${config.primaryColor}25` }}>
                <div className="flex gap-3">
                  <i className="ri-information-line text-lg mt-0.5 flex-shrink-0" style={{ color: config.primaryColor }}></i>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: config.primaryColor }}>Importante — Regra de Transição</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Para servidores que ingressaram antes da Emenda Constitucional 103/2019 (Reforma da Previdência), podem ser aplicadas regras de transição específicas. Consulte o INPREC para verificar qual regra se aplica ao seu caso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabAtiva === "documentos" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documentos.map((doc, idx) => (
                <div key={doc.nome} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <span className="text-xs font-bold" style={{ color: config.primaryColor }}>{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{doc.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.tipo}</p>
                  </div>
                  <i className={`${doc.icon} text-base text-gray-300`}></i>
                </div>
              ))}
              <div className="sm:col-span-2 mt-4 p-5 rounded-2xl border bg-amber-50 border-amber-200">
                <div className="flex gap-3">
                  <i className="ri-alert-line text-lg mt-0.5 text-amber-600 flex-shrink-0"></i>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Atenção:</strong> Todos os documentos devem ser entregues em cópia autenticada ou original acompanhado de cópia simples para conferência. Documentos incompletos podem atrasar o processo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tabAtiva === "processo" && (
            <div className="max-w-3xl mx-auto">
              <div className="relative flex flex-col gap-0">
                {etapas.map((etapa, idx) => (
                  <div key={etapa.num} className="flex gap-5 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 flex items-center justify-center rounded-2xl text-white font-bold text-sm flex-shrink-0 z-10"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        {etapa.num}
                      </div>
                      {idx < etapas.length - 1 && (
                        <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: `${config.primaryColor}25` }}></div>
                      )}
                    </div>
                    <div className={`pb-8 flex-1 ${idx === etapas.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`${etapa.icon} text-base`} style={{ color: config.primaryColor }}></i>
                        <h3 className="text-sm font-bold text-gray-900">{etapa.titulo}</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{etapa.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-5 rounded-2xl" style={{ backgroundColor: `${config.primaryColor}08` }}>
                <p className="text-xs text-gray-500 leading-relaxed text-center">
                  <i className="ri-time-line mr-1"></i>
                  <strong>Prazo estimado:</strong> O processo completo leva em média de <strong>30 a 90 dias</strong> após a entrega de toda a documentação, dependendo da complexidade do caso.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4" style={{ backgroundColor: `${config.primaryColor}08` }}>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Tem dúvidas sobre sua aposentadoria?</h2>
            <p className="text-sm text-gray-500">Nossa equipe está pronta para orientar você em cada etapa do processo.</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
              style={{ backgroundColor: config.primaryColor }}
            >
              <i className="ri-customer-service-line"></i>
              Falar com Especialista
            </Link>
            <Link
              to="/perguntas-frequentes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap transition-all border"
              style={{ borderColor: config.primaryColor, color: config.primaryColor }}
            >
              <i className="ri-question-answer-line"></i>
              Ver Perguntas Frequentes
            </Link>
          </div>
        </div>
      </section>

      {/* Outros Benefícios */}
      <section className="py-14 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Outros Benefícios do INPREC</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Aposentadoria por Invalidez", href: "/beneficios/aposentadoria-por-invalidez", icon: "ri-shield-user-line" },
              { label: "Pensão por Morte", href: "/beneficios/pensao-por-morte", icon: "ri-heart-pulse-line" },
              { label: "Auxílio-Doença", href: "/beneficios/auxilio-doenca", icon: "ri-hospital-line" },
              { label: "Fundo Previdenciário", href: "/beneficios/fundo-previdenciario", icon: "ri-bank-line" },
              { label: "Atendimento Personalizado", href: "/beneficios/atendimento-personalizado", icon: "ri-customer-service-2-line" },
            ].map((b) => (
              <Link
                key={b.href}
                to={b.href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 text-center cursor-pointer transition-all hover:-translate-y-0.5"
              >
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
