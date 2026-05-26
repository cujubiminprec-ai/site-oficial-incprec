import { useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import SimuladorAposentadoria from "@/pages/previdencia/components/SimuladorAposentadoria";
import RequerimentosSection from "@/pages/previdencia/components/RequerimentosSection";
import InfoPrevidenciaSection from "@/pages/previdencia/components/InfoPrevidenciaSection";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const tabs = [
  { id: "simulador", label: "Simulador de Aposentadoria", icon: "ri-calculator-line" },
  { id: "requerimentos", label: "Requerimentos", icon: "ri-file-text-line" },
  { id: "informacoes", label: "Informações Gerais", icon: "ri-information-line" },
];

export default function PrevidenciaPage() {
  const [activeTab, setActiveTab] = useState("simulador");
  const { config } = useSiteConfig();

  return (
    <PageLayout>
      {/* Hero */}
      <section
        className="relative pt-28 pb-16"
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        ></div>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
              <i className="ri-shield-check-line"></i> Previdência Municipal
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Portal de Previdência
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl">
            Simule sua aposentadoria, acesse formulários de requerimento e tire dúvidas sobre seus benefícios previdenciários.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { value: "12.480", label: "Servidores Ativos", icon: "ri-user-line" },
              { value: "3.240", label: "Aposentados", icon: "ri-user-star-line" },
              { value: "98.5%", label: "Índice de Satisfação", icon: "ri-star-line" },
              { value: "R$ 2,1B", label: "Patrimônio do Fundo", icon: "ri-money-dollar-circle-line" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 mb-2">
                  <i className={`${s.icon} text-white text-sm`}></i>
                </div>
                <p className="text-white font-bold text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer"
                style={
                  activeTab === tab.id
                    ? { borderColor: config.primaryColor, color: config.primaryColor }
                    : { borderColor: "transparent", color: "#6B7280" }
                }
              >
                <i className={`${tab.icon} text-base`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
        {activeTab === "simulador" && <SimuladorAposentadoria />}
        {activeTab === "requerimentos" && <RequerimentosSection />}
        {activeTab === "informacoes" && <InfoPrevidenciaSection />}
      </div>
    </PageLayout>
  );
}
