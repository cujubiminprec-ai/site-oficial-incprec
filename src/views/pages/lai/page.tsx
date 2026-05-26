import { useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";
import FormPedidoLAI from "./components/FormPedidoLAI";
import ConsultaProtocoloLAI from "./components/ConsultaProtocoloLAI";

type Aba = "pedido" | "consultar";

export default function LAIPage() {
  const { config } = useSiteConfig();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [aba, setAba] = useState<Aba>("pedido");
  const [protocoloDestaque, setProtocoloDestaque] = useState<string | null>(null);

  const blocos       = usePageContent("lai");
  const hasHero      = blocos.some(b => b.tipo === "hero");
  const heroBlocos   = blocos.filter(b => b.tipo === "hero");
  const outrosBlocos = blocos.filter(b => b.tipo !== "hero");

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
              Lei nº 12.527/2011
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Lei de Acesso<br />à Informação
            </h1>
            <p className="text-white/70 text-base max-w-xl mx-auto">
              Solicite informações públicas de forma simples e gratuita, conforme garantido pela LAI.
            </p>
          </div>
        </section>
      )}

      {outrosBlocos.length > 0 && <PaginaBlocosRenderer blocos={outrosBlocos} />}

      {/* Cards informativos */}
      <section className="py-12 px-4 border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "ri-user-heart-line",         title: "Quem pode pedir?",  text: "Qualquer pessoa, física ou jurídica, pode solicitar informações sem necessidade de justificativa." },
              { icon: "ri-time-line",               title: "Prazo de resposta", text: "O órgão tem 20 dias para responder, prorrogáveis por mais 10 dias com justificativa." },
              { icon: "ri-money-dollar-circle-line",title: "É gratuito?",       text: "Sim, o acesso à informação é gratuito. Pode haver cobrança apenas de reprodução de documentos." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                  <i className={`${item.icon} text-lg`} style={{ color: config.primaryColor }}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário + Consulta */}
      <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Coluna esquerda: form ou consulta */}
          <div className={animClass(isVisible, "slide-up", 0)}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {aba === "pedido" ? "Pedido de Informação" : "Consultar Pedido"}
              </h2>

              {/* Abas */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {([
                  { key: "pedido",    label: "Novo Pedido",       icon: "ri-file-add-line" },
                  { key: "consultar", label: "Consultar",         icon: "ri-search-line" },
                ] as { key: Aba; label: string; icon: string }[]).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setAba(item.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
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
            </div>

            {/* Alerta pós-envio */}
            {protocoloDestaque && aba === "consultar" && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm font-semibold"
                style={{ backgroundColor: `${config.primaryColor}12`, color: config.primaryColor }}
              >
                <i className="ri-checkbox-circle-line text-lg flex-shrink-0"></i>
                <span>
                  Protocolo <span className="font-mono tracking-wider">{protocoloDestaque}</span> registrado!
                  Consulte o andamento aqui.
                </span>
              </div>
            )}

            {aba === "pedido" && (
              <FormPedidoLAI
                onProtocoloGerado={(p) => {
                  setProtocoloDestaque(p);
                  setTimeout(() => setAba("consultar"), 5000);
                }}
              />
            )}
            {aba === "consultar" && <ConsultaProtocoloLAI />}
          </div>

          {/* Coluna direita: informações disponíveis */}
          <div className={animClass(isVisible, "slide-right", 100)}>
            <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Informações disponíveis
            </h3>
            <div className="flex flex-col gap-3 mb-6">
              {[
                "Contratos e convênios firmados",
                "Relatórios de gestão e prestações de contas",
                "Diárias e passagens de servidores",
                "Cargos e salários de servidores públicos",
                "Orçamentos e execução financeira",
                "Licitações e processos de compras",
                "Atos normativos e regulamentações",
                "Projetos e programas em execução",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                  <i className="ri-check-line text-sm flex-shrink-0" style={{ color: config.primaryColor }}></i>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            {/* Fluxo do pedido */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-bold text-gray-900 mb-4">
                <i className="ri-git-branch-line mr-1.5" style={{ color: config.primaryColor }}></i>
                Como funciona seu pedido
              </p>
              <ol className="relative border-l-2 ml-3 flex flex-col gap-5" style={{ borderColor: `${config.primaryColor}30` }}>
                {[
                  { n: 1, label: "Você preenche o formulário",           sub: "Sem necessidade de justificar o pedido" },
                  { n: 2, label: "Protocolo gerado automaticamente",     sub: "Guarde o código para acompanhar" },
                  { n: 3, label: "Análise pela equipe do INPREC",        sub: "Prazo de até 20 dias úteis" },
                  { n: 4, label: "Resposta enviada por e-mail",          sub: "Consulte aqui ou aguarde o e-mail" },
                ].map((et) => (
                  <li key={et.n} className="ml-5">
                    <span
                      className="absolute -left-3 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {et.n}
                    </span>
                    <p className="text-sm font-semibold text-gray-800">{et.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{et.sub}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
