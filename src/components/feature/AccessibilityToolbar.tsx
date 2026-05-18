import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function AccessibilityToolbar() {
  const { increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast, highContrast } = useAccessibility();
  const { config } = useSiteConfig();

  if (!config.topbarVisivel) return null;

  return (
    <div className="bg-gray-100 border-b border-gray-200 py-1.5 px-4 hidden md:block">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Acessibilidade</span>
          <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
            <button 
              onClick={decreaseFontSize}
              title="Diminuir texto"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-xs"
            >
              A-
            </button>
            <button 
              onClick={resetFontSize}
              title="Tamanho padrão"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-[10px] font-bold"
            >
              A
            </button>
            <button 
              onClick={increaseFontSize}
              title="Aumentar texto"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              A+
            </button>
          </div>
          <button 
            onClick={toggleHighContrast}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all cursor-pointer ${
              highContrast ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-contrast-2-line"></i>
            {highContrast ? "Contraste Ativo" : "Alto Contraste"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <a href="#conteudo" className="text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Ir para o conteúdo [1]</a>
          <a href="#menu" className="text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Ir para o menu [2]</a>
          <a href="/acessibilidade" className="text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Acessibilidade [3]</a>
        </div>
      </div>
    </div>
  );
}
