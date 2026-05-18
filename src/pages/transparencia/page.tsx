import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useScrollAnimation, animClass } from "@/hooks/useScrollAnimation";
import { usePageContent } from "@/hooks/usePageContent";
import PaginaBlocosRenderer from "@/components/feature/PaginaBlocosRenderer";
import {
  DocumentoTransparencia,
  SecaoTransparencia,
  STORAGE_KEY_TRANSPARENCIA,
  anosDocs,
  categoriasDocs,
  documentos,
  menusPorSecao,
  secoesTransparencia,
  obterMenusPrimariosDinamicos,
  TransparenciaMenu,
} from "@/mocks/transparencia-docs";
import { DocFinanceiro, docsFinanceiros, secoesFinancas } from "@/mocks/financas-investimentos";

const STORAGE_KEY_FINANCAS = "inprec_financas_docs";

const menuSecundario = [
  { icon: "ri-scales-3-line", titulo: "Legislacao Estadual", href: "https://sapl.ro.leg.br/" },
  { icon: "ri-speak-line", titulo: "Ouvidoria Geral", href: "https://ouvidoriageral.ro.gov.br/" },
  { icon: "ri-global-line", titulo: "Governo do Estado", href: "https://www.ro.gov.br/" },
  { icon: "ri-map-pin-line", titulo: "Enderecos INPREC", href: "/enderecos" },
  { icon: "ri-user-received-line", titulo: "Recadastramento INPREC", href: "/servicos" },
  { icon: "ri-database-2-line", titulo: "CADPREV", href: "https://cadprev.previdencia.gov.br/" },
];

function normalizeDoc(d: Partial<DocumentoTransparencia>): DocumentoTransparencia {
  const secao = (d.secao || "primario") as SecaoTransparencia;
  return {
    id: Number(d.id || Date.now()),
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    secao,
    menu: d.menu || menusPorSecao[secao][0],
    categoria: d.categoria || "Relatorios",
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

function normalizeDocFinanceiro(d: Partial<DocFinanceiro>): DocumentoTransparencia {
  const secao = secoesFinancas.find((s) => s.key === d.secao);
  const menu = secao?.label || "Finanças e Investimentos";

  return {
    id: 900000 + Number(d.id || Date.now()),
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    secao: "financas",
    menu,
    categoria: menu === "Visão Geral" ? "Relatorios" : menu,
    ano: Number(d.ano || new Date().getFullYear()),
    tamanho: d.tamanho || "",
    tipo: d.tipo || "PDF",
    data: d.data || new Date().toISOString().split("T")[0],
    icone: secao?.icon || "ri-file-chart-line",
    link: d.link || "",
    arquivoNome: "",
    ativo: d.ativo !== false,
  };
}

function dedupeDocs(docs: DocumentoTransparencia[]) {
  const map = new Map<string, DocumentoTransparencia>();
  docs.forEach((doc) => {
    const key = `${doc.secao}|${doc.menu}|${doc.titulo}|${doc.ano}|${doc.link || ""}`;
    map.set(key, doc);
  });
  return Array.from(map.values());
}

function useDocsTransparencia() {
  return useMemo(() => {
    const financasSource = (() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_FINANCAS);
        return stored ? JSON.parse(stored) : docsFinanceiros;
      } catch {
        return docsFinanceiros;
      }
    })();

    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSPARENCIA);
      const source = stored ? JSON.parse(stored) : documentos;
      return dedupeDocs([
        ...source.map(normalizeDoc),
        ...financasSource.map(normalizeDocFinanceiro),
      ]).filter((d: DocumentoTransparencia) => d.ativo !== false && !!d.link);
    } catch {
      return dedupeDocs([
        ...documentos.map(normalizeDoc),
        ...financasSource.map(normalizeDocFinanceiro),
      ]).filter((d) => d.ativo !== false && !!d.link);
    }
  }, []);
}

function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { config } = useSiteConfig();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`pt-32 pb-20 px-4 relative overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-5 right-10 w-80 h-80 rounded-full border border-white/10"></div>
        <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full border border-white/10"></div>
      </div>
      <div className="max-w-screen-xl mx-auto relative z-10 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-5">
          <i className="ri-eye-line"></i> Transparencia Publica - INPREC
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Portal da Transparencia</h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
          Acesse documentos, menus, recursos complementares e informacoes publicas alimentadas pelo painel administrativo.
        </p>
      </div>
    </section>
  );
}

function MenuPrimarioSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { config } = useSiteConfig();
  
  const menuPrimarioAtivos = useMemo(() => {
    return obterMenusPrimariosDinamicos().filter((m) => m.ativo !== false);
  }, []);

  const cardHref = (item: TransparenciaMenu) =>
    item.href || `/transparencia?secao=primario&menu=${encodeURIComponent(item.titulo)}#documentos`;

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className={`mb-10 ${animClass(isVisible, "fade", 0)}`}>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Menu Primário</h2>
          <p className="text-sm text-gray-500 mt-1">Acesse as categorias principais e seus documentos publicados.</p>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 ${animClass(isVisible, "slide-up", 60)}`}>
          {menuPrimarioAtivos.map((item) => {
            const href = cardHref(item);
            const isExternal = href.startsWith("http");
            
            return (
              <Link
                key={item.id}
                to={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener nofollow noreferrer" : undefined}
                className="flex flex-col items-center text-center p-3 md:p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl mb-2 md:mb-3 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${item.icon} text-lg md:text-xl`} style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-[10px] md:text-xs font-bold text-gray-800 leading-snug mb-1">{item.titulo}</p>
                <p className="hidden sm:block text-[10px] text-gray-400 leading-snug">{item.descricao}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MenuSecundarioSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { config } = useSiteConfig();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-10 px-4" style={{ backgroundColor: `${config.primaryColor}06` }}>
      <div className="max-w-screen-xl mx-auto">
        <div className={`mb-8 ${animClass(isVisible, "fade", 0)}`}>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Menu Secundario</h2>
          <p className="text-sm text-gray-500 mt-0.5">Links e recursos complementares</p>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${animClass(isVisible, "slide-up", 60)}`}>
          {menuSecundario.map((item) => {
            const href = item.href || `/transparencia?secao=secundario&menu=${encodeURIComponent(item.titulo)}#documentos`;
            return (
              <Link key={item.titulo} to={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener nofollow noreferrer" : undefined} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-gray-100 hover:border-gray-200 cursor-pointer transition-all group">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className={`${item.icon} text-sm`} style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{item.titulo}</p>
                <i className="ri-external-link-line text-gray-300 text-xs ml-auto"></i>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DocumentosSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });
  const { config } = useSiteConfig();
  const docs = useDocsTransparencia();
  const [params, setParams] = useSearchParams();
  const [categoria, setCategoria] = useState(params.get("categoria") || "Todos");
  const [ano, setAno] = useState(params.get("ano") || "Todos");
  const [secao, setSecao] = useState<"Todos" | SecaoTransparencia>((params.get("secao") as SecaoTransparencia) || "Todos");
  const [menu, setMenu] = useState(params.get("menu") || "Todos");
  const [busca, setBusca] = useState("");

  const menusDisponiveis: string[] = secao === "Todos" ? Array.from(new Set(docs.map((d) => d.menu))) : menusPorSecao[secao];

  const setFiltroSecao = (value: "Todos" | SecaoTransparencia) => {
    setSecao(value);
    setMenu("Todos");
    const next = new URLSearchParams(params);
    if (value === "Todos") next.delete("secao"); else next.set("secao", value);
    next.delete("menu");
    setParams(next, { replace: true });
  };

  const setFiltroMenu = (value: string) => {
    setMenu(value);
    const next = new URLSearchParams(params);
    if (value === "Todos") next.delete("menu"); else next.set("menu", value);
    setParams(next, { replace: true });
  };

  const filtered = docs
    .filter((d) => secao === "Todos" || d.secao === secao)
    .filter((d) => menu === "Todos" || d.menu === menu)
    .filter((d) => categoria === "Todos" || d.categoria === categoria)
    .filter((d) => ano === "Todos" || d.ano === Number(ano))
    .filter((d) => !busca || `${d.titulo} ${d.descricao || ""} ${d.menu}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <section id="documentos" ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className={`mb-8 ${animClass(isVisible, "slide-up", 0)}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Documentos do Portal</h2>
          <p className="text-gray-500 text-sm">Filtre por menu primario, menu secundario, recursos complementares, LGPD, ano, categoria e nome.</p>
        </div>

        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 ${animClass(isVisible, "slide-up", 40)}`}>
          {secoesTransparencia.map((s) => (
            <button key={s.key} onClick={() => setFiltroSecao(secao === s.key ? "Todos" : s.key)} className="p-4 bg-white rounded-xl border-2 text-left cursor-pointer transition-all" style={secao === s.key ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}08` } : { borderColor: "#F3F4F6" }}>
              <i className={`${s.icon} text-lg`} style={{ color: secao === s.key ? config.primaryColor : "#9CA3AF" }}></i>
              <p className="text-sm font-bold text-gray-900 mt-2">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-1">{docs.filter((d) => d.secao === s.key).length} documento{docs.filter((d) => d.secao === s.key).length !== 1 ? "s" : ""}</p>
            </button>
          ))}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-5 gap-3 mb-5 ${animClass(isVisible, "slide-up", 80)}`}>
          <div className="relative md:col-span-2">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none bg-white" />
          </div>
          <select value={menu} onChange={(e) => setFiltroMenu(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
            <option value="Todos">Todos os menus</option>
            {menusDisponiveis.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
            {categoriasDocs.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
            {anosDocs.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <i className="ri-file-search-line text-5xl mb-3 block"></i>
            <p className="text-sm font-medium">Nenhum documento encontrado</p>
            <p className="text-xs mt-1">Cadastre documentos ativos no painel admin em Transparencia.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((doc, i) => (
              <div key={doc.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all ${animClass(isVisible, "slide-up", i * 30)}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${config.primaryColor}12` }}>
                    <i className={`${doc.icone} text-base`} style={{ color: config.primaryColor }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{doc.titulo}</p>
                    {doc.descricao && <p className="text-xs text-gray-500 mt-1">{doc.descricao}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{secoesTransparencia.find((s) => s.key === doc.secao)?.label}</span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.menu}</span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.categoria}</span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-500 font-semibold">{doc.tipo}</span>
                  {doc.link ? (
                    <a href={doc.link} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity" style={{ backgroundColor: config.primaryColor }}>
                      <i className="ri-download-line"></i>Abrir
                    </a>
                  ) : (
                    <span className="text-xs px-3 py-2 rounded-xl bg-gray-100 text-gray-400 font-semibold">Arquivo não anexado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function TransparenciaPage() {
  const blocos = usePageContent("transparencia");
  const hasHeroBloco = blocos.some((b) => b.tipo === "hero");
  const heroBlocos = blocos.filter((b) => b.tipo === "hero");
  const blocosNaoHero = blocos.filter((b) => b.tipo !== "hero");

  return (
    <PageLayout>
      {hasHeroBloco ? <PaginaBlocosRenderer blocos={heroBlocos} /> : <HeroSection />}
      {blocosNaoHero.length > 0 && <PaginaBlocosRenderer blocos={blocosNaoHero} />}
      <MenuPrimarioSection />
      <MenuSecundarioSection />
      <DocumentosSection />
    </PageLayout>
  );
}
