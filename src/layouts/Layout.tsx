import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { siteData } from "../data/siteData";

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
  useEffect(() => {
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [title, description]);

  return (
    <div className="min-h-screen bg-slate-900 text-white antialiased">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
