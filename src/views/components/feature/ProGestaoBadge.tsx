import { Link } from "react-router-dom";
import { SiteConfig } from "@/contexts/SiteConfigContext";

export type ProGestaoLocation = "navbar" | "footer" | "home" | "conteudo";

interface ProGestaoBadgeProps {
  config: SiteConfig;
  variant?: "navbar" | "footer" | "card" | "compact";
  className?: string;
}

export function hasProGestaoLocation(config: Pick<SiteConfig, "proGestaoVisivel" | "proGestaoLocais">, location: ProGestaoLocation): boolean {
  if (!config.proGestaoVisivel) return false;
  const locais = (config.proGestaoLocais || "navbar,footer,home,conteudo")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return locais.includes(location);
}

export default function ProGestaoBadge({ config, variant = "card", className = "" }: ProGestaoBadgeProps) {
  const href = config.proGestaoLink || "/pro-gestao";
  const isExternal = href.startsWith("http") || href.startsWith("/uploads/");
  const isNavbar = variant === "navbar";
  const isFooter = variant === "footer";
  const isCompact = variant === "compact";

  const content = (
    <div
      className={
        isNavbar
          ? `flex items-center gap-2 ${className}`
          : isFooter
          ? `flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 hover:bg-white/15 transition-all group ${className}`
          : isCompact
          ? `flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 hover:bg-amber-50 transition-colors ${className}`
          : `flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-6 text-center hover:border-amber-200 hover:shadow-lg transition-all group ${className}`
      }
      title="Certificação Pró-Gestão RPPS"
    >
      {config.proGestaoSeloUrl ? (
        <img
          src={config.proGestaoSeloUrl}
          alt="Selo Pró-Gestão RPPS"
          className={
            isNavbar
              ? "h-10 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-md"
              : isFooter || isCompact
              ? "h-10 w-auto object-contain flex-shrink-0"
              : "h-28 md:h-32 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          }
        />
      ) : (
        <div
          className={
            isNavbar
              ? "h-10 w-10 md:h-12 md:w-12 rounded-full border border-amber-300 bg-[#00266a] flex items-center justify-center"
              : isFooter || isCompact
              ? "w-10 h-10 rounded-lg bg-[#003366] flex items-center justify-center flex-shrink-0"
              : "w-24 h-24 rounded-full border-2 border-yellow-400/50 bg-[#00266a] flex flex-col items-center justify-center"
          }
        >
          <i className={isNavbar || isFooter || isCompact ? "ri-medal-2-line text-yellow-300 text-xl" : "ri-medal-2-line text-yellow-300 text-4xl"}></i>
        </div>
      )}

      {!isNavbar && (
        <div className={isFooter || isCompact ? "min-w-0" : "mt-4"}>
          <p className={isFooter ? "text-white text-xs font-bold leading-tight group-hover:text-yellow-300 transition-colors" : "text-xs font-bold text-gray-900 uppercase tracking-wider"}>
            Certificação Pró-Gestão
          </p>
          <p className={isFooter ? "text-white/40 text-[10px]" : "text-[10px] text-gray-500 leading-snug mt-1 max-w-[220px]"}>
            Acesse a pasta de publicações e atos oficiais do Pró-Gestão RPPS
          </p>
        </div>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="nofollow noopener noreferrer" className="cursor-pointer">
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className="cursor-pointer">
      {content}
    </Link>
  );
}
