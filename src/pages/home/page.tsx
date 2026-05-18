import { ReactNode, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import AcessoRapidoSection from "./components/AcessoRapidoSection";
import EleicaoBanner from "./components/EleicaoBanner";
import PainelTransparenciaSection from "./components/PainelTransparenciaSection";
import ServicosSection from "./components/ServicosSection";
import QuemSomosSection from "./components/QuemSomosSection";
import NoticiasSection from "./components/NoticiasSection";
import ProGestaoSection from "./components/ProGestaoSection";
import TransparenciaSection from "./components/TransparenciaSection";
import ContatoSection from "./components/ContatoSection";
import Footer from "./components/Footer";
import FloatingButtons from "@/components/feature/FloatingButtons";
import { HOME_SECTIONS_UPDATED_EVENT, HomeSectionConfig, loadHomeSections } from "@/mocks/home-sections";

function CustomHomeSection({ section }: { section: HomeSectionConfig }) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${section.cor || "#059669"}18`, color: section.cor || "#059669" }}
            >
              <i className={`${section.icone || "ri-layout-row-line"} text-2xl`}></i>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{section.titulo}</h2>
              {section.descricao && <p className="text-gray-600 mt-2 leading-relaxed">{section.descricao}</p>}
            </div>
            {section.linkUrl && (
              <a
                href={section.linkUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: section.cor || "#059669" }}
              >
                {section.linkLabel || "Acessar"}
                <i className="ri-arrow-right-line"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [sections, setSections] = useState<HomeSectionConfig[]>(() => loadHomeSections());

  useEffect(() => {
    const updateSections = () => setSections(loadHomeSections());
    window.addEventListener("storage", updateSections);
    window.addEventListener(HOME_SECTIONS_UPDATED_EVENT, updateSections);
    return () => {
      window.removeEventListener("storage", updateSections);
      window.removeEventListener(HOME_SECTIONS_UPDATED_EVENT, updateSections);
    };
  }, []);

  const sectionComponents: Partial<Record<HomeSectionConfig["id"], ReactNode>> = {
    hero: <HeroSlider />,
    acesso: <AcessoRapidoSection />,
    eleicao: <EleicaoBanner />,
    painel: <PainelTransparenciaSection />,
    servicos: <ServicosSection />,
    quem: <QuemSomosSection />,
    noticias: <NoticiasSection />,
    progestao: <ProGestaoSection />,
    transparencia: <TransparenciaSection />,
    contato: <ContatoSection />,
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main>
        {sections
          .filter((section) => section.ativo)
          .sort((a, b) => a.ordem - b.ordem)
          .map((section) => (
            <div key={section.id}>
              {section.kind === "custom" ? <CustomHomeSection section={section} /> : sectionComponents[section.id]}
            </div>
          ))}
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
