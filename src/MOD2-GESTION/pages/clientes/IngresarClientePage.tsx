import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  apiFetch,
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";

type RutinaCodigo =
  | ""
  | "adaptacion-hombre"
  | "adaptacion-mujer"
  | "rutina-hombre"
  | "rutina-mujer";

type FormularioCliente = {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  rutinaSeleccionada: RutinaCodigo;
};

type ClienteCreado = { idCliente: number };

const FORMULARIO_INICIAL: FormularioCliente = {
  nombre: "",
  apellido: "",
  documento: "",
  telefono: "",
  fechaNacimiento: "",
  direccion: "",
  rutinaSeleccionada: "",
};

const RUTINAS: ReadonlyArray<{ value: Exclude<RutinaCodigo, "">; label: string }> = [
  { value: "adaptacion-hombre", label: "Adaptación hombre" },
  { value: "adaptacion-mujer", label: "Adaptación mujer" },
  { value: "rutina-hombre", label: "Rutina hombre" },
  { value: "rutina-mujer", label: "Rutina mujer" },
];

const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:cursor-not-allowed disabled:opacity-60";

function soloDigitos(valor: string, maximo: number) {
  return valor.replace(/\D/g, "").slice(0, maximo);
}

function fechaActualParaInput() {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function IngresarClientePage() {
  const [formulario, setFormulario] = useState<FormularioCliente>(FORMULARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const fechaMaxima = useMemo(() => fechaActualParaInput(), []);

  function actualizar<K extends keyof FormularioCliente>(
    campo: K,
    valor: FormularioCliente[K],
  ) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function registrarCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setExito("");

    if (!/^\d{6,12}$/.test(formulario.documento)) {
      setError("El documento debe tener entre 6 y 12 números, sin puntos ni guiones.");
      return;
    }

    if (!/^\d{8}$/.test(formulario.telefono)) {
      setError("Ingresá los 8 números del teléfono después de +598.");
      return;
    }

    if (!formulario.rutinaSeleccionada) {
      setError("Seleccioná la rutina que se enviará al cliente.");
      return;
    }

    try {
      setGuardando(true);
      const respuesta = await apiFetch("clientes", {
        method: "POST",
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          documento: formulario.documento,
          telefono: `598${formulario.telefono}`,
          fechaNacimiento: formulario.fechaNacimiento || null,
          direccion: formulario.direccion.trim() || null,
          rutinaSeleccionada: formulario.rutinaSeleccionada,
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo registrar el cliente."),
        );
      }

      const cliente = (await respuesta.json()) as ClienteCreado;
      setFormulario(FORMULARIO_INICIAL);
      setExito(`Cliente registrado correctamente con el ID #${cliente.idCliente}.`);
    } catch (errorDesconocido) {
      setError(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo registrar el cliente."),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          Gestión de clientes
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ingresar cliente</h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          El ID, la fecha de registro y el estado activo se asignan automáticamente.
        </p>
      </header>

      {exito && (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-200"
        >
          <i className="ri-checkbox-circle-line text-xl text-lime-400" />
          {exito}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200"
        >
          <i className="ri-error-warning-line text-xl text-red-400" />
          {error}
        </div>
      )}

      <form
        onSubmit={registrarCliente}
        className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20"
      >
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
          <Campo etiqueta="Nombre" requerido>
            <input
              className={inputClassName}
              value={formulario.nombre}
              onChange={(event) => actualizar("nombre", event.target.value)}
              minLength={2}
              maxLength={60}
              autoComplete="given-name"
              placeholder="Ej.: Gian"
              disabled={guardando}
              required
            />
          </Campo>

          <Campo etiqueta="Apellido" requerido>
            <input
              className={inputClassName}
              value={formulario.apellido}
              onChange={(event) => actualizar("apellido", event.target.value)}
              minLength={2}
              maxLength={60}
              autoComplete="family-name"
              placeholder="Ej.: Caiazzo"
              disabled={guardando}
              required
            />
          </Campo>

          <Campo etiqueta="Documento" requerido ayuda="Solamente números, sin puntos ni guiones.">
            <input
              className={inputClassName}
              value={formulario.documento}
              onChange={(event) => actualizar("documento", soloDigitos(event.target.value, 12))}
              inputMode="numeric"
              minLength={6}
              maxLength={12}
              placeholder="Ej.: 51234567"
              disabled={guardando}
              required
            />
          </Campo>

          <Campo etiqueta="Teléfono" requerido ayuda="Se guardará con el código de Uruguay.">
            <div className="flex rounded-xl border border-white/10 bg-black/25 focus-within:border-lime-400/70 focus-within:ring-2 focus-within:ring-lime-400/15">
              <span className="flex h-12 items-center border-r border-white/10 px-4 text-sm font-bold text-lime-400">
                +598
              </span>
              <input
                className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-gray-600"
                value={formulario.telefono}
                onChange={(event) => actualizar("telefono", soloDigitos(event.target.value, 8))}
                inputMode="numeric"
                autoComplete="tel-national"
                minLength={8}
                maxLength={8}
                placeholder="99123456"
                disabled={guardando}
                required
              />
            </div>
          </Campo>

          <Campo etiqueta="Fecha de nacimiento" ayuda="Opcional">
            <input
              type="date"
              className={inputClassName}
              value={formulario.fechaNacimiento}
              onChange={(event) => actualizar("fechaNacimiento", event.target.value)}
              max={fechaMaxima}
              disabled={guardando}
            />
          </Campo>

          <Campo etiqueta="Dirección" ayuda="Opcional">
            <input
              className={inputClassName}
              value={formulario.direccion}
              onChange={(event) => actualizar("direccion", event.target.value)}
              maxLength={150}
              autoComplete="street-address"
              placeholder="Ej.: Uruguay 1234"
              disabled={guardando}
            />
          </Campo>

          <div className="sm:col-span-2">
            <Campo etiqueta="Rutina para enviar" requerido ayuda="El PDF se enviará cuando se conecte WhatsApp.">
              <select
                className={inputClassName}
                value={formulario.rutinaSeleccionada}
                onChange={(event) =>
                  actualizar("rutinaSeleccionada", event.target.value as RutinaCodigo)
                }
                disabled={guardando}
                required
              >
                <option value="">Seleccioná una rutina</option>
                {RUTINAS.map((rutina) => (
                  <option key={rutina.value} value={rutina.value}>
                    {rutina.label}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={() => {
              setFormulario(FORMULARIO_INICIAL);
              setError("");
              setExito("");
            }}
            disabled={guardando}
            className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? (
              <><span className="size-4 animate-spin rounded-full border-2 border-black/25 border-t-black" /> Guardando...</>
            ) : (
              <><i className="ri-user-add-line text-lg" /> Registrar cliente</>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Campo({
  etiqueta,
  ayuda,
  requerido = false,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  requerido?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-200">
        {etiqueta} {requerido && <span className="text-lime-400">*</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1.5 block text-xs text-gray-500">{ayuda}</span>}
    </label>
  );
}
