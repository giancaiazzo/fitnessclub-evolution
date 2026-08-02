import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navigation } from "../data/siteData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = navigation.filter(
    (item) => item.href !== "/contact" && item.href !== "/SignIn"
  );

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/25 bg-background/95 shadow-lg shadow-black/20 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="group min-w-0 shrink-0 font-heading tracking-tight"
          aria-label="Ir al inicio de FitnessClubEvolution"
        >
          <span className="block truncate text-lg font-black uppercase leading-none drop-shadow-[0_0_14px_rgba(159,220,26,0.45)] sm:text-xl 2xl:text-2xl">
            <span className="text-foreground">FitnessClub</span>
            <span className="text-primary">Evolution</span>
          </span>
          <span className="mt-1.5 block h-0.5 w-12 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-1.5 min-[1420px]:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg border px-2.5 py-2 text-center text-sm font-bold transition-all 2xl:px-3 ${
                  isActive
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-transparent text-foreground/85 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <Link
            to="/contact"
            className="ml-1 inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-center text-sm font-black text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-[#b8ef45]"
          >
            Unirme ahora
            <i className="ri-arrow-right-line" aria-hidden="true" />
          </Link>

          <span className="mx-0.5 h-7 w-px bg-primary/25" aria-hidden="true" />

          <Link
            to="/SignIn"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-primary/40 px-3 py-2 text-center text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            Iniciar sesión
            <i className="ri-login-box-line" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground min-[1420px]:hidden"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <i
            className={`${isMenuOpen ? "ri-close-line" : "ri-menu-line"} text-2xl`}
            aria-hidden="true"
          />
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border bg-background/98 shadow-2xl backdrop-blur-xl min-[1420px]:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto max-w-3xl space-y-2 px-4 py-4 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 font-bold transition ${
                  isActive
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                }`
              }
            >
              <span>{item.name}</span>
              <i className="ri-arrow-right-s-line text-xl" aria-hidden="true" />
            </NavLink>
          ))}

          <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-center font-black text-primary-foreground"
            >
              Unirme ahora
              <i className="ri-arrow-right-line" aria-hidden="true" />
            </Link>

            <Link
              to="/SignIn"
              onClick={() => setIsMenuOpen(false)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card px-5 py-3 text-center font-bold text-primary"
            >
              Iniciar sesión
              <i className="ri-login-box-line" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
