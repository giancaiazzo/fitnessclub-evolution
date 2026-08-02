import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../MOD1-CLIENTES/components/Header";
import Footer from "../MOD1-CLIENTES/components/Footer.tsx";
import { siteData } from "../MOD1-CLIENTES/data/siteData.ts";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({
  children,
  title = siteData.name,
  description = siteData.description,
}: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [title, description]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <button
        type="button"
        onClick={() => document.getElementById("main-content")?.focus()}
        className="fixed left-4 top-3 z-[60] -translate-y-24 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground transition focus:translate-y-0"
      >
        Ir al contenido
      </button>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
