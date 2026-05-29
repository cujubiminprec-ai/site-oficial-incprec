import { useAccessibility } from "@/contexts/AccessibilityContext";

const BG = "#1B3FA8";

export default function AccessibilityToolbar() {
  const { increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast, highContrast, fontSize } = useAccessibility();

  return (
    <div
      id="barra-acessibilidade"
      role="toolbar"
      aria-label="Barra de acessibilidade"
      className="w-full z-[9998] print:hidden"
      style={{ backgroundColor: BG }}
    >
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 h-9 flex items-center justify-between gap-3">

        {/* Rótulo — oculto em mobile muito pequeno */}
        <span className="hidden sm:block text-white/60 text-[10px] font-bold tracking-widest uppercase select-none whitespace-nowrap">
          Acessibilidade
        </span>

        {/* Controles de fonte */}
        <div className="flex items-center" style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "6px" }}>
          <button
            onClick={decreaseFontSize}
            aria-label="Diminuir tamanho do texto"
            title="Diminuir texto (Alt+Menos)"
            disabled={fontSize <= 80}
            className="h-7 px-2.5 flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-all hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-md select-none"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            A<span style={{ fontSize: "9px", verticalAlign: "super" }}>−</span>
          </button>

          <div className="w-px h-4 bg-white/25 flex-shrink-0" />

          <button
            onClick={resetFontSize}
            aria-label="Redefinir tamanho padrão do texto"
            title="Tamanho padrão"
            className="h-7 px-2.5 flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-all hover:bg-white/20 select-none gap-1"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            A<i className="ri-refresh-line text-[10px] opacity-80"></i>
          </button>

          <div className="w-px h-4 bg-white/25 flex-shrink-0" />

          <button
            onClick={increaseFontSize}
            aria-label="Aumentar tamanho do texto"
            title="Aumentar texto (Alt+Mais)"
            disabled={fontSize >= 150}
            className="h-7 px-2.5 flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-all hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-md select-none"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            A<span style={{ fontSize: "11px", verticalAlign: "super" }}>+</span>
          </button>
        </div>

        {/* Contraste */}
        <button
          onClick={toggleHighContrast}
          aria-pressed={highContrast}
          aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
          title="Alternar contraste"
          className="h-7 px-3 flex items-center gap-1.5 text-white text-[10px] font-bold tracking-wide uppercase rounded-md cursor-pointer transition-all hover:bg-white/20 select-none whitespace-nowrap"
          style={highContrast ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: "rgba(255,255,255,0.12)" }}
        >
          {highContrast ? "CONTRASTE ALTO" : "CONTRASTE CLARO"}
          <i className={`text-xs ${highContrast ? "ri-sun-line" : "ri-contrast-2-line"}`}></i>
        </button>

        {/* Links de navegação rápida — apenas desktop */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <a href="#conteudo-principal" className="text-white/50 hover:text-white text-[10px] font-semibold transition-colors whitespace-nowrap">Ir ao Conteúdo [1]</a>
          <a href="#menu-principal" className="text-white/50 hover:text-white text-[10px] font-semibold transition-colors whitespace-nowrap">Ir ao Menu [2]</a>
        </div>
      </div>
    </div>
  );
}
