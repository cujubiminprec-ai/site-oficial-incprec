import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyticsService } from "@/services/analytics.service";

function getPageName(): string {
  if (typeof document === "undefined") return "";
  return document.title?.trim() || "Página sem título";
}

function isPublicPath(pathname: string): boolean {
  return !pathname.startsWith("/admin");
}

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!isPublicPath(location.pathname)) return;
    void analyticsService.track({
      tipo: "page_view",
      path: `${location.pathname}${location.search || ""}`,
      pageName: getPageName(),
      referrer: typeof document !== "undefined" ? document.referrer : "",
    }).catch(() => undefined);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickable = target.closest("a, button");
      if (!(clickable instanceof HTMLElement)) return;
      if (!isPublicPath(window.location.pathname)) return;

      const elementLabel =
        clickable.getAttribute("aria-label") ||
        clickable.textContent?.trim() ||
        clickable.getAttribute("title") ||
        undefined;

      const elementHref = clickable instanceof HTMLAnchorElement ? clickable.href : undefined;

      void analyticsService.track({
        tipo: "click",
        path: `${window.location.pathname}${window.location.search || ""}`,
        pageName: getPageName(),
        referrer: typeof document !== "undefined" ? document.referrer : "",
        elementLabel,
        elementHref,
      }).catch(() => undefined);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
