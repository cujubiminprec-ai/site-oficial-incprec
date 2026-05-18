import { useState, useEffect } from "react";
import { BlocoConteudo, PaginaConteudo, paginasConteudoDefault } from "@/mocks/paginas-conteudo";

const STORAGE_KEY = "inprec_paginas_conteudo";

function loadAllConteudo(): PaginaConteudo[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : paginasConteudoDefault;
  } catch {
    return paginasConteudoDefault;
  }
}

export function usePageContent(pageId: string): BlocoConteudo[] {
  const [blocos, setBlocos] = useState<BlocoConteudo[]>(() => {
    const all = loadAllConteudo();
    return all.find(p => p.pageId === pageId)?.blocos ?? [];
  });

  useEffect(() => {
    const handle = () => {
      const all = loadAllConteudo();
      setBlocos(all.find(p => p.pageId === pageId)?.blocos ?? []);
    };
    window.addEventListener("storage", handle);
    // Também escuta mudanças locais (mesma aba)
    const interval = setInterval(handle, 1500);
    return () => {
      window.removeEventListener("storage", handle);
      clearInterval(interval);
    };
  }, [pageId]);

  return blocos;
}
