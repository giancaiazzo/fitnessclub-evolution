import { useAuth } from "../../context/auth-context";

export default function GestionDashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <div className="mb-9">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          Panel de administración
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Bienvenido, {usuario?.nombreUsuario}. Desde el menú de la izquierda
          podés ingresar y consultar la información del gimnasio.
        </p>
      </div>

      <section className="flex min-h-72 items-center rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-10">
        <div className="max-w-xl">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
            <i className="ri-home-gear-line text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Todo el gimnasio en un solo lugar
          </h2>
          <p className="mt-3 leading-7 text-gray-400">
            Elegí una opción del menú para trabajar con clientes, ejercicios,
            rutinas, servicios o pagos.
          </p>
        </div>
      </section>
    </div>
  );
}
