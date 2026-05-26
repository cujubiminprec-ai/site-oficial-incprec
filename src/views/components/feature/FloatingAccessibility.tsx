import { useState } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function FloatingAccessibility() {
  const [isOpen, setIsOpen] = useState(false);
  const { increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast, highContrast } = useAccessibility();

  return (
    <div className="fixed bottom-24 left-5 z-50 flex flex-col items-start gap-2">
      {isOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-2xl flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Acessibilidade</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={decreaseFontSize} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">A-</button>
            <button onClick={resetFontSize} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all cursor-pointer font-bold text-xs">A</button>
            <button onClick={increaseFontSize} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all cursor-pointer text-lg">A+</button>
          </div>
          <button 
            onClick={toggleHighContrast}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              highContrast ? "bg-gray-900 text-white" : "bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="ri-contrast-2-line"></i>
            Contraste
          </button>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all cursor-pointer group relative"
      >
        <i className={isOpen ? "ri-close-line text-xl" : "ri-accessibility-line text-xl"}></i>
        {!isOpen && (
          <span className="absolute left-14 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Acessibilidade
          </span>
        )}
      </button>
    </div>
  );
}
