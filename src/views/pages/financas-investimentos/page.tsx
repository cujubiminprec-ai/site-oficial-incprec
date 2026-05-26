import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/feature/PageLayout";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { docsFinanceiros as mockDocs, secoesFinancas, DocFinanceiro } from "@/mocks/financas-investimentos";
import { transparenciaService } from "@/services/transparencia.service";

function normalizeDocs(source: DocFinanceiro[]): DocFinanceiro[] {
  return source
    .filter((doc) => doc.ativo !== false)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export default function FinancasInvestimentosPage() {
  const { config } = useSiteConfig();
  const [params, setParams] = useSearchParams();
  const [docs, setDocs] = useState<DocFinanceiro[]>([]);
  const [secao, setSecao] = useState(params.get("secao") || "todos");
  const [ano, setAno] = useState(params.get("ano") || "todos");
  const [tipo, setTipo] = useState(params.get("tipo") || "todos");
  const [busca, setBusca] = useState(params.get("busca") || "");

  useEffect(() => {
    let ativo = true;
    transparenciaService
      .listarFinancas()
      .then((lista) => {
        if (!ativo) return;
        const normalizados = lista.map((doc) => ({
          ...doc,
          link: doc.link || "",
        })) as DocFinanceiro[];
        setDocs(normalizados.length > 0 ? normalizeDocs(normalizados) : normalizeDocs(mockDocs));
      })
      .catch(() => {
        if (ativo) setDocs(normalizeDocs(mockDocs));
      });
    return () => {
      ativo = false;
    };
  }, []);

  const publicarParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "todos") next.delete(key);
      else next.set(key, value);
    });
    setParams(next, { replace: true });
  };

  const anos = useMemo(() => ["todos", ...Array.from(new Set(docs.map((doc) => String(doc.ano)))).sort((a, b) => Number(b) - Number(a))], [docs]);
  const tipos = useMemo(() => ["todos", ...Array.from(new Set(docs.map((doc) => doc.tipo || "PDF"))).sort()], [docs]);

  const filtrados = useMemo(() => {
    return docs
      .filter((doc) => secao === "todos" || doc.secao === secao)
      .filter((doc) => ano === "todos" || String(doc.ano) === ano)
      .filter((doc) => tipo === "todos" || doc.tipo === tipo)
      .filter((doc) => {
        const texto = `${doc.titulo} ${doc.descricao || ""} ${doc.secao} ${doc.tipo} ${doc.ano}`.toLowerCase();
        return !busca || texto.includes(busca.toLowerCase());
      });
  }, [ano, busca, docs, secao, tipo]);

  const totalPublicados = docs.filter((doc) => !!doc.link).length;
  const secaoAtual = secoesFinancas.find((item) => item.key === secao);

  return (
    <PageLayout>
      <section className="pt-28 pb-10 px-4" style={{ background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)` }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-4">
                <i className="ri-line-chart-line"></i>Transparencia Financeira
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Financas e<br className="hidden md:block" /> Investimentos
              </h1>
              <p className="text-white/75 text-sm md:text-lg max-w-2xl leading-relaxed mt-4">
                Consulte relatórios financeiros, documentos atuariais, balanços, balancetes, investimentos e demonstrativos publicados pelo INPREC.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-full sm:min-w-[420px]">
              {[
                { label: "Documentos", value: totalPublicados },
                { label: "Categorias", value: secoesFinancas.length - 1 },
                { label: "Anos", value: Math.max(0, anos.length - 1) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 border border-white/15 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-[11px] text-white/65 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-[310px_minmax(0,1fr)] gap-6">
          <aside className="bg-white rounded-2xl border border-gray-100 p-3 h-fit lg:sticky lg:top-24">
            <div className="px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Categorias</p>
            </div>
            <button
              onClick={() => { setSecao("todos"); publicarParams({ secao: "todos" }); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-semibold ${secao === "todos" ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
              style={secao === "todos" ? { backgroundColor: config.primaryColor } : undefined}
            >
              <i className="ri-apps-2-line"></i>
              Todos os documentos
              <span className="ml-auto text-xs">{docs.length}</span>
            </button>
            {secoesFinancas.filter((item) => item.key !== "visao-geral").map((item) => {
              const active = secao === item.key;
              const count = docs.filter((doc) => doc.secao === item.key).length;
              return (
                <button
                  key={item.key}
                  onClick={() => { setSecao(item.key); publicarParams({ secao: item.key }); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-semibold mt-1 ${active ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  style={active ? { backgroundColor: config.primaryColor } : undefined}
                >
                  <i className={item.icon}></i>
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs">{count}</span>
                </button>
              );
            })}
          </aside>

          <main className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {secaoAtual?.label || "Todos os documentos"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Use os filtros para localizar documentos por assunto, ano, tipo e palavra-chave.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/transparencia/sobre" className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    <i className="ri-information-line mr-1"></i>Sobre
                  </Link>
                  <Link to="/transparencia/glossario" className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    <i className="ri-book-2-line mr-1"></i>Glossario
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-[minmax(0,1.6fr)_160px_150px] gap-3">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    value={busca}
                    onChange={(event) => { setBusca(event.target.value); publicarParams({ busca: event.target.value }); }}
                    placeholder="Buscar por titulo, descricao ou assunto..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-300"
                  />
                </div>
                <select value={ano} onChange={(event) => { setAno(event.target.value); publicarParams({ ano: event.target.value }); }} className="px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                  {anos.map((item) => <option key={item} value={item}>{item === "todos" ? "Todos os anos" : item}</option>)}
                </select>
                <select value={tipo} onChange={(event) => { setTipo(event.target.value); publicarParams({ tipo: event.target.value }); }} className="px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                  {tipos.map((item) => <option key={item} value={item}>{item === "todos" ? "Todos os tipos" : item}</option>)}
                </select>
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${config.primaryColor}12` }}>
                  <i className="ri-file-search-line text-3xl" style={{ color: config.primaryColor }}></i>
                </div>
                <p className="text-sm font-bold text-gray-700">Nenhum documento publicado para este filtro</p>
                <p className="text-xs text-gray-400 mt-1">Quando você cadastrar arquivos no painel admin, eles aparecerão aqui automaticamente.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtrados.map((doc) => {
                  const item = secoesFinancas.find((s) => s.key === doc.secao);
                  return (
                    <article key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.primaryColor}12` }}>
                          <i className={`${item?.icon || "ri-file-text-line"} text-lg`} style={{ color: config.primaryColor }}></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 leading-snug">{doc.titulo}</p>
                          {doc.descricao && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{doc.descricao}</p>}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{item?.label || doc.secao}</span>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.ano}</span>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.tipo}</span>
                            {doc.tamanho && <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500">{doc.tamanho}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-gray-400">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                        {doc.link ? (
                          <a href={doc.link} target="_blank" rel="nofollow noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: config.primaryColor }}>
                            <i className="ri-external-link-line"></i>Abrir documento
                          </a>
                        ) : (
                          <span className="text-xs px-3 py-2 rounded-xl bg-gray-100 text-gray-400 font-semibold">Sem arquivo</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>
    </PageLayout>
  );
}
