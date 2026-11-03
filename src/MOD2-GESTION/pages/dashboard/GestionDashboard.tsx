import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/auth-context";
import {
  apiFetch,
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";

type ClienteResumen = {
  clienteActivo: boolean;
  pagaEstaSemana: boolean;
};

type Indicadores = {
  activos: number;
  total: number;
  porVencer: number;
};

const INDICADORES_INICIALES: Indicadores = {
  activos: 0,
  total: 0,
  porVencer: 0,
};

export default function GestionDashboard() {
  const { usuario } = useAuth();
  const [indicadores, setIndicadores] = useState(INDICADORES_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const cargaInicial = useRef(false);

  const cargarIndicadores = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      const respuesta = await apiFetch("clientes/estado-pagos");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(
            respuesta,
            "No se pudo cargar el resumen de clientes.",
          ),
        );
      }

      const clientes = (await respuesta.json()) as ClienteResumen[];
      setIndicadores({
        activos: clientes.filter((cliente) => cliente.clienteActivo).length,
        total: clientes.length,
        porVencer: clientes.filter(
          (cliente) => cliente.clienteActivo && cliente.pagaEstaSemana,
        ).length,
      });
    } catch (errorDesconocido) {
      setError(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo cargar el resumen de clientes.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (cargaInicial.current) return;
    cargaInicial.current = true;
    void cargarIndicadores();
  }, [cargarIndicadores]);

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

      <section aria-live="polite">
        <div className="grid gap-4 sm:grid-cols-3">
          <Indicador
            etiqueta="Clientes activos"
            valor={cargando ? "—" : indicadores.activos}
            icono="ri-user-follow-line"
            tono="verde"
          />
          <Indicador
            etiqueta="Clientes totales"
            valor={cargando ? "—" : indicadores.total}
            icono="ri-group-line"
            tono="neutral"
          />
          <Indicador
            etiqueta="Clientes por vencer"
            valor={cargando ? "—" : indicadores.porVencer}
            icono="ri-alarm-warning-line"
            tono="rojo"
          />
        </div>

        {error && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void cargarIndicadores()}
              className="shrink-0 rounded-xl border border-red-300/25 px-3 py-2 text-xs font-bold transition hover:bg-red-300/10"
            >
              Reintentar
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Indicador({
  etiqueta,
  valor,
  icono,
  tono,
}: {
  etiqueta: string;
  valor: number | string;
  icono: string;
  tono: "verde" | "neutral" | "rojo";
}) {
  const estilos = {
    verde: {
      tarjeta: "border-lime-400/25 bg-lime-400/[0.07]",
      icono: "bg-lime-400/15 text-lime-400",
      valor: "text-lime-400",
    },
    neutral: {
      tarjeta: "border-white/10 bg-white/[0.035]",
      icono: "bg-white/[0.07] text-gray-300",
      valor: "text-white",
    },
    rojo: {
      tarjeta: "border-red-400/25 bg-red-400/[0.07]",
      icono: "bg-red-400/15 text-red-300",
      valor: "text-red-300",
    },
  }[tono];

  return (
    <article
      className={`flex min-h-40 items-center justify-between gap-4 rounded-3xl border p-5 shadow-2xl shadow-black/20 sm:p-6 ${estilos.tarjeta}`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
          {etiqueta}
        </p>
        <p className={`mt-3 text-4xl font-black ${estilos.valor}`}>{valor}</p>
      </div>
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${estilos.icono}`}
      >
        <i className={`${icono} text-3xl`} />
      </div>
    </article>
  );
}
