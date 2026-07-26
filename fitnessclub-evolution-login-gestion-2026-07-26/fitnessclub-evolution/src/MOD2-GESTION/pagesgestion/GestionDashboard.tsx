import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import logofit from "../icons/logofit.png";

export default function GestionDashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    await logout();
    navigate("/SignIn", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080b08] text-white">
      <div className="min-h-screen md:grid md:grid-cols-[280px_1fr]">
        <aside className="flex border-b border-white/10 bg-[#0d110d] md:min-h-screen md:flex-col md:border-b-0 md:border-r">
          <div className="flex w-full items-center justify-between gap-4 px-5 py-4 md:block md:px-6 md:py-7">
            <img
              src={logofit}
              alt="FitnessClubEvolution"
              className="w-36 object-contain md:w-44"
            />

            <div className="flex items-center gap-3 md:mt-8 md:border-y md:border-white/10 md:py-5">
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
          </div>

          <nav className="hidden px-4 md:block">
            <div className="flex items-center gap-3 rounded-xl bg-lime-400 px-4 py-3 font-semibold text-black">
              <i className="ri-dashboard-line text-xl" />
              Dashboard
            </div>
          </nav>

          <div className="ml-auto flex items-center pr-4 md:mt-auto md:ml-0 md:p-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={cerrandoSesion}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="ri-logout-box-r-line text-lg" />
              <span className="hidden md:inline">
                {cerrandoSesion ? "Cerrando..." : "Cerrar sesión"}
              </span>
            </button>
          </div>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-lime-400/[0.06] blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-9">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
                Módulo de gestión
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-gray-400">
                Bienvenido, {usuario?.nombreUsuario}. Desde este panel podrás
                administrar próximamente la información del gimnasio.
              </p>
            </div>

            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-9">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
                  <i className="ri-shield-check-line text-3xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Sesión iniciada correctamente
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    La conexión entre el formulario, la API y PostgreSQL está
                    activa. Esta pantalla queda preparada como punto de partida
                    para incorporar las próximas funciones de gestión.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
