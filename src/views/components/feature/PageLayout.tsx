import { ReactNode } from "react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import FloatingButtons from "@/components/feature/FloatingButtons";
import AccessibilityToolbar from "@/components/feature/AccessibilityToolbar";
import BannerAviso from "@/components/feature/BannerAviso";
import Breadcrumb from "@/components/feature/Breadcrumb";
import VLibrasWidget from "@/components/feature/VLibrasWidget";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      <AccessibilityToolbar />
      <BannerAviso />
      <Navbar />
      <Breadcrumb />
      <main id="conteudo-principal">{children}</main>
      <Footer />
      <FloatingButtons />
      <VLibrasWidget />
    </div>
  );
}
