import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppRoutes } from "./router";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { NotificacoesProvider } from "@/contexts/NotificacoesContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AnalyticsTracker from "@/components/feature/AnalyticsTracker";

declare const __BASE_PATH__: string;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <SiteConfigProvider>
      <AccessibilityProvider>
        <AdminAuthProvider>
          <NotificacoesProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <ScrollToTop />
              <AnalyticsTracker />
              <AppRoutes />
            </BrowserRouter>
          </NotificacoesProvider>
        </AdminAuthProvider>
      </AccessibilityProvider>
    </SiteConfigProvider>
  );
}
