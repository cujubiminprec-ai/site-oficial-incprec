import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { atalhosService, type AtalhoRapido } from "@/services/atalhos.service";

const FALLBACK: AtalhoRapido[] = [
  { id: -1, label: "Contracheque",  descricao: "Acesse seu demonstrativo",      href: "#contracheque",    icone: "ri-file-text-line",         cor: "#16a34a", locais: ["inicio"], externo: true,  ordem: 10, ativo: true },
  { id: -2, label: "Benefícios",    descricao: "Aposentadoria e pensões",        href: "/servicos",        icone: "ri-shield-user-line",       cor: "#0891B2", locais: ["inicio"], externo: false, ordem: 11, ativo: true },
  { id: -3, label: "Transparência", descricao: "Portal da transparência",        href: "/transparencia",   icone: "ri-eye-line",               cor: "#7C3AED", locais: ["inicio"], externo: false, ordem: 12, ativo: true },
  { id: -4, label: "Formulários",   descricao: "Requerimentos e documentos",     href: "/formularios",     icone: "ri-file-list-3-line",       cor: "#D97706", locais: ["inicio"], externo: false, ordem: 13, ativo: true },
  { id: -5, label: "Notícias",      descricao: "Fique por dentro",               href: "/noticias",        icone: "ri-newspaper-line",         cor: "#059669", locais: ["inicio"], externo: false, ordem: 14, ativo: true },
  { id: -6, label: "Atendimento",   descricao: "Fale com o INPREC",              href: "/contato",         icone: "ri-customer-service-2-line",cor: "#DC2626", locais: ["inicio"], externo: false, ordem: 15, ativo: true },
];

export default function AcessoRapidoSection() {
  const { config } = useSiteConfig();
  const contrachequeUrl = config.contrachequeUrl || "#";
  const [atalhos, setAtalhos] = useState<AtalhoRapido[]>(FALLBACK);

  useEffect(() => {
    let ativo = true;
    const carregar = () => {
      atalhosService.listar()
        .then((lista) => {
          if (!ativo) return;
          const inicio = lista
            .filter((a) => a.locais.includes("inicio"))
            .sort((a, b) => a.ordem - b.ordem);
          if (inicio.length > 0) setAtalhos(inicio);
        })
        .catch(() => {});
    };
    carregar();
    window.addEventListener("inprec-atalhos-updated", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("inprec-atalhos-updated", carregar);
    };
  }, []);

  const resolveHref = (a: AtalhoRapido) =>
    a.href === "#contracheque" ? contrachequeUrl : a.href;

  const isExterno = (a: AtalhoRapido) =>
    a.externo || (a.href === "#contracheque" && !!contrachequeUrl && contrachequeUrl !== "#");

  const cols = atalhos.length <= 3 ? atalhos.length : atalhos.length <= 4 ? 4 : atalhos.length <= 6 ? 6 : Math.min(atalhos.length, 8);

  return (
    <section className="relative z-20 -mt-6 pb-2 px-4 md:px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>

          {/* Header strip */}
          <div
            className="hidden md:flex items-center justify-between px-5 py-2"
            style={{ background: `linear-gradient(135deg, ${config.secondaryColor}, ${config.primaryColor})` }}
          >
            <div className="flex items-center gap-2">
              <i className="ri-flashlight-line text-xs text-white/80"></i>
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Acesso Rápido</span>
            </div>
            <Link
              to="/servicos"
              className="text-[11px] font-medium text-white/75 hover:text-white transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              Ver todos os serviços <i className="ri-arrow-right-line text-xs"></i>
            </Link>
          </div>

          {/* Cards */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-gray-100`}
            style={{ gridTemplateColumns: `repeat(${Math.min(cols, 6)}, minmax(0, 1fr))` }}
          >
            {atalhos.map((item) => {
              const href = resolveHref(item);
              const externo = isExterno(item);

              const inner = (
                <div className="flex flex-col items-center gap-1.5 py-4 px-2 cursor-pointer transition-all duration-300 group relative hover:bg-gray-50">
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: item.cor || config.primaryColor }}
                  />
                  {/* Ícone */}
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 overflow-hidden"
                    style={{ backgroundColor: `${item.cor || config.primaryColor}18` }}
                  >
                    {item.iconeImg ? (
                      <img src={item.iconeImg} alt={item.label} className="w-6 h-6 object-contain" />
                    ) : (
                      <i className={`${item.icone} text-lg`} style={{ color: item.cor || config.primaryColor }}></i>
                    )}
                  </div>
                  {/* Texto */}
                  <div className="text-center">
                    <p
                      className="text-xs font-bold leading-tight"
                      style={{ color: config.secondaryColor, fontFamily: "'Poppins', sans-serif" }}
                    >
                      {item.label}
                    </p>
                    {item.descricao && (
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.descricao}</p>
                    )}
                  </div>
                  {/* Badge externo */}
                  {externo && (
                    <div className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: `${config.primaryColor}20` }}>
                      <i className="ri-external-link-line text-[8px]" style={{ color: config.primaryColor }}></i>
                    </div>
                  )}
                </div>
              );

              return externo ? (
                <a key={item.id} href={href} target="_blank" rel="nofollow noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <Link key={item.id} to={href}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
