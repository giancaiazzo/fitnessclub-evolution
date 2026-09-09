import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  apiFetch,
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";

type RutinaOpcion = {
  idRutina: number;
  nombre: string;
  tienePdf: boolean;
};

type FormularioCliente = {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  hikvisionEmployeeNo: string;
  idRutina: string;
  aceptaWhatsApp: boolean;
};

type ClienteCreado = {
  rutinaNombre: string;
};

const FORMULARIO_INICIAL: FormularioCliente = {
  nombre: "",
  apellido: "",
  documento: "",
  telefono: "",
  fechaNacimiento: "",
  direccion: "",
  hikvisionEmployeeNo: "",
  idRutina: "",
  aceptaWhatsApp: false,
};

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
  const [rutinas, setRutinas] = useState<RutinaOpcion[]>([]);
  const [cargandoRutinas, setCargandoRutinas] = useState(true);
  const [errorRutinas, setErrorRutinas] = useState("");
  const cargaInicial = useRef(false);
  const fechaMaxima = useMemo(() => fechaActualParaInput(), []);

  // Las opciones provienen del mismo CRUD de Rutinas; ya no hay valores fijos
  // en el frontend que puedan quedar desincronizados de PostgreSQL.
  const cargarRutinas = useCallback(async () => {
    try {
      setCargandoRutinas(true);
      setErrorRutinas("");
      const respuesta = await apiFetch("rutinas");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudieron cargar las rutinas."),
        );
      }

      setRutinas((await respuesta.json()) as RutinaOpcion[]);
    } catch (errorDesconocido) {
      setErrorRutinas(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudieron cargar las rutinas.",
        ),
      );
    } finally {
      setCargandoRutinas(false);
    }
  }, []);

  useEffect(() => {
    if (cargaInicial.current) return;
    cargaInicial.current = true;
    void cargarRutinas();
  }, [cargarRutinas]);

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

    const idRutina = Number(formulario.idRutina);
    if (!Number.isInteger(idRutina) || idRutina <= 0) {
      setError("Seleccioná una rutina registrada en el sistema.");
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
          hikvisionEmployeeNo: formulario.hikvisionEmployeeNo.trim() || null,
          idRutina,
          aceptaWhatsApp: formulario.aceptaWhatsApp,
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo registrar el cliente."),
        );
      }

      const cliente = (await respuesta.json()) as ClienteCreado;
      setFormulario(FORMULARIO_INICIAL);
      setExito(
        `Cliente registrado correctamente con la rutina ${cliente.rutinaNombre}.`,
      );
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
          La fecha de registro y el estado activo se asignan automáticamente. La rutina
          elegida queda vinculada al cliente en la base de datos.
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
            <Campo
              etiqueta="Código de acceso Hikvision"
              ayuda="Opcional. Es el employeeNo de la persona ya registrada con rostro o huella en el equipo."
            >
              <input
                className={inputClassName}
                value={formulario.hikvisionEmployeeNo}
                onChange={(event) =>
                  actualizar("hikvisionEmployeeNo", event.target.value.slice(0, 32))
                }
                maxLength={32}
                autoComplete="off"
                placeholder="Ej.: 02"
                disabled={guardando}
              />
            </Campo>
          </div>

          <div className="sm:col-span-2">
            <Campo
              etiqueta="Rutina asignada"
              requerido
              ayuda="Si el consentimiento está activo, la rutina se enviará automáticamente al guardar el cliente."
            >
              <select
                className={inputClassName}
                value={formulario.idRutina}
                onChange={(event) => actualizar("idRutina", event.target.value)}
                disabled={guardando || cargandoRutinas || rutinas.length === 0}
                required
              >
                <option value="">
                  {cargandoRutinas ? "Cargando rutinas..." : "Seleccioná una rutina"}
                </option>
                {rutinas.map((rutina) => (
                  <option key={rutina.idRutina} value={rutina.idRutina}>
                    {rutina.nombre}{rutina.tienePdf ? "" : " (sin PDF)"}
                  </option>
                ))}
              </select>
              {errorRutinas && (
                <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-red-300">
                  {errorRutinas}
                  <button
                    type="button"
                    onClick={() => void cargarRutinas()}
                    className="font-bold text-lime-400 underline underline-offset-2"
                  >
                    Reintentar
                  </button>
                </span>
              )}
              {!cargandoRutinas && !errorRutinas && rutinas.length === 0 && (
                <span className="mt-2 block text-xs text-amber-300">
                  Primero ingresá al menos una rutina desde Gestión de rutinas.
                </span>
              )}
            </Campo>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] p-4 sm:col-span-2">
            <input
              type="checkbox"
              checked={formulario.aceptaWhatsApp}
              onChange={(event) => actualizar("aceptaWhatsApp", event.target.checked)}
              disabled={guardando}
              className="mt-1 h-5 w-5 shrink-0 accent-lime-400"
            />
            <span>
              <span className="block text-sm font-bold text-white">
                Consentimiento para comunicaciones por WhatsApp
              </span>
              <span className="mt-1 block text-sm leading-6 text-gray-300">
                Acepto recibir por WhatsApp mi rutina, avisos de vencimiento y
                comunicaciones operativas de FitnessClubEvolution. Puedo solicitar la
                baja respondiendo SALIR.
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Marcá esta opción únicamente si el cliente brindó su autorización.
              </span>
            </span>
          </label>
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
            disabled={guardando || cargandoRutinas || rutinas.length === 0}
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
