import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import GestionSidebarNav from "../components/GestionSidebarNav";
import { useAuth } from "../context/auth-context";
import logofit from "../icons/logofit.png";

export default function GestionLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [menuMobileOpen, setMenuMobileOpen] = useState(false);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    await logout();
    navigate("/SignIn", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080b08] text-white">
      <div className="min-h-screen md:grid md:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-[#0d110d] md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
          <div className="flex w-full items-center justify-between gap-4 px-5 py-4 md:block md:px-6 md:py-7">
            <img
              src={logofit}
              alt="FitnessClubEvolution"
              className="w-36 object-contain md:w-44"
            />

            <div className="hidden items-center gap-3 md:mt-8 md:flex md:border-y md:border-white/10 md:py-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime-400 font-bold text-black">
                {usuario?.nombreUsuario.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {usuario?.nombreCompleto || "Administrador"}
                </p>
                <p className="text-xs text-gray-400">
                  {usuario?.rol || "Administrador"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMenuMobileOpen((isOpen) => !isOpen)}
                aria-label={menuMobileOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuMobileOpen}
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition hover:border-lime-400/40 hover:text-lime-300"
              >
                <i
                  className={`${menuMobileOpen ? "ri-close-line" : "ri-menu-line"} text-xl`}
                />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={cerrandoSesion}
                aria-label="Cerrar sesión"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition hover:border-red-400/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className="ri-logout-box-r-line text-xl" />
              </button>
            </div>
          </div>

          <nav
            className={`${menuMobileOpen ? "block" : "hidden"} border-t border-white/10 px-4 py-4 md:block md:flex-1 md:overflow-y-auto md:border-t-0 md:py-0`}
          >
            <GestionSidebarNav
              onNavigate={() => setMenuMobileOpen(false)}
            />
          </nav>

          <div className="mt-auto hidden p-4 md:block">
            <button
              type="button"
              onClick={handleLogout}
              disabled={cerrandoSesion}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="ri-logout-box-r-line text-lg" />
              {cerrandoSesion ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-lime-400/[0.06] blur-3xl" />
          <div className="relative mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
