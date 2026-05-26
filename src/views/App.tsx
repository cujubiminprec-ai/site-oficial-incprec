import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { NotificacoesProvider } from "@/contexts/NotificacoesContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AnalyticsTracker from "@/components/feature/AnalyticsTracker";

declare const __BASE_PATH__: string;

export default function App() {
  return (
    <SiteConfigProvider>
      <AccessibilityProvider>
        <AdminAuthProvider>
          <NotificacoesProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <AnalyticsTracker />
              <AppRoutes />
            </BrowserRouter>
          </NotificacoesProvider>
        </AdminAuthProvider>
      </AccessibilityProvider>
    </SiteConfigProvider>
  );
}
