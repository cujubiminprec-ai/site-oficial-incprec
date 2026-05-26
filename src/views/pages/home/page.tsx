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
import { HOME_SECTIONS_UPDATED_EVENT, HomeSectionConfig, homeSectionsDefault, normalizeHomeSections } from "@/mocks/home-sections";
import { configuracoesService } from "@/services/configuracoes.service";

function CustomHomeSection({ section }: { section: HomeSectionConfig }) {
  if (section.kind === "shortcuts") {
    const atalhos = section.atalhos || [];
    return (
      <section className="py-12 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${section.cor || "#059669"}12`, color: section.cor || "#059669" }}>
                <i className={section.icone || "ri-apps-2-line"}></i>Atalhos
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{section.titulo}</h2>
              {section.descricao && <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">{section.descricao}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {atalhos.map((atalho) => (
              <a key={atalho.id} href={atalho.linkUrl || "#"} target={atalho.linkUrl?.startsWith("http") || atalho.linkUrl?.startsWith("/uploads/") ? "_blank" : undefined} rel="noreferrer" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-4 md:p-5 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: atalho.cor }}></div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${atalho.cor}16`, color: atalho.cor }}>
                  <i className={`${atalho.icone || "ri-arrow-right-line"} text-2xl`}></i>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug">{atalho.titulo}</p>
                {atalho.descricao && <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{atalho.descricao}</p>}
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold" style={{ color: atalho.cor }}>
                  {atalho.tipoDestino === "arquivo" ? "Abrir arquivo" : "Acessar"} <i className="ri-arrow-right-line"></i>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
  const [sections, setSections] = useState<HomeSectionConfig[]>(() => normalizeHomeSections(homeSectionsDefault));

  useEffect(() => {
    const updateSections = () => {
      configuracoesService
        .listarHomeSections()
        .then((lista) => setSections(normalizeHomeSections(lista)))
        .catch(() => setSections(normalizeHomeSections(homeSectionsDefault)));
    };
    updateSections();
    window.addEventListener(HOME_SECTIONS_UPDATED_EVENT, updateSections);
    return () => {
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
              {section.kind === "custom" || section.kind === "shortcuts" ? <CustomHomeSection section={section} /> : sectionComponents[section.id]}
            </div>
          ))}
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
