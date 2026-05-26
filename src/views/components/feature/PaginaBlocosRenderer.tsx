import { Link } from "react-router-dom";
import { BlocoConteudo } from "@/mocks/paginas-conteudo";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import ProGestaoBadge, { hasProGestaoLocation } from "@/components/feature/ProGestaoBadge";

interface PaginaBlocosRendererProps {
  blocos: BlocoConteudo[];
}

export default function PaginaBlocosRenderer({ blocos }: PaginaBlocosRendererProps) {
  const { config } = useSiteConfig();

  if (!blocos || blocos.length === 0) return null;

  return (
    <div className="w-full">
      {blocos.map((bloco) => {
        switch (bloco.tipo) {
          case "hero":
            return <HeroBloco key={bloco.id} bloco={bloco} primaryColor={config.primaryColor} secondaryColor={config.secondaryColor} />;
          case "texto":
            return <TextoBloco key={bloco.id} bloco={bloco} primaryColor={config.primaryColor} />;
          case "lista":
            return <ListaBloco key={bloco.id} bloco={bloco} primaryColor={config.primaryColor} />;
          case "colunas":
            return <ColunasBloco key={bloco.id} bloco={bloco} primaryColor={config.primaryColor} />;
          case "aviso":
            return <AvisoBloco key={bloco.id} bloco={bloco} />;
          case "cta":
            return <CtaBloco key={bloco.id} bloco={bloco} primaryColor={config.primaryColor} />;
          case "imagem":
            return <ImagemBloco key={bloco.id} bloco={bloco} />;
          case "divisor":
            return <DivisorBloco key={bloco.id} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// ── Bloco Hero ─────────────────────────────────────────────────────────────────
function HeroBloco({ bloco, primaryColor, secondaryColor }: { bloco: BlocoConteudo; primaryColor: string; secondaryColor: string }) {
  const align = bloco.alinhamento === "left" ? "text-left items-start" : bloco.alinhamento === "right" ? "text-right items-end" : "text-center items-center";

  if (!bloco.titulo && !bloco.subtitulo) return null;

  return (
    <section
      className="pt-32 pb-20 px-4 relative overflow-hidden"
      style={bloco.imageUrl
        ? { backgroundImage: `url(${bloco.imageUrl})`, backgroundSize: "cover", backgroundPosition: "top center" }
        : { background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)` }
      }
    >
      {bloco.imageUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>}
      <div className={`max-w-screen-xl mx-auto flex flex-col ${align} relative z-10`}>
        {bloco.titulo && (
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {bloco.titulo}
          </h1>
        )}
        {bloco.subtitulo && (
          <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
            {bloco.subtitulo}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Bloco Texto ────────────────────────────────────────────────────────────────
// ── Bloco Texto ────────────────────────────────────────────────────────────────
function TextoBloco({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  const { config } = useSiteConfig();
  if (!bloco.titulo && !bloco.texto) return null;

  const isTrTexto = bloco.id === "tr-texto";

  if (isTrTexto) {
    return (
      <section className="py-12 px-4 animate-fade-in">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
          <div className="flex-1 min-w-0">
            {bloco.titulo && (
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: primaryColor }}>
                {bloco.titulo}
              </span>
            )}
            {bloco.texto && (
              <div className="prose max-w-3xl">
                {bloco.texto.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          {hasProGestaoLocation(config, "conteudo") && (
            <div className="flex-shrink-0 w-full md:w-72">
              <ProGestaoBadge config={config} variant="card" />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-screen-xl mx-auto">
        {bloco.titulo && (
          <span className="text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: primaryColor }}>
            {bloco.titulo}
          </span>
        )}
        {bloco.texto && (
          <div className="prose max-w-3xl">
            {bloco.texto.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Bloco Lista ────────────────────────────────────────────────────────────────
function ListaBloco({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  const itens = (bloco.itens || []).filter(Boolean);
  if (itens.length === 0 && !bloco.titulo) return null;
  return (
    <section className="py-12 px-4">
      <div className="max-w-screen-xl mx-auto">
        {bloco.titulo && (
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {bloco.titulo}
          </h2>
        )}
        <ul className="flex flex-col gap-2 max-w-2xl">
          {itens.map((item, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <div className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${primaryColor}15` }}>
                <i className="ri-check-line text-xs" style={{ color: primaryColor }}></i>
              </div>
              <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Bloco Colunas ──────────────────────────────────────────────────────────────
function ColunasBloco({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  const colunas = (bloco.colunas || []).filter(c => c.titulo || c.texto);
  if (colunas.length === 0 && !bloco.titulo) return null;
  return (
    <section className="py-14 px-4" style={{ backgroundColor: `${primaryColor}06` }}>
      <div className="max-w-screen-xl mx-auto">
        {bloco.titulo && (
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {bloco.titulo}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {colunas.map((col, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
              {col.icone && (
                <div className="w-11 h-11 flex items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <i className={`${col.icone} text-lg`} style={{ color: primaryColor }}></i>
                </div>
              )}
              {col.titulo && (
                <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {col.titulo}
                </h3>
              )}
              {col.texto && (
                <p className="text-sm text-gray-500 leading-relaxed">{col.texto}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Bloco Aviso ────────────────────────────────────────────────────────────────
function AvisoBloco({ bloco }: { bloco: BlocoConteudo }) {
  if (!bloco.titulo && !bloco.texto) return null;
  const cor = bloco.cor || "#D97706";
  return (
    <section className="py-6 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="rounded-2xl p-5 flex items-start gap-4"
          style={{ backgroundColor: `${cor}10`, border: `1px solid ${cor}30` }}>
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${cor}20` }}>
            <i className="ri-alert-line text-base" style={{ color: cor }}></i>
          </div>
          <div>
            {bloco.titulo && (
              <p className="text-sm font-bold mb-1" style={{ color: cor }}>{bloco.titulo}</p>
            )}
            {bloco.texto && (
              <p className="text-sm leading-relaxed" style={{ color: cor }}>{bloco.texto}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Bloco CTA ──────────────────────────────────────────────────────────────────
function CtaBloco({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  if (!bloco.titulo && !bloco.ctaLabel) return null;
  return (
    <section className="py-12 px-4">
      <div className="max-w-screen-xl mx-auto text-center">
        <div className="inline-block rounded-2xl px-10 py-10"
          style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}20` }}>
          {bloco.titulo && (
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {bloco.titulo}
            </h3>
          )}
          {bloco.texto && (
            <p className="text-sm text-gray-500 mb-6 max-w-md">{bloco.texto}</p>
          )}
          {bloco.ctaLabel && bloco.ctaUrl && (
            <Link to={bloco.ctaUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}>
              {bloco.ctaLabel}
              <i className="ri-arrow-right-line text-sm"></i>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Bloco Imagem ───────────────────────────────────────────────────────────────
function ImagemBloco({ bloco }: { bloco: BlocoConteudo }) {
  if (!bloco.imageUrl) return null;
  return (
    <section className="py-8 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="w-full max-h-96 rounded-2xl overflow-hidden">
          <img src={bloco.imageUrl} alt={bloco.imageAlt || ""} className="w-full h-full object-cover object-top" />
        </div>
        {bloco.imageAlt && (
          <p className="text-xs text-gray-400 text-center mt-2">{bloco.imageAlt}</p>
        )}
      </div>
    </section>
  );
}

// ── Bloco Divisor ──────────────────────────────────────────────────────────────
function DivisorBloco() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-2">
      <hr className="border-gray-100" />
    </div>
  );
}
