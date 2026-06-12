import { useState } from "react";
import { Link } from "react-router-dom";
import { navigation } from "../data/siteData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-center border-b border-primary/30 bg-background/90 backdrop-blur-xl shadow-lg shadow-primary/10">
      <nav className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-12 py-4">
          <div className="flex shrink-0 items-center">
            <Link to="/" className="group font-heading tracking-tight">
              <span className="text-2xl md:text-3xl font-black uppercase leading-none drop-shadow-[0_0_14px_rgba(159,220,26,0.55)]">
                <span className="text-foreground">FitnessClub</span>
                <span className="text-primary">Evolution</span>
              </span>

              <span className="mt-1 block h-0.5 w-0 rounded-full bg-primary shadow-[0_0_12px_rgba(159,220,26,0.8)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          <div className="ml-10 hidden items-center justify-center gap-3 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group relative overflow-hidden rounded-xl border border-primary/10 bg-primary/5 px-4 py-2 text-base font-bold text-foreground shadow-sm shadow-primary/5 transition-all duration-300 hover:border-primary/40 hover:bg-primary/15 hover:text-primary hover:shadow-md hover:shadow-primary/20"
              >
                <span className="relative z-10">{item.name}</span>

                <span className="absolute inset-x-3 bottom-1 h-0.5 scale-x-0 rounded-full bg-primary shadow-[0_0_10px_rgba(159,220,26,0.9)] transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            ))}

            <Link
              to="/contact"
              className="ml-3 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 hover:bg-[#b8ef45] hover:shadow-primary/50"
            >
              Unirme ahora
              <i className="ri-arrow-right-line text-lg" />
            </Link>

            <div className="ml-3 h-8 w-px bg-primary/25"></div>

            <Link
              to="/SignIn"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-background px-5 py-3 font-bold text-primary shadow-md shadow-primary/10 transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:shadow-primary/30"
            >
              Iniciar sesión
              <i className="ri-login-box-line text-lg" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground md:hidden"
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

        <div className={`pb-6 pt-2 md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="rounded-2xl border border-primary/20 bg-card p-3 shadow-xl shadow-primary/10">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative block overflow-hidden rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 font-bold text-foreground transition-all hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
                >
                  {item.name}
                  <span className="absolute inset-x-4 bottom-1 h-0.5 scale-x-0 rounded-full bg-primary shadow-[0_0_10px_rgba(159,220,26,0.9)] transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
              ))}

              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-center font-black text-primary-foreground shadow-md shadow-primary/30 transition-all duration-200 hover:bg-[#b8ef45] hover:shadow-lg"
              >
                Unite
                <i className="ri-arrow-right-line" />
              </Link>

              <div className="my-3 h-px bg-primary/20"></div>

              <Link
                to="/SignIn"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-background px-6 py-3 text-center font-bold text-primary shadow-md shadow-primary/10 transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                Iniciar sesión
                <i className="ri-login-box-line" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}