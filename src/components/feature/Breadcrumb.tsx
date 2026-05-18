import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

/* ────────── mapa de caminhos ────────── */
const PATH_MAP: Record<string, string> = {
  "servicos": "Serviços",
  "previdencia": "Previdência",
  "quem-somos": "Quem Somos",
  "estrutura": "Estrutura",
  "noticias": "Notícias",
  "transparencia": "Transparência",
  "ouvidoria": "Ouvidoria",
  "lai": "LAI — Acesso à Informação",
  "perguntas-frequentes": "Perguntas Frequentes",
  "pesquisa-satisfacao": "Pesquisa de Satisfação",
  "contato": "Contato",
  "eventos": "Eventos",
  "cursos": "Cursos & Capacitações",
  "eleicao": "Eleição",
  "votacao": "Votação",
  "pro-gestao": "Pró-Gestão",
  "legislacao": "Legislação",
  "gestores": "Órgãos Colegiados",
  "lgpd": "LGPD",
  "formularios": "Formulários",
  "codigo-de-etica": "Código de Ética",
  "compromisso-com-servidor": "Compromisso com o Servidor",
  "marca": "Identidade Visual",
  "enderecos": "Endereços",
  "beneficios": "Benefícios",
  "financas-investimentos": "Finanças & Investimentos",
  "mapa-do-site": "Mapa do Site",
  "aposentadoria-por-idade": "Aposentadoria por Idade",
  "aposentadoria-por-invalidez": "Aposentadoria por Invalidez",
  "atendimento-personalizado": "Atendimento Personalizado",
  "auxilio-doenca": "Auxílio-Doença",
  "fundo-previdenciario": "Fundo Previdenciário",
  "pensao-por-morte": "Pensão por Morte",
};

const HIDDEN_ROOTS = new Set(["/admin", "/admin/login", "/admin/dashboard"]);

function toTitle(slug: string): string {
  return (
    PATH_MAP[slug] ||
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const { config } = useSiteConfig();

  const crumbs = useMemo(() => {
    if (pathname === "/" || HIDDEN_ROOTS.has(pathname)) return [];

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    const items: { label: string; href?: string }[] = [{ label: "Início", href: "/" }];

    let acc = "";
    segments.forEach((seg, idx) => {
      acc += `/${seg}`;
      const isLast = idx === segments.length - 1;

      if (/^\d+$/.test(seg)) {
        items.push({ label: "Detalhes" });
        return;
      }

      items.push({
        label: toTitle(seg),
        href: isLast ? undefined : acc,
      });
    });

    return items;
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full bg-white border-b border-gray-200/80 shadow-sm mt-16 md:mt-20"
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <ol className="flex items-center gap-2 py-3 md:py-3.5 text-sm overflow-x-auto">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={i} className="flex items-center gap-2 flex-shrink-0">
                {i > 0 && (
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className="ri-arrow-right-s-line text-gray-400 text-base"></i>
                  </div>
                )}
                {i === 0 ? (
                  <Link
                    to="/"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap rounded-md px-1.5 py-0.5 hover:bg-gray-50"
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-home-4-line text-sm" style={{ color: config.primaryColor }}></i>
                    </div>
                    <span className="font-semibold" style={{ color: config.primaryColor }}>
                      {crumb.label}
                    </span>
                  </Link>
                ) : isLast || !crumb.href ? (
                  <span className="font-bold text-gray-800 whitespace-nowrap select-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap rounded-md px-1.5 py-0.5 hover:bg-gray-50"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}