import { useState, useMemo } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { leis, categorias, Lei } from "@/mocks/legislacao";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";

const tipoColors: Record<string, string> = {
  "Lei Federal": "#059669",
  "Lei Municipal": "#0891B2",
  "Decreto": "#D97706",
  "Resolução": "#7C3AED",
  "Portaria": "#DB2777",
  "Instrução Normativa": "#374151",
};

function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full border border-white/10"></div>
        <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full border border-white/10"></div>
      </div>
      <div className="max-w-screen-xl mx-auto text-center relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
          <i className="ri-scales-3-line"></i>
          Base Legal do RPPS
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Legislação
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
          Leis, decretos, resoluções e portarias que fundamentam o Regime Próprio de Previdência Social do município.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {[
            { label: "Leis Federais", value: leis.filter(l => l.tipo === "Lei Federal").length },
            { label: "Legislação Municipal", value: leis.filter(l => l.tipo === "Lei Municipal" || l.tipo === "Decreto").length },
            { label: "Normas e Portarias", value: leis.filter(l => l.tipo === "Portaria" || l.tipo === "Resolução" || l.tipo === "Instrução Normativa").length },
            { label: "Destaques", value: leis.filter(l => l.destaque).length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeiCard({ lei, primaryColor }: { lei: Lei; primaryColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const tipoColor = tipoColors[lei.tipo] || primaryColor;
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${lei.destaque ? "border-l-4" : "border-gray-100"}`}
      style={lei.destaque ? { borderLeftColor: primaryColor } : {}}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${tipoColor}15`, color: tipoColor }}
            >
              {lei.tipo}
            </span>
            {lei.destaque && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                <i className="ri-star-fill mr-1"></i>Principal
              </span>
            )}
            <span className="text-xs text-gray-400">{lei.publicacao}</span>
          </div>
          <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{lei.numero}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {lei.titulo}
        </h3>
        <p className={`text-xs text-gray-500 leading-relaxed transition-all duration-300 ${expanded ? "" : "line-clamp-2"}`}>
          {lei.descricao}
        </p>
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            style={{ color: primaryColor }}
          >
            {expanded ? "Ver menos" : "Leia mais"}
            {expanded ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              <i className="ri-calendar-line mr-1"></i>{lei.ano}
            </span>
            {lei.link ? (
              <a
                href={lei.link}
                target="_blank"
                rel="noopener nofollow noreferrer"
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap font-semibold"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <i className="ri-external-link-line text-xs"></i>
                Acessar
              </a>
            ) : (
              <button
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap font-semibold text-gray-400 bg-gray-50"
              >
                <i className="ri-download-line text-xs"></i>
                Baixar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LegislacaoPage() {
  const { config } = useSiteConfig();
  const blocos = usePageContent("legislacao");
  const hasHeroBloco = blocos.some(b => b.tipo === "hero");
  const heroBlocos = blocos.filter(b => b.tipo === "hero");
  const blocosNaoHero = blocos.filter(b => b.tipo !== "hero");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [apenasDestaques, setApenasDestaques] = useState(false);
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });

  const tipos = ["Todos", "Lei Federal", "Lei Municipal", "Decreto", "Resolução", "Portaria", "Instrução Normativa"];

  const leisFiltradas = useMemo(() => {
    return leis.filter((l) => {
      const matchCategoria = categoriaAtiva === "Todas" || l.categoria === categoriaAtiva;
      const matchTipo = tipoFiltro === "Todos" || l.tipo === tipoFiltro;
      const matchBusca =
        !busca ||
        l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        l.numero.toLowerCase().includes(busca.toLowerCase()) ||
        l.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchDestaque = !apenasDestaques || l.destaque;
      return matchCategoria && matchTipo && matchBusca && matchDestaque;
    });
  }, [categoriaAtiva, tipoFiltro, busca, apenasDestaques]);

  const leisDestaque = leis.filter((l) => l.destaque);

  return (
    <PageLayout>
      {hasHeroBloco ? <PaginaBlocosRenderer blocos={heroBlocos} /> : <HeroSection />}
      {blocosNaoHero.length > 0 && <PaginaBlocosRenderer blocos={blocosNaoHero} />}

      {/* Destaques */}
      <section className="py-14 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.primaryColor}20` }}>
              <i className="ri-star-line text-sm" style={{ color: config.primaryColor }}></i>
            </div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Legislações Fundamentais
            </h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leisDestaque.map((lei) => (
              <LeiCard key={lei.id} lei={lei} primaryColor={config.primaryColor} />
            ))}
          </div>
        </div>
      </section>

      {/* Busca e filtros */}
      <section
        ref={contentRef as React.RefObject<HTMLElement>}
        className={`py-14 px-4 transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filtros */}
            <aside className="w-full lg:w-60 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <h3 className="text-sm font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Filtrar por Categoria
                </h3>
                <div className="flex flex-col gap-1">
                  {categorias.map((cat) => {
                    const count = cat === "Todas" ? leis.length : leis.filter((l) => l.categoria === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoriaAtiva(cat)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all text-left whitespace-nowrap"
                        style={
                          categoriaAtiva === cat
                            ? { backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }
                            : { color: "#6B7280" }
                        }
                      >
                        <span className="truncate">{cat}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                          style={
                            categoriaAtiva === cat
                              ? { backgroundColor: config.primaryColor, color: "white" }
                              : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
                          }
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 mt-5 pt-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Tipo de Norma
                  </h3>
                  <div className="flex flex-col gap-1">
                    {tipos.map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setTipoFiltro(tipo)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all text-left"
                        style={
                          tipoFiltro === tipo
                            ? { backgroundColor: `${config.primaryColor}15`, color: config.primaryColor }
                            : { color: "#6B7280" }
                        }
                      >
                        {tipo !== "Todos" && (
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tipoColors[tipo] || "#6B7280" }}
                          ></span>
                        )}
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-5 pt-5">
                  <button
                    onClick={() => setApenasDestaques(!apenasDestaques)}
                    className="flex items-center gap-3 w-full cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition-all ${apenasDestaques ? "text-white" : "border border-gray-200 bg-white"}`}
                      style={apenasDestaques ? { backgroundColor: config.primaryColor } : {}}
                    >
                      {apenasDestaques && <i className="ri-check-line text-xs"></i>}
                    </div>
                    <span className="text-xs font-medium text-gray-700">Apenas destaques</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Lista */}
            <div className="flex-1">
              {/* Busca */}
              <div className="relative mb-6">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título, número ou descrição..."
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-300 bg-white"
                />
                {busca && (
                  <button
                    onClick={() => setBusca("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </div>

              {/* Contagem */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{leisFiltradas.length}</span> norma{leisFiltradas.length !== 1 ? "s" : ""} encontrada{leisFiltradas.length !== 1 ? "s" : ""}
                </p>
                {(categoriaAtiva !== "Todas" || tipoFiltro !== "Todos" || busca || apenasDestaques) && (
                  <button
                    onClick={() => { setCategoriaAtiva("Todas"); setTipoFiltro("Todos"); setBusca(""); setApenasDestaques(false); }}
                    className="text-xs font-semibold cursor-pointer flex items-center gap-1"
                    style={{ color: config.primaryColor }}
                  >
                    <i className="ri-close-line"></i>
                    Limpar filtros
                  </button>
                )}
              </div>

              {leisFiltradas.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <i className="ri-search-line text-4xl mb-4 block"></i>
                  <p className="text-sm font-medium">Nenhuma norma encontrada</p>
                  <p className="text-xs mt-1">Tente outros termos ou filtros</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {leisFiltradas.map((lei) => (
                    <LeiCard key={lei.id} lei={lei} primaryColor={config.primaryColor} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Download */}
      <section className="py-16 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-5" style={{ backgroundColor: `${config.primaryColor}15` }}>
            <i className="ri-file-download-line text-2xl" style={{ color: config.primaryColor }}></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Compilação Completa da Legislação
          </h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Faça o download da compilação completa das leis e normas do RPPS Municipal,<br className="hidden sm:block" />
            organizada e atualizada pela equipe jurídica do INPREC.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: config.primaryColor }}
            >
              <i className="ri-file-pdf-2-line"></i>
              Baixar Compilação PDF
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all whitespace-nowrap border"
              style={{ borderColor: config.primaryColor, color: config.primaryColor }}
            >
              <i className="ri-external-link-line"></i>
              Portal da Legislação Federal
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
