import { useState, useMemo } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { formularios, categoriasFormularios, Formulario } from "@/mocks/formularios";

export default function FormulariosPage() {
  const { config } = useSiteConfig();
  const [catAtiva, setCatAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });

  const [lista] = useState<Formulario[]>(() => {
    try { const s = localStorage.getItem("inprec_formularios"); return s ? JSON.parse(s) : formularios; } catch { return formularios; }
  });

  const filtrados = useMemo(() => lista.filter(f => {
    const matchCat = catAtiva === "Todos" || f.categoria === catAtiva;
    const matchBusca = !busca || f.titulo.toLowerCase().includes(busca.toLowerCase()) || f.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca && f.ativo;
  }), [lista, catAtiva, busca]);

  const destaques = lista.filter(f => f.destaque && f.ativo);

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-16 w-72 h-72 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-file-list-3-line"></i>Documentos &amp; Requerimentos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Formulários</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Todos os formulários e requerimentos necessários para solicitar serviços junto ao INPREC.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { label: "Formulários disponíveis", value: lista.filter(f => f.ativo).length },
              { label: "Categorias", value: categoriasFormularios.length },
              { label: "Destaques", value: destaques.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nota */}
      <div className="max-w-screen-xl mx-auto px-4 py-5">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <i className="ri-information-line text-amber-500 text-sm mt-0.5 flex-shrink-0"></i>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Nota:</strong> Os documentos estão disponíveis em PDF, Word (DOC/DOCX) ou Excel (XLS/XLSX). Clique em <strong>Baixar</strong> para fazer o download diretamente. Para dúvidas, entre em contato com o INPREC.
          </p>
        </div>
      </div>

      {/* Destaques */}
      {destaques.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className="ri-star-line text-xs" style={{ color: config.primaryColor }}></i>
              </div>
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Formulários em Destaque</h2>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {destaques.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border-2 p-5 hover:border-gray-200 transition-all cursor-pointer group" style={{ borderColor: `${config.primaryColor}20` }}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className="ri-file-pdf-2-line text-lg" style={{ color: config.primaryColor }}></i>
                  </div>
                  <p className="text-xs font-bold text-gray-900 leading-snug mb-1">{doc.titulo}</p>
                  <p className="text-[10px] text-gray-400 leading-snug mb-3">{doc.categoria}</p>
                  <button className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap" style={{ color: config.primaryColor }}>
                    <i className="ri-download-line"></i>Baixar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lista completa */}
      <section
        ref={contentRef as React.RefObject<HTMLElement>}
        className={`py-10 px-4 transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Busca */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar formulários..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white" />
            </div>
          </div>
          {/* Categorias */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["Todos", ...categoriasFormularios].map(cat => (
              <button key={cat} onClick={() => setCatAtiva(cat)}
                className="px-4 py-2 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all border"
                style={catAtiva === cat ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}10`, color: config.primaryColor } : { borderColor: "#E5E7EB", color: "#6B7280" }}>
                {cat}
                <span className="ml-1.5 text-[10px]">
                  ({cat === "Todos" ? lista.filter(f => f.ativo).length : lista.filter(f => f.categoria === cat && f.ativo).length})
                </span>
              </button>
            ))}
          </div>

          {/* Accordion agrupado por categoria */}
          {catAtiva === "Todos" ? (
            <div className="flex flex-col gap-4">
              {categoriasFormularios.map(cat => {
                const docs = filtrados.filter(f => f.categoria === cat);
                if (docs.length === 0) return null;
                return (
                  <details key={cat} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden" open>
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.primaryColor}12` }}>
                          <i className="ri-folder-3-line text-sm" style={{ color: config.primaryColor }}></i>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{cat}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${config.primaryColor}12`, color: config.primaryColor }}>{docs.length}</span>
                      </div>
                      <i className="ri-arrow-up-s-line text-gray-400 group-open:rotate-180 transition-transform duration-200"></i>
                    </summary>
                    <div className="border-t border-gray-50">
                      {docs.map((doc, i) => (
                        <div key={doc.id} className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i < docs.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50 transition-colors`}>
                          <div className="flex items-center gap-3">
                            <i className="ri-file-pdf-2-line text-sm text-gray-400 flex-shrink-0"></i>
                            <div>
                              <p className="text-sm text-gray-800 font-medium">{doc.titulo}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{doc.descricao}</p>
                            </div>
                          </div>
                          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
                            <i className="ri-download-line"></i>Baixar
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtrados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <i className="ri-file-search-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Nenhum formulário encontrado</p>
                </div>
              ) : (
                filtrados.map((doc, i) => (
                  <div key={doc.id} className={`bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4 hover:border-gray-200 transition-all ${animClass(contentVisible, "slide-up", i * 40)}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                        <i className="ri-file-pdf-2-line text-sm" style={{ color: config.primaryColor }}></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{doc.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doc.descricao}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{doc.tipo} • {doc.tamanho}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
                      <i className="ri-download-line"></i>Baixar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
