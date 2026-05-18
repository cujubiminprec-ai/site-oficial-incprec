import { BlocoConteudo } from "@/mocks/paginas-conteudo";

interface PreviewBlocosProps {
  blocos: BlocoConteudo[];
  primaryColor: string;
  secondaryColor: string;
  pageName: string;
}

export default function PreviewBlocos({ blocos, primaryColor, secondaryColor, pageName }: PreviewBlocosProps) {
  if (blocos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-300">
        <i className="ri-layout-2-line text-5xl mb-3"></i>
        <p className="text-sm font-semibold text-gray-400">Nenhum bloco adicionado</p>
        <p className="text-xs text-gray-300 mt-1">Adicione blocos no editor para ver a prévia</p>
      </div>
    );
  }

  return (
    <div className="w-full text-left overflow-y-auto bg-white">
      {/* Fake browser bar */}
      <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded-full px-3 py-1 text-xs text-gray-400 font-mono border border-gray-200 truncate">
          preview — {pageName}
        </div>
      </div>

      {/* Fake navbar */}
      <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-3">
        <div className="w-16 h-3 rounded-full" style={{ backgroundColor: `${primaryColor}40` }}></div>
        <div className="flex gap-2 ml-auto">
          {[1,2,3,4].map(i => <div key={i} className="w-10 h-2 rounded-full bg-gray-100"></div>)}
        </div>
      </div>

      {/* Render blocos */}
      <div className="w-full">
        {blocos.map((bloco) => {
          switch (bloco.tipo) {
            case "hero":
              return <PreviewHero key={bloco.id} bloco={bloco} primaryColor={primaryColor} secondaryColor={secondaryColor} />;
            case "texto":
              return <PreviewTexto key={bloco.id} bloco={bloco} primaryColor={primaryColor} />;
            case "lista":
              return <PreviewLista key={bloco.id} bloco={bloco} primaryColor={primaryColor} />;
            case "colunas":
              return <PreviewColunas key={bloco.id} bloco={bloco} primaryColor={primaryColor} />;
            case "aviso":
              return <PreviewAviso key={bloco.id} bloco={bloco} />;
            case "cta":
              return <PreviewCta key={bloco.id} bloco={bloco} primaryColor={primaryColor} />;
            case "imagem":
              return <PreviewImagem key={bloco.id} bloco={bloco} />;
            case "divisor":
              return <PreviewDivisor key={bloco.id} />;
            default:
              return null;
          }
        })}
      </div>

      {/* Fake footer */}
      <div className="mt-8 py-6 px-4 border-t border-gray-100" style={{ backgroundColor: `${primaryColor}08` }}>
        <div className="grid grid-cols-3 gap-4 max-w-screen-xl mx-auto">
          {[1,2,3].map(i => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-20 h-2.5 rounded-full" style={{ backgroundColor: `${primaryColor}30` }}></div>
              <div className="w-full h-1.5 rounded-full bg-gray-100"></div>
              <div className="w-3/4 h-1.5 rounded-full bg-gray-100"></div>
              <div className="w-1/2 h-1.5 rounded-full bg-gray-100"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-px bg-gray-200 max-w-screen-xl mx-auto"></div>
        <div className="mt-3 w-40 h-2 rounded-full bg-gray-200 mx-auto"></div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function PreviewHero({ bloco, primaryColor, secondaryColor }: { bloco: BlocoConteudo; primaryColor: string; secondaryColor: string }) {
  const align = bloco.alinhamento === "left" ? "items-start text-left" : bloco.alinhamento === "right" ? "items-end text-right" : "items-center text-center";

  if (!bloco.titulo && !bloco.subtitulo && !bloco.imageUrl) {
    return (
      <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}>
        <p className="text-white/50 text-xs">Hero vazio — adicione título ou imagem</p>
      </div>
    );
  }

  return (
    <div
      className="relative px-6 py-12 overflow-hidden"
      style={bloco.imageUrl
        ? { backgroundImage: `url(${bloco.imageUrl})`, backgroundSize: "cover", backgroundPosition: "top center" }
        : { background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)` }
      }
    >
      {bloco.imageUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>}
      <div className={`relative z-10 flex flex-col ${align} gap-2 max-w-xl mx-auto`}>
        {bloco.titulo && (
          <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {bloco.titulo}
          </h2>
        )}
        {bloco.subtitulo && (
          <p className="text-white/80 text-xs leading-relaxed max-w-sm">
            {bloco.subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Texto ─────────────────────────────────────────────────────────────────────
function PreviewTexto({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  if (!bloco.titulo && !bloco.texto) {
    return (
      <div className="py-6 px-5">
        <div className="w-24 h-2.5 rounded-full mb-3" style={{ backgroundColor: `${primaryColor}30` }}></div>
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-1.5 rounded-full bg-gray-100"></div>
          <div className="w-5/6 h-1.5 rounded-full bg-gray-100"></div>
          <div className="w-4/5 h-1.5 rounded-full bg-gray-100"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="py-6 px-5">
      {bloco.titulo && (
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: primaryColor }}>
          {bloco.titulo}
        </p>
      )}
      {bloco.texto && (
        <div className="flex flex-col gap-1.5">
          {bloco.texto.split("\n").filter(Boolean).slice(0, 4).map((para, i) => (
            <p key={i} className="text-xs text-gray-600 leading-relaxed">{para}</p>
          ))}
          {bloco.texto.split("\n").filter(Boolean).length > 4 && (
            <p className="text-xs text-gray-300 italic">... mais texto</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Lista ─────────────────────────────────────────────────────────────────────
function PreviewLista({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  const itens = (bloco.itens || []).filter(Boolean).slice(0, 5);
  return (
    <div className="py-6 px-5">
      {bloco.titulo && (
        <p className="text-sm font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {bloco.titulo}
        </p>
      )}
      {itens.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {itens.map((item, i) => (
            <li key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
              <div className="w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}20` }}>
                <i className="ri-check-line text-[10px]" style={{ color: primaryColor }}></i>
              </div>
              <span className="text-xs text-gray-700 leading-tight">{item}</span>
            </li>
          ))}
          {(bloco.itens || []).filter(Boolean).length > 5 && (
            <p className="text-[10px] text-gray-300 italic pl-2">+ {(bloco.itens || []).filter(Boolean).length - 5} itens</p>
          )}
        </ul>
      ) : (
        <div className="flex flex-col gap-1.5">
          {[1,2,3].map(i => <div key={i} className="h-7 rounded-lg bg-gray-50 border border-gray-100"></div>)}
        </div>
      )}
    </div>
  );
}

// ── Colunas ───────────────────────────────────────────────────────────────────
function PreviewColunas({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  const cols = (bloco.colunas || []).filter(c => c.titulo || c.texto);
  return (
    <div className="py-6 px-5" style={{ backgroundColor: `${primaryColor}06` }}>
      {bloco.titulo && (
        <p className="text-sm font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {bloco.titulo}
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {cols.length > 0 ? cols.map((col, i) => (
          <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
            {col.icone && (
              <div className="w-7 h-7 flex items-center justify-center rounded-lg mb-2"
                style={{ backgroundColor: `${primaryColor}15` }}>
                <i className={`${col.icone} text-xs`} style={{ color: primaryColor }}></i>
              </div>
            )}
            {col.titulo && <p className="text-xs font-bold text-gray-800 mb-1">{col.titulo}</p>}
            {col.texto && <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{col.texto}</p>}
          </div>
        )) : (
          [1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="w-7 h-7 rounded-lg mb-2 bg-gray-100"></div>
              <div className="w-full h-2 rounded bg-gray-100 mb-1"></div>
              <div className="w-3/4 h-1.5 rounded bg-gray-100"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Aviso ─────────────────────────────────────────────────────────────────────
function PreviewAviso({ bloco }: { bloco: BlocoConteudo }) {
  const cor = bloco.cor || "#D97706";
  return (
    <div className="py-4 px-5">
      <div className="rounded-xl p-3 flex items-start gap-3"
        style={{ backgroundColor: `${cor}10`, border: `1px solid ${cor}30` }}>
        <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${cor}20` }}>
          <i className="ri-alert-line text-xs" style={{ color: cor }}></i>
        </div>
        <div>
          {bloco.titulo && <p className="text-xs font-bold mb-0.5" style={{ color: cor }}>{bloco.titulo}</p>}
          {bloco.texto && <p className="text-xs leading-relaxed line-clamp-2" style={{ color: cor }}>{bloco.texto}</p>}
          {!bloco.titulo && !bloco.texto && <p className="text-xs" style={{ color: cor }}>Caixa de aviso vazia</p>}
        </div>
      </div>
    </div>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function PreviewCta({ bloco, primaryColor }: { bloco: BlocoConteudo; primaryColor: string }) {
  return (
    <div className="py-6 px-5 text-center">
      <div className="inline-block rounded-xl px-6 py-6 w-full"
        style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}20` }}>
        {bloco.titulo && (
          <p className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {bloco.titulo}
          </p>
        )}
        {bloco.texto && <p className="text-xs text-gray-500 mb-3">{bloco.texto}</p>}
        {bloco.ctaLabel && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}>
            {bloco.ctaLabel}
            <i className="ri-arrow-right-line text-xs"></i>
          </div>
        )}
        {!bloco.titulo && !bloco.ctaLabel && (
          <p className="text-xs text-gray-400">Bloco CTA vazio</p>
        )}
      </div>
    </div>
  );
}

// ── Imagem ────────────────────────────────────────────────────────────────────
function PreviewImagem({ bloco }: { bloco: BlocoConteudo }) {
  return (
    <div className="py-4 px-5">
      {bloco.imageUrl ? (
        <div className="w-full rounded-xl overflow-hidden" style={{ maxHeight: "160px" }}>
          <img src={bloco.imageUrl} alt={bloco.imageAlt || ""} className="w-full h-40 object-cover object-top" />
          {bloco.imageAlt && <p className="text-[10px] text-gray-400 text-center mt-1">{bloco.imageAlt}</p>}
        </div>
      ) : (
        <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
          <i className="ri-image-line text-2xl"></i>
        </div>
      )}
    </div>
  );
}

// ── Divisor ───────────────────────────────────────────────────────────────────
function PreviewDivisor() {
  return (
    <div className="px-5 py-2">
      <hr className="border-gray-100" />
    </div>
  );
}
