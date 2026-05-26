import { useEffect, useState } from "react";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DocumentoTransparencia, documentos, menusLGPD } from "@/mocks/transparencia-docs";
import { transparenciaService } from "@/services/transparencia.service";

const categoriasLGPD = [
  { key: "encarregado", icon: "ri-user-star-line", titulo: "Encarregado de Dados Pessoais", descricao: "Responsavel pela protecao de dados pessoais do INPREC e seus contatos." },
  { key: "consentimento", icon: "ri-fingerprint-line", titulo: "Termo de Consentimento do Uso de Dados", descricao: "Termos e formularios de consentimento para tratamento de dados pessoais." },
  { key: "legislacao", icon: "ri-scales-3-line", titulo: "Legislacao LGPD", descricao: "Lei Geral de Protecao de Dados e normas complementares." },
  { key: "canais", icon: "ri-chat-3-line", titulo: "Canais de Comunicacao", descricao: "Canais para contato e exercicio dos direitos dos titulares." },
  { key: "cartilha", icon: "ri-book-open-line", titulo: "Cartilha", descricao: "Materiais educativos sobre privacidade e protecao de dados." },
  { key: "politica", icon: "ri-lock-2-line", titulo: "Politica de Privacidade e Protecao de Dados", descricao: "Politicas institucionais de privacidade do INPREC." },
  { key: "programa", icon: "ri-shield-user-line", titulo: "Programa de Governanca em Privacidade", descricao: "Documentos do programa de governanca em privacidade." },
  { key: "perguntas", icon: "ri-question-answer-line", titulo: "Perguntas Frequentes", descricao: "Perguntas e respostas sobre LGPD." },
  { key: "aviso", icon: "ri-eye-line", titulo: "Aviso de Privacidade", descricao: "Avisos sobre coleta, uso e protecao de dados pessoais." },
];

function normalizeDoc(d: Partial<DocumentoTransparencia>): DocumentoTransparencia {
  return {
    id: Number(d.id || Date.now()),
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    secao: d.secao || "lgpd",
    menu: d.menu || menusLGPD[0],
    categoria: d.categoria || "LGPD",
    ano: Number(d.ano || new Date().getFullYear()),
    tamanho: d.tamanho || "",
    tipo: d.tipo || "PDF",
    data: d.data || new Date().toISOString().split("T")[0],
    icone: d.icone || "ri-file-pdf-line",
    link: d.link || "",
    arquivoNome: d.arquivoNome || "",
    ativo: d.ativo !== false,
  };
}

function useDocsLGPD() {
  const [docs, setDocs] = useState<DocumentoTransparencia[]>([]);

  useEffect(() => {
    let ativo = true;
    transparenciaService
      .listarDocumentos()
      .then((lista) => {
        if (!ativo) return;
        const normalizados = (lista as Partial<DocumentoTransparencia>[])
          .map(normalizeDoc)
          .filter((d) => d.secao === "lgpd" && d.ativo !== false && !!d.link);
        setDocs(normalizados.length > 0 ? normalizados : documentos.map(normalizeDoc).filter((d) => d.secao === "lgpd" && d.ativo !== false && !!d.link));
      })
      .catch(() => {
        if (ativo) setDocs(documentos.map(normalizeDoc).filter((d) => d.secao === "lgpd" && d.ativo !== false && !!d.link));
      });
    return () => {
      ativo = false;
    };
  }, []);

  return docs;
}

export default function LGPDPage() {
  const { config } = useSiteConfig();
  const docs = useDocsLGPD();
  const [catAtiva, setCatAtiva] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [ano, setAno] = useState("Todos");
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });

  const categoriaAtual = categoriasLGPD.find((c) => c.key === catAtiva);
  const anos = ["Todos", ...Array.from(new Set(docs.map((d) => String(d.ano)))).sort((a, b) => Number(b) - Number(a))];
  const docsFiltrados = docs
    .filter((d) => !categoriaAtual || d.menu === categoriaAtual.titulo)
    .filter((d) => ano === "Todos" || String(d.ano) === ano)
    .filter((d) => !busca || `${d.titulo} ${d.descricao || ""} ${d.menu}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <PageLayout>
      <section ref={heroRef as React.RefObject<HTMLElement>} className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100" : "opacity-0"}`} style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full border border-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border border-white/10"></div>
        </div>
        <div className="max-w-screen-xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
            <i className="ri-shield-user-line"></i> Governanca · Privacidade
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Lei Geral de Protecao<br />de Dados - LGPD
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Consulte os documentos de LGPD cadastrados pelo INPREC, com filtros por categoria, ano e nome do documento.
          </p>
        </div>
      </section>

      <section ref={contentRef as React.RefObject<HTMLElement>} className={`py-16 px-4 transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Menu de Navegacao LGPD</h2>
            <p className="text-sm text-gray-500">Selecione uma categoria para filtrar os documentos publicados.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {categoriasLGPD.map((cat) => (
              <button key={cat.key} onClick={() => setCatAtiva(catAtiva === cat.key ? null : cat.key)} className={`flex flex-col items-center text-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full ${catAtiva === cat.key ? "" : "border-gray-100 bg-white hover:border-gray-200"}`} style={catAtiva === cat.key ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}08` } : {}}>
                <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-3 transition-all duration-300" style={{ backgroundColor: catAtiva === cat.key ? config.primaryColor : `${config.primaryColor}12` }}>
                  <i className={`${cat.icon} text-xl`} style={{ color: catAtiva === cat.key ? "white" : config.primaryColor }}></i>
                </div>
                <p className="text-xs font-semibold text-gray-800 leading-snug">{cat.titulo}</p>
              </button>
            ))}
          </div>

          {categoriaAtual && (
            <div className="rounded-2xl border-2 p-6 mb-10 transition-all duration-300" style={{ borderColor: `${config.primaryColor}30`, backgroundColor: `${config.primaryColor}06` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
                  <i className={`${categoriaAtual.icon} text-white text-xl`}></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{categoriaAtual.titulo}</h3>
                  <p className="text-sm text-gray-500 mt-1">{categoriaAtual.descricao}</p>
                </div>
                <button onClick={() => setCatAtiva(null)} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 cursor-pointer flex-shrink-0">
                  <i className="ri-close-line text-gray-400"></i>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.primaryColor}15` }}>
              <i className="ri-file-list-3-line text-sm" style={{ color: config.primaryColor }}></i>
            </div>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {categoriaAtual ? `Documentos - ${categoriaAtual.titulo}` : "Todos os Documentos LGPD"}
            </h3>
            <div className="flex-1 h-px bg-gray-100"></div>
            <div className="relative lg:w-72">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <select value={ano} onChange={(e) => setAno(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {categoriaAtual && (
              <button onClick={() => setCatAtiva(null)} className="text-xs font-semibold cursor-pointer" style={{ color: config.primaryColor }}>Ver todos</button>
            )}
          </div>

          {docsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <i className="ri-file-line text-4xl mb-3 block"></i>
              <p className="text-sm font-medium">Nenhum documento nesta categoria ainda</p>
              <p className="text-xs mt-1">Cadastre documentos em Admin &gt; Transparencia, na secao LGPD.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {docsFiltrados.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                      <i className={`${doc.icone || "ri-file-pdf-2-line"} text-base`} style={{ color: config.primaryColor }}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{doc.titulo}</p>
                      {doc.descricao && <p className="text-xs text-gray-400 mt-0.5">{doc.descricao}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.menu}</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.tipo} · {doc.tamanho || "sem tamanho"}</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  {doc.link ? (
                    <a href={doc.link} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
                      <i className="ri-download-line"></i>Abrir
                    </a>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold">Arquivo não anexado</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
