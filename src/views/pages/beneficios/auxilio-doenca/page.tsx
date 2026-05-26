import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const requisitos = [
  { titulo: "Incapacidade Temporária", desc: "Incapacidade para o trabalho superior a 30 dias consecutivos, comprovada por laudo médico pericial.", icon: "ri-stethoscope-line" },
  { titulo: "Vínculo Ativo", desc: "O servidor deve estar em exercício ativo, sem estar em licença remunerada por outro motivo.", icon: "ri-briefcase-line" },
  { titulo: "Laudo Médico Pericial", desc: "Necessário laudo emitido por médico do município ou perito designado pelo INPREC.", icon: "ri-file-text-line" },
  { titulo: "Carência", desc: "Não há carência mínima para o auxílio-doença do servidor público municipal.", icon: "ri-calendar-line" },
];

const documentos = [
  { nome: "Requerimento de Auxílio-Doença", tipo: "Formulário" },
  { nome: "Laudo médico detalhado com CID", tipo: "Documento Médico" },
  { nome: "Atestado médico atualizado (até 30 dias)", tipo: "Documento Médico" },
  { nome: "RG e CPF do servidor", tipo: "Documento Pessoal" },
  { nome: "Ficha Funcional emitida pelo RH", tipo: "Documento Funcional" },
  { nome: "Exames complementares (se indicados)", tipo: "Documento Médico" },
  { nome: "Relatório de tratamento em andamento", tipo: "Documento Médico" },
  { nome: "Histórico de afastamentos anteriores", tipo: "Documento Funcional" },
];

const etapas = [
  { num: "01", titulo: "Afastamento médico", desc: "Servidor apresenta atestado ao RH com mínimo de 30 dias de afastamento.", icon: "ri-hospital-line" },
  { num: "02", titulo: "Encaminhamento ao INPREC", desc: "RH encaminha documentação ao INPREC para análise do benefício.", icon: "ri-send-plane-line" },
  { num: "03", titulo: "Perícia médica", desc: "Servidor é convocado para perícia com médico credenciado pelo INPREC.", icon: "ri-stethoscope-line" },
  { num: "04", titulo: "Deferimento", desc: "INPREC defere o benefício com base no laudo pericial e na legislação.", icon: "ri-check-double-line" },
  { num: "05", titulo: "Pagamento", desc: "Benefício calculado com base na remuneração do cargo e pago mensalmente.", icon: "ri-money-dollar-circle-line" },
];

export default function AuxilioDoencaPage() {
  const { config } = useSiteConfig();
  const [tabAtiva, setTabAtiva] = useState<"requisitos" | "documentos" | "processo">("requisitos");
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });
  const blocos = usePageContent("beneficios-auxilio-doenca");

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
                Auxílio-<br />Doença
              </h1>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                Benefício por incapacidade temporária para o trabalho. O INPREC garante proteção de renda ao servidor municipal durante o período de tratamento e recuperação.
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
              <i className="ri-hospital-line text-6xl text-white/80"></i>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Afastamento mínimo", valor: "30 dias", desc: "para ter direito ao benefício" },
            { label: "Valor do Benefício", valor: "100%", desc: "da remuneração do cargo" },
            { label: "Duração", valor: "Temporário", desc: "enquanto durar a incapacidade" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <p className="text-2xl font-bold" style={{ color: config.primaryColor, fontFamily: "'Poppins', sans-serif" }}>{item.valor}</p>
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

          {tabAtiva === "processo" && (
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col gap-0">
                {etapas.map((etapa, idx) => (
                  <div key={etapa.num} className="flex gap-5 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 flex items-center justify-center rounded-2xl text-white font-bold text-sm flex-shrink-0 z-10" style={{ backgroundColor: config.primaryColor }}>
                        {etapa.num}
                      </div>
                      {idx < etapas.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: `${config.primaryColor}25` }}></div>}
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
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4" style={{ backgroundColor: `${config.primaryColor}08` }}>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Precisa solicitar Auxílio-Doença?</h2>
            <p className="text-sm text-gray-500">Estamos aqui para garantir seus direitos previdenciários durante o tratamento.</p>
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
              { label: "Aposentadoria por Invalidez", href: "/beneficios/aposentadoria-por-invalidez", icon: "ri-shield-user-line" },
              { label: "Pensão por Morte", href: "/beneficios/pensao-por-morte", icon: "ri-heart-pulse-line" },
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
