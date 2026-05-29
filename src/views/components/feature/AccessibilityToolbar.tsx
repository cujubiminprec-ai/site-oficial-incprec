import { useAccessibility } from "@/contexts/AccessibilityContext";

const BG = "#1B3FA8";

export default function AccessibilityToolbar() {
  const { increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast, highContrast, fontSize } = useAccessibility();

  return (
    <>
      {/* Espaçador — empurra o conteúdo abaixo da barra fixa */}
      <div className="h-9 w-full print:hidden" aria-hidden="true" />

      {/* Barra fixa no topo */}
      <div
        id="barra-acessibilidade"
        role="toolbar"
        aria-label="Barra de acessibilidade"
        className="fixed top-0 left-0 right-0 z-[9999] h-9 print:hidden"
        style={{ backgroundColor: BG }}
      >
        <div className="max-w-screen-xl mx-auto h-full px-3 sm:px-5 flex items-center gap-2 sm:gap-4">

          {/* Rótulo */}
          <span className="hidden sm:block text-white/55 text-[10px] font-bold tracking-widest uppercase select-none whitespace-nowrap flex-shrink-0">
            Acessibilidade
          </span>

          {/* Grupo A- A↺ A+ */}
          <div
            className="flex items-center flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.13)", borderRadius: "6px" }}
          >
            <button
              onClick={decreaseFontSize}
              aria-label="Diminuir tamanho do texto"
              title="Diminuir texto"
              disabled={fontSize <= 80}
              className="h-7 px-2.5 flex items-center justify-center text-white font-bold text-[11px] cursor-pointer hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-md select-none transition-all"
              style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0" }}
            >
              A<sup style={{ fontSize: "8px", lineHeight: 0 }}>−</sup>
            </button>

            <span className="w-px h-4 bg-white/25 flex-shrink-0" />

            <button
              onClick={resetFontSize}
              aria-label="Redefinir tamanho do texto"
              title="Tamanho padrão"
              className="h-7 px-2 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer hover:bg-white/20 select-none transition-all gap-0.5"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              A<i className="ri-refresh-line text-[9px] opacity-80 ml-0.5"></i>
            </button>

            <span className="w-px h-4 bg-white/25 flex-shrink-0" />

            <button
              onClick={increaseFontSize}
              aria-label="Aumentar tamanho do texto"
              title="Aumentar texto"
              disabled={fontSize >= 150}
              className="h-7 px-2.5 flex items-center justify-center text-white font-bold text-[13px] cursor-pointer hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-md select-none transition-all"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              A<sup style={{ fontSize: "8px", lineHeight: 0 }}>+</sup>
            </button>
          </div>

          {/* Contraste */}
          <button
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
            title="Alternar contraste"
            className="h-7 px-3 flex items-center gap-1.5 text-white text-[10px] font-bold tracking-wide uppercase cursor-pointer transition-all hover:bg-white/20 select-none whitespace-nowrap flex-shrink-0 rounded-md"
            style={
              highContrast
                ? { backgroundColor: "rgba(255,255,255,0.28)" }
                : { backgroundColor: "rgba(255,255,255,0.13)" }
            }
          >
            {highContrast ? "CONTRASTE ALTO" : "CONTRASTE CLARO"}
            <i className={`text-sm ${highContrast ? "ri-sun-line" : "ri-settings-3-line"}`}></i>
          </button>

          {/* Links de pulo — só desktop */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <a
              href="#conteudo-principal"
              className="text-white/50 hover:text-white/90 text-[10px] font-semibold transition-colors whitespace-nowrap"
            >
              Ir ao Conteúdo [1]
            </a>
            <a
              href="#menu-principal"
              className="text-white/50 hover:text-white/90 text-[10px] font-semibold transition-colors whitespace-nowrap"
            >
              Ir ao Menu [2]
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
