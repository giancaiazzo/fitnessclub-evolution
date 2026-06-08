import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer.tsx";
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

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [title, description]);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
  <Header />

  <main>{children}</main>

  <Footer />
</div>
  );
}