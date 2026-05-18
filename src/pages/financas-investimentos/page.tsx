import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { docsFinanceiros as mockDocs, secoesFinancas, DocFinanceiro } from "@/mocks/financas-investimentos";

const STORAGE_KEY = "inprec_financas_docs";

function DocCard({ doc, primaryColor }: { doc: DocFinanceiro; primaryColor: string }) {
  const secao = secoesFinancas.find((s) => s.key === doc.secao);
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${primaryColor}12` }}>
        <i className={`${secao?.icon || "ri-file-text-line"} text-base`} style={{ color: primaryColor }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{doc.titulo}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {doc.tipo} · {doc.tamanho} ·{" "}
          {new Date(doc.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        {doc.descricao && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{doc.descricao}</p>}
      </div>
      {doc.link ? (
        <a
          href={doc.link}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white whitespace-nowrap cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <i className="ri-download-2-line text-xs"></i>
          Acessar
        </a>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 bg-gray-50 whitespace-nowrap flex-shrink-0">
          <i className="ri-time-line text-xs"></i>
          Arquivo não anexado
        </span>
      )}
    </div>
  );
}

export default function FinancasInvestimentosPage() {
  const { config } = useSiteConfig();
  const [secaoAtiva, setSecaoAtiva] = useState(secoesFinancas[0].key);
  const [filtroAno, setFiltroAno] = useState<number | "todos">("todos");
  const [docs, setDocs] = useState<DocFinanceiro[]>([]);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation({ threshold: 0.05 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setDocs(saved ? JSON.parse(saved) : mockDocs);
    } catch {
      setDocs(mockDocs);
    }
  }, []);

  const secaoInfo = secoesFinancas.find((s) => s.key === secaoAtiva);
  const isVisaoGeral = secaoAtiva === "visao-geral";
  const docsPublicos = docs.filter((d) => d.ativo && d.link);
  const docsFiltrados = docsPublicos.filter(
    (d) => (isVisaoGeral || d.secao === secaoAtiva) && (filtroAno === "todos" || d.ano === filtroAno)
  );
  const anosDisponiveis = [...new Set(docsPublicos.filter((d) => isVisaoGeral || d.secao === secaoAtiva).map((d) => d.ano))].sort((a, b) => b - a);

  return (
    <PageLayout>
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className={`pt-28 md:pt-32 pb-12 md:pb-16 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 right-16 w-64 h-64 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-3 md:mb-4">
            <i className="ri-line-chart-line"></i>
            Transparência Financeira
          </span>
          <h1 className="text-2xl md:text-5xl font-bold text-white leading-tight mb-3 md:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Finanças e<br className="hidden md:block" /> Investimentos
          </h1>
          <p className="text-white/75 text-sm md:text-lg max-w-2xl leading-relaxed">
            Acesse prestações de contas, avaliações atuariais, balanços, balancetes, relatórios de investimentos e a política de investimentos do INPREC.
          </p>
          {/* Contadores por seção */}
          <div className="flex flex-wrap gap-4 md:gap-5 mt-6 md:mt-8">
            {secoesFinancas.filter((s) => s.key !== "visao-geral").slice(0, 4).map((s) => (
              <div key={s.key} className="text-center">
                <p className="text-lg md:text-xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {docsPublicos.filter((d) => d.secao === s.key).length}
                </p>
                <p className="text-white/60 text-[10px] md:text-xs mt-0.5 max-w-[70px] md:max-w-[80px] leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submenu de seções (sticky) */}
      <section className="sticky top-16 md:top-20 z-40 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {secoesFinancas.map((s) => {
              const count = docsPublicos.filter((d) => (s.key === "visao-geral" || d.secao === s.key)).length;
              return (
                <button
                  key={s.key}
                  onClick={() => { setSecaoAtiva(s.key); setFiltroAno("todos"); }}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-3 md:py-4 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                    secaoAtiva === s.key ? "border-current" : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                  style={secaoAtiva === s.key ? { color: config.primaryColor, borderColor: config.primaryColor } : {}}
                >
                  <i className={`${s.icon} text-xs md:text-sm`}></i>
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.label.split(" ")[0]}</span>
                  <span
                    className="text-[10px] px-1 md:px-1.5 py-0.5 rounded-full font-bold"
                    style={secaoAtiva === s.key
                      ? { backgroundColor: config.primaryColor, color: "white" }
                      : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section
        ref={bodyRef as React.RefObject<HTMLElement>}
        className={`py-14 px-4 transition-all duration-700 ${bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Header da seção */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}15` }}>
                <i className={`${secaoInfo?.icon} text-base`} style={{ color: config.primaryColor }}></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{secaoInfo?.label}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{docsFiltrados.length} documento{docsFiltrados.length !== 1 ? "s" : ""} disponíve{docsFiltrados.length !== 1 ? "is" : "l"}</p>
              </div>
            </div>
            {/* Filtro por ano */}
            {anosDisponiveis.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Filtrar por ano:</span>
                <button
                  onClick={() => setFiltroAno("todos")}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                  style={filtroAno === "todos" ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                >
                  Todos
                </button>
                {anosDisponiveis.map((ano) => (
                  <button
                    key={ano}
                    onClick={() => setFiltroAno(ano)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                    style={filtroAno === ano ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                  >
                    {ano}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lista de documentos */}
          {docsFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${config.primaryColor}10` }}>
                <i className="ri-file-search-line text-2xl" style={{ color: config.primaryColor }}></i>
              </div>
              <p className="text-sm font-medium text-gray-500">Nenhum documento disponível nesta seção</p>
              <p className="text-xs text-gray-400 mt-1">Cadastre o arquivo no painel administrativo para publicar nesta seção.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {docsFiltrados.map((doc) => (
                <DocCard key={doc.id} doc={doc} primaryColor={config.primaryColor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4" style={{ backgroundColor: `${config.primaryColor}08` }}>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Precisa de um documento específico?</h2>
            <p className="text-sm text-gray-500">Entre em contato com o INPREC e solicitaremos o que você precisa.</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Link to="/contato" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90" style={{ backgroundColor: config.primaryColor }}>
              <i className="ri-mail-send-line"></i>
              Solicitar Documento
            </Link>
            <Link to="/transparencia" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap transition-all border" style={{ borderColor: config.primaryColor, color: config.primaryColor }}>
              <i className="ri-eye-line"></i>
              Portal da Transparência
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
