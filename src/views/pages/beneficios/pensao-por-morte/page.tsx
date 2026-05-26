import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const dependentes = [
  { tipo: "Cônjuge / Companheiro(a)", desc: "Desde que comprovada a dependência econômica ou a união estável/casamento.", icon: "ri-hearts-line" },
  { tipo: "Filhos menores de 21 anos", desc: "Filhos ou enteados não emancipados até completar 21 anos.", icon: "ri-user-2-line" },
  { tipo: "Filhos inválidos", desc: "Filhos de qualquer idade, desde que a invalidez seja anterior à morte do servidor.", icon: "ri-heart-add-line" },
  { tipo: "Pais", desc: "Pai e mãe que comprovem dependência econômica exclusiva em relação ao servidor.", icon: "ri-team-line" },
  { tipo: "Irmãos inválidos", desc: "Irmãos sem meios próprios de subsistência, cuja invalidez seja comprovada.", icon: "ri-group-line" },
];

const documentos = [
  { nome: "Requerimento de Pensão por Morte", tipo: "Formulário" },
  { nome: "Certidão de Óbito do Servidor", tipo: "Documento Obrigatório" },
  { nome: "RG e CPF do(s) dependente(s)", tipo: "Documento Pessoal" },
  { nome: "Certidão de Casamento / Escritura de União Estável", tipo: "Documento Pessoal" },
  { nome: "Certidão de Nascimento (dependentes menores)", tipo: "Documento Pessoal" },
  { nome: "Comprovante de dependência econômica", tipo: "Documento Comprobatório" },
  { nome: "Dados bancários para depósito do benefício", tipo: "Dados Bancários" },
  { nome: "Ficha funcional do servidor falecido", tipo: "Documento Funcional" },
];

export default function PensaoPorMortePage() {
  const { config } = useSiteConfig();
  const [tabAtiva, setTabAtiva] = useState<"dependentes" | "documentos" | "prazo">("dependentes");
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });
  const blocos = usePageContent("beneficios-pensao-morte");

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
                Pensão<br />por Morte
              </h1>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                Proteção financeira garantida aos dependentes do servidor público falecido. O INPREC assegura continuidade de renda para quem dependia do servidor municipal de Cujubim.
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
              <i className="ri-heart-pulse-line text-6xl text-white/80"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Destaque */}
      <section className="py-10 px-4 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Valor do Benefício", valor: "100%", desc: "da última remuneração do servidor" },
            { label: "Prazo para Requerer", valor: "90 dias", desc: "a contar do óbito do servidor" },
            { label: "Duração", valor: "Vitalícia", desc: "para cônjuge acima de 44 anos" },
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
              { key: "dependentes", label: "Dependentes", icon: "ri-group-line" },
              { key: "documentos", label: "Documentos", icon: "ri-folder-open-line" },
              { key: "prazo", label: "Prazos e Duração", icon: "ri-calendar-check-line" },
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

          {tabAtiva === "dependentes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dependentes.map((dep) => (
                <div key={dep.tipo} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${dep.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{dep.tipo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{dep.desc}</p>
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

          {tabAtiva === "prazo" && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 gap-4">
              {[
                { titulo: "Prazo para Requerimento", desc: "O pedido de pensão deve ser protocolado em até 90 dias corridos após o falecimento do servidor. Após esse prazo, a pensão é devida apenas a partir da data do requerimento.", icon: "ri-calendar-line", destaque: false },
                { titulo: "Duração — Cônjuge / Companheiro(a)", desc: "Para cônjuge ou companheiro(a) com 44 anos ou mais na data do óbito: vitalício. Para idades menores, o prazo varia conforme a legislação (4 a 20 anos). Consulte o INPREC.", icon: "ri-calendar-check-line", destaque: true },
                { titulo: "Duração — Filhos", desc: "O benefício é mantido até os 21 anos de idade. Para filhos inválidos, o benefício é mantido enquanto perdurar a incapacidade.", icon: "ri-user-2-line", destaque: false },
                { titulo: "Extinção do Benefício", desc: "O benefício cessa com nova união conjugal, emancipação ou maioridade do dependente, ou quando o dependente obtiver meios próprios de subsistência.", icon: "ri-close-circle-line", destaque: false },
              ].map((item) => (
                <div
                  key={item.titulo}
                  className="flex gap-4 p-5 rounded-2xl border"
                  style={item.destaque ? { backgroundColor: `${config.primaryColor}08`, borderColor: `${config.primaryColor}30` } : { backgroundColor: "white", borderColor: "#F1F5F9" }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className={`${item.icon} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{item.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Precisa solicitar Pensão por Morte?</h2>
            <p className="text-sm text-gray-500">Nossa equipe acompanha você em todo o processo com atenção e cuidado.</p>
          </div>
          <Link
            to="/contato"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: config.primaryColor }}
          >
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
