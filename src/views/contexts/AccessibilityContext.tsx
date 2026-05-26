import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie, setCookie } from "@/utils/cookies";

interface AccessibilityContextType {
  fontSize: number;
  highContrast: boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = getCookie("inprec_font_size");
    return saved ? parseFloat(saved) : 100;
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    return getCookie("inprec_high_contrast") === "true";
  });

  useEffect(() => {
    setCookie("inprec_font_size", fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    setCookie("inprec_high_contrast", highContrast.toString());
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 10, 150));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 10, 80));
  const resetFontSize = () => setFontSize(100);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  return (
    <AccessibilityContext.Provider value={{ fontSize, highContrast, increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
