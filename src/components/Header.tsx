import { useState } from "react";
import { navigation, siteData } from "../data/siteData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed z-50 flex w-full items-center justify-center border-b border-border bg-background/95 backdrop-blur-sm">
  <nav className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between py-4">
      <div className="flex shrink-0 items-center">
        <a
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-primary"
        >
          {siteData.name}
        </a>
      </div>

      <div className="hidden items-center justify-center gap-8 md:flex">
        {navigation.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="py-2 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {item.name}
          </a>
        ))}

        <a
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#86c312]"
        >
          Unirme ahora
          <i className="ri-arrow-right-line" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="flex items-center justify-center p-2 text-foreground md:hidden"
        aria-label="Abrir o cerrar menú"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? (
          <i className="ri-close-line text-2xl" />
        ) : (
          <i className="ri-menu-line text-2xl" />
        )}
      </button>
    </div>

    <div
      className={`space-y-2 pb-6 pt-2 md:hidden ${
        isMenuOpen ? "block" : "hidden"
      }`}
    >
      {navigation.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={() => setIsMenuOpen(false)}
          className="block rounded-lg px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-card hover:text-primary"
        >
          {item.name}
        </a>
      ))}

      <a
        href="/contact"
        onClick={() => setIsMenuOpen(false)}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:bg-[#86c312] hover:shadow-lg"
      >
        Unite
        <i className="ri-arrow-right-line" />
      </a>
    </div>
  </nav>
</header>
  );
}
