import { useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";
import FormManifestacao from "./components/FormManifestacao";
import ConsultaProtocolo from "./components/ConsultaProtocolo";

type Aba = "registrar" | "consultar";

export default function OuvidoriaPage() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [aba, setAba] = useState<Aba>("registrar");
  const [protocoloDestaque, setProtocoloDestaque] = useState<string | null>(null);

  const blocos      = usePageContent("ouvidoria");
  const hasHero     = blocos.some(b => b.tipo === "hero");
  const heroBlocos  = blocos.filter(b => b.tipo === "hero");
  const outrosBlocos = blocos.filter(b => b.tipo !== "hero");

  const aoGerarProtocolo = (protocolo: string) => {
    setProtocoloDestaque(protocolo);
  };

  return (
    <PageLayout>
      {/* Hero */}
      {hasHero ? (
        <PaginaBlocosRenderer blocos={heroBlocos} />
      ) : (
        <section
          className="pt-32 pb-20 px-4"
          style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
        >
          <div className="max-w-screen-xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
              Canal Oficial
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Ouvidoria
            </h1>
            <p className="text-white/70 text-base max-w-xl mx-auto">
              Registre reclamações, denúncias, sugestões, elogios e solicitações de forma segura e sigilosa.
            </p>
          </div>
        </section>
      )}

      {outrosBlocos.length > 0 && <PaginaBlocosRenderer blocos={outrosBlocos} />}

      {/* Conteúdo principal */}
      <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Coluna principal */}
          <div className={`lg:col-span-2 ${animClass(isVisible, "slide-up", 0)}`}>

            {/* Abas */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
              {([
                { key: "registrar", label: "Registrar Manifestação", icon: "ri-quill-pen-line" },
                { key: "consultar", label: "Consultar Protocolo",    icon: "ri-search-line" },
              ] as { key: Aba; label: string; icon: string }[]).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setAba(item.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
                  style={
                    aba === item.key
                      ? { backgroundColor: "#fff", color: config.primaryColor, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }
                      : { color: "#6B7280" }
                  }
                >
                  <i className={item.icon}></i>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Alerta de protocolo gerado */}
            {protocoloDestaque && aba === "consultar" && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm font-semibold"
                style={{ backgroundColor: `${config.primaryColor}12`, color: config.primaryColor }}
              >
                <i className="ri-checkbox-circle-line text-lg flex-shrink-0"></i>
                <span>
                  Protocolo <span className="font-mono tracking-wider">{protocoloDestaque}</span> gerado!
                  Você pode consultá-lo aqui a qualquer momento.
                </span>
              </div>
            )}

            {aba === "registrar" && (
              <FormManifestacao
                onProtocoloGerado={(p) => {
                  aoGerarProtocolo(p);
                  setTimeout(() => setAba("consultar"), 5000);
                }}
              />
            )}
            {aba === "consultar" && <ConsultaProtocolo />}
          </div>

          {/* Sidebar */}
          <aside className={animClass(isVisible, "slide-right", 150)}>
            <div className="flex flex-col gap-4">

              {/* Info cards */}
              {[
                { icon: "ri-time-line",           title: "Prazo de Resposta",       text: "Até 20 dias úteis após o registro da manifestação." },
                { icon: "ri-shield-keyhole-line",  title: "Sigilo Garantido",        text: "Suas informações são tratadas com total confidencialidade." },
                { icon: "ri-hashtag",              title: "Rastreamento",            text: "Receba um protocolo para acompanhar o andamento em tempo real." },
                { icon: "ri-customer-service-2-line", title: "Atendimento Presencial", text: "Seg–Sex, 8h–17h na sede do INPREC." },
                { icon: "ri-phone-line",           title: "Telefone",               text: config.telefone },
                { icon: "ri-mail-line",            title: "E-mail",                 text: config.email },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                    <i className={`${item.icon} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}

              {/* Tipos de manifestação */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-3">Tipos de manifestação</p>
                <div className="flex flex-col gap-2">
                  {[
                    { tipo: "Reclamação",              cor: "#DC2626", icone: "ri-alarm-warning-line" },
                    { tipo: "Denúncia",                cor: "#7C3AED", icone: "ri-spy-line" },
                    { tipo: "Sugestão",                cor: "#2563EB", icone: "ri-lightbulb-line" },
                    { tipo: "Elogio",                  cor: "#059669", icone: "ri-thumb-up-line" },
                    { tipo: "Solicitação de informação", cor: "#D97706", icone: "ri-question-line" },
                  ].map((item) => (
                    <div key={item.tipo} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.cor}15` }}>
                        <i className={`${item.icone} text-xs`} style={{ color: item.cor }}></i>
                      </div>
                      <span className="text-xs text-gray-600">{item.tipo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageLayout>
  );
}
