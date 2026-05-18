import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { NotificacoesProvider } from "@/contexts/NotificacoesContext";

import { AccessibilityProvider } from "@/contexts/AccessibilityContext";

declare const __BASE_PATH__: string;

const titlesToRemove = [
  "Balancete de Receitas e Despesas — Dezembro/2024",
  "Balancete de Receitas e Despesas — Novembro/2024",
  "Balancete de Receitas e Despesas — Outubro/2024",
  "Relatório de Investimentos Completo — 2022",
  "Relatório de Investimentos Consolidado — 2022",
  "Política de Investimentos 2024"
];

export default function App() {
  useEffect(() => {
    try {
      const storedFinancas = localStorage.getItem("inprec_financas_docs");
      if (storedFinancas) {
        let docs = JSON.parse(storedFinancas);
        const originalLength = docs.length;
        docs = docs.filter((d: any) => !titlesToRemove.includes(d.titulo));
        if (docs.length !== originalLength) {
          localStorage.setItem("inprec_financas_docs", JSON.stringify(docs));
        }
      }
    } catch (e) {
      console.error("Erro ao limpar mocks do localStorage", e);
    }
  }, []);

  return (
    <SiteConfigProvider>
      <AccessibilityProvider>
        <AdminAuthProvider>
          <NotificacoesProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <AppRoutes />
            </BrowserRouter>
          </NotificacoesProvider>
        </AdminAuthProvider>
      </AccessibilityProvider>
    </SiteConfigProvider>
  );
}
