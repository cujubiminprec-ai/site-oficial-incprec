import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const STORAGE_KEY_TRANSPARENCIA = "inprec_documentos_admin";
const STORAGE_KEY_FINANCAS = "inprec_financas_docs";

interface DocInfo {
  id: string | number;
  titulo: string;
  categoria: string;
  ano: number;
  tamanho: string;
  link: string;
  data: string;
}

function getDocsTransparencia(): DocInfo[] {
  const docs: DocInfo[] = [];

  // Load from transparency docs
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TRANSPARENCIA);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((d: any) => {
          if (d.ativo !== false && d.link) {
            docs.push({
              id: d.id || Math.random(),
              titulo: d.titulo || "",
              categoria: d.categoria || "Relatórios",
              ano: Number(d.ano || new Date().getFullYear()),
              tamanho: d.tamanho || "PDF",
              link: d.link,
              data: d.data || new Date().toISOString().split("T")[0],
            });
          }
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Load from finance docs
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FINANCAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((d: any) => {
          if (d.ativo !== false && d.link) {
            docs.push({
              id: d.id || Math.random(),
              titulo: d.titulo || "",
              categoria: d.categoria || "Financeiro",
              ano: Number(d.ano || new Date().getFullYear()),
              tamanho: d.tamanho || "PDF",
              link: d.link,
              data: d.data || new Date().toISOString().split("T")[0],
            });
          }
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Deduplicate by link/title to prevent duplicates
  const map = new Map<string, DocInfo>();
  docs.forEach((doc) => {
    const key = `${doc.titulo}|${doc.ano}|${doc.link}`;
    map.set(key, doc);
  });

  // Sort by date descending
  return Array.from(map.values()).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export default function TransparenciaSection() {
  const { config } = useSiteConfig();
  const [docs, setDocs] = useState<DocInfo[]>(getDocsTransparencia);

  useEffect(() => {
    const carregar = () => {
      setDocs(getDocsTransparencia());
    };
    window.addEventListener("storage", carregar);
    window.addEventListener("inprec-transparencia-updated", carregar);
    window.addEventListener("inprec-financas-updated", carregar);
    return () => {
      window.removeEventListener("storage", carregar);
      window.removeEventListener("inprec-transparencia-updated", carregar);
      window.removeEventListener("inprec-financas-updated", carregar);
    };
  }, []);

  const docsExibidos = docs.slice(0, 6);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" id="transparencia" style={{ backgroundColor: config.secondaryColor }}>
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://readdy.ai/api/search-image?query=abstract%20texture%20grain%20dark%20deep%20background%20artistic%20minimal%20pattern%20noise%20film%20grain%20institutional&width=1920&height=600&seq=transp_bg&orientation=landscape"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${config.primaryColor}30` }}></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: `${config.primaryColor}20` }}></div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full lg:w-[40%]">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 text-white/80 text-xs font-semibold tracking-wider uppercase mb-5">
              Transparência
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Acesso à <span className="italic" style={{ color: `${config.primaryColor}` }}>informação</span> pública
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              Cumprindo a Lei de Acesso à Informação (LAI), disponibilizamos relatórios, balanços financeiros, contratos e documentos para consulta pública.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["Relatórios", "Financeiro", "Licitações", "RH", "Institucional"].map((cat) => (
                <span key={cat} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                  <i className="ri-file-line text-sm" style={{ color: `${config.primaryColor}` }}></i>
                  {cat}
                </span>
              ))}
            </div>
            <Link
              to="/transparencia"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white font-semibold text-sm hover:opacity-90 transition-colors duration-300 cursor-pointer whitespace-nowrap"
              style={{ color: config.secondaryColor }}
            >
              Ver todos os documentos
              <i className="ri-arrow-right-line" style={{ color: config.primaryColor }}></i>
            </Link>
          </div>

          <div className="w-full lg:w-[60%]">
            <div className="flex flex-col gap-3">
              {docsExibidos.length === 0 ? (
                <div className="text-center py-16 text-white/40 border border-white/10 rounded-2xl bg-white/5">
                  <i className="ri-file-search-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Nenhum documento publicado no momento.</p>
                  <p className="text-xs text-white/30 mt-1">Use o painel do administrador para cadastrar novos documentos.</p>
                </div>
              ) : (
                docsExibidos.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 cursor-pointer text-left"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${config.primaryColor}50`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-lg transition-colors duration-200" style={{ backgroundColor: `${config.primaryColor}30` }}>
                      <i className="ri-file-pdf-line text-lg" style={{ color: config.primaryColor }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate transition-colors duration-200">{doc.titulo}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/40">{doc.categoria}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-xs text-white/40">{doc.ano}</span>
                        {doc.tamanho && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="text-xs text-white/40">{doc.tamanho}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <i className="ri-download-line text-white/30 group-hover:text-white/70 transition-colors duration-200"></i>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
