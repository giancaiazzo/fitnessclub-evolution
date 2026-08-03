import {
  useCallback,
  useEffect,
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

type Cliente = {
  idCliente: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  estado: boolean;
};

type EstadoPagoCliente = {
  idCliente: number;
  nombre: string;
  apellido: string;
  documento: string;
  clienteActivo: boolean;
  ultimaFechaPago: string | null;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  diasRestantes: number | null;
  diasVencido: number;
  estadoCuota: "Sin pagos" | "Vencida" | "Vence hoy" | "Por vencer" | "Vigente";
  servicio: string | null;
};

type Servicio = {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: string | null;
};

type Entrenador = {
  idEntrenador: number;
  nombre: string;
  apellido: string;
};

type Pago = {
  idCuota: number;
  idCliente: number;
  cliente: string;
  idServicio: number;
  servicio: string;
  idEntrenador: number | null;
  entrenador: string | null;
  fechaPago: string;
  fechaInicio: string;
  fechaVencimiento: string;
  monto: number;
  metodoPago: string;
  estadoPago: string;
  observaciones: string | null;
};

type RegistrarPagoResponse = {
  message: string;
  pago: Pago;
  estadoCliente: EstadoPagoCliente;
};

type FormularioPago = {
  idServicio: string;
  idEntrenador: string;
  monto: string;
  metodoPago: string;
  observaciones: string;
};

const FORMULARIO_INICIAL: FormularioPago = {
  idServicio: "",
  idEntrenador: "",
  monto: "",
  metodoPago: "Efectivo",
  observaciones: "",
};

const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:cursor-not-allowed disabled:opacity-50";

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin registrar";
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha;
}

function formatearFechaHora(fecha: string | null) {
  if (!fecha) return "Sin registrar";
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? formatearFecha(fecha)
    : new Intl.DateTimeFormat("es-UY", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Montevideo",
      }).format(valor);
}

function formatearMonto(monto: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
  }).format(monto);
}

function formatearTelefono(telefono: string) {
  const digitos = telefono.replace(/\D/g, "");
  const local = digitos.startsWith("598") ? digitos.slice(3) : digitos;
  return local.length === 8
    ? `+598 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
    : telefono;
}

export default function RegistrarPagoPage() {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [estadoPago, setEstadoPago] = useState<EstadoPagoCliente | null>(null);
  const [historial, setHistorial] = useState<Pago[]>([]);
  const [cargandoCliente, setCargandoCliente] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [errorCatalogos, setErrorCatalogos] = useState("");
  const [formulario, setFormulario] = useState<FormularioPago>(FORMULARIO_INICIAL);
  const [registrando, setRegistrando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const secuenciaBusqueda = useRef(0);
  const catalogosCargados = useRef(false);

  useEffect(() => {
    if (catalogosCargados.current) return;
    catalogosCargados.current = true;

    async function cargarCatalogos() {
      try {
        const [respuestaServicios, respuestaEntrenadores] = await Promise.all([
          apiFetch("servicios"),
          apiFetch("entrenadores"),
        ]);

        if (!respuestaServicios.ok) {
          throw new Error(
            await mensajeErrorHttp(respuestaServicios, "No se pudieron cargar los servicios."),
          );
        }
        if (!respuestaEntrenadores.ok) {
          throw new Error(
            await mensajeErrorHttp(
              respuestaEntrenadores,
              "No se pudieron cargar los entrenadores.",
            ),
          );
        }

        const serviciosCargados = (await respuestaServicios.json()) as Servicio[];
        setServicios(serviciosCargados);
        setEntrenadores((await respuestaEntrenadores.json()) as Entrenador[]);

        if (serviciosCargados.length === 1) {
          setFormulario((actual) => ({
            ...actual,
            idServicio: serviciosCargados[0].idServicio.toString(),
            monto: serviciosCargados[0].precio > 0
              ? serviciosCargados[0].precio.toString()
              : "",
          }));
        }
      } catch (errorDesconocido) {
        setErrorCatalogos(
          mensajeErrorDesconocido(errorDesconocido, "No se cargaron los datos del pago."),
        );
      }
    }

    void cargarCatalogos();
  }, []);

  useEffect(() => {
    const termino = consulta.trim();
    const nombreSeleccionado = cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
    const secuenciaActual = ++secuenciaBusqueda.current;

    if (cliente && termino === nombreSeleccionado) {
      return;
    }

    if (termino.length < 2) {
      return;
    }

    const temporizador = window.setTimeout(async () => {
      try {
        setBuscando(true);
        setErrorBusqueda("");
        const respuesta = await apiFetch(
          `clientes/buscar?texto=${encodeURIComponent(termino)}`,
        );
        if (!respuesta.ok) {
          throw new Error(
            await mensajeErrorHttp(respuesta, "No se pudo realizar la búsqueda."),
          );
        }
        const clientes = (await respuesta.json()) as Cliente[];
        if (secuenciaActual === secuenciaBusqueda.current) {
          setResultados(clientes);
        }
      } catch (errorDesconocido) {
        if (secuenciaActual === secuenciaBusqueda.current) {
          setErrorBusqueda(
            mensajeErrorDesconocido(errorDesconocido, "No se pudo realizar la búsqueda."),
          );
        }
      } finally {
        if (secuenciaActual === secuenciaBusqueda.current) {
          setBuscando(false);
        }
      }
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, [cliente, consulta]);

  const cargarCliente = useCallback(async (seleccionado: Cliente) => {
    try {
      setCargandoCliente(true);
      setErrorRegistro("");
      setMensajeExito("");
      const [respuestaEstado, respuestaHistorial] = await Promise.all([
        apiFetch(`clientes/${seleccionado.idCliente}/estado-pago`),
        apiFetch(`pagos/cliente/${seleccionado.idCliente}`),
      ]);

      if (!respuestaEstado.ok) {
        throw new Error(
          await mensajeErrorHttp(respuestaEstado, "No se pudo consultar el vencimiento."),
        );
      }
      if (!respuestaHistorial.ok) {
        throw new Error(
          await mensajeErrorHttp(respuestaHistorial, "No se pudo consultar el historial."),
        );
      }

      setEstadoPago((await respuestaEstado.json()) as EstadoPagoCliente);
      setHistorial((await respuestaHistorial.json()) as Pago[]);
    } catch (errorDesconocido) {
      setErrorRegistro(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo consultar al cliente."),
      );
    } finally {
      setCargandoCliente(false);
    }
  }, []);

  function seleccionarCliente(seleccionado: Cliente) {
    setCliente(seleccionado);
    setConsulta(`${seleccionado.nombre} ${seleccionado.apellido}`);
    setResultados([]);
    setBuscando(false);
    setEstadoPago(null);
    setHistorial([]);
    void cargarCliente(seleccionado);
  }

  function cambiarConsulta(valor: string) {
    setConsulta(valor);
    if (valor.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      setErrorBusqueda("");
    }
    if (cliente) {
      setCliente(null);
      setEstadoPago(null);
      setHistorial([]);
      setErrorRegistro("");
      setMensajeExito("");
    }
  }

  function seleccionarServicio(idServicio: string) {
    const servicio = servicios.find(
      (opcion) => opcion.idServicio === Number(idServicio),
    );
    setFormulario((actual) => ({
      ...actual,
      idServicio,
      monto: servicio && servicio.precio > 0 ? servicio.precio.toString() : actual.monto,
    }));
  }

  async function registrarPago(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cliente) return;
    setErrorRegistro("");
    setMensajeExito("");

    const monto = Number(formulario.monto.replace(",", "."));
    if (!formulario.idServicio) {
      setErrorRegistro("Seleccioná el servicio o plan abonado.");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      setErrorRegistro("Ingresá un monto mayor a cero.");
      return;
    }

    try {
      setRegistrando(true);
      const respuesta = await apiFetch("pagos", {
        method: "POST",
        body: JSON.stringify({
          idCliente: cliente.idCliente,
          idServicio: Number(formulario.idServicio),
          idEntrenador: formulario.idEntrenador
            ? Number(formulario.idEntrenador)
            : null,
          monto,
          metodoPago: formulario.metodoPago,
          observaciones: formulario.observaciones.trim() || null,
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo registrar el pago."),
        );
      }

      const resultado = (await respuesta.json()) as RegistrarPagoResponse;
      setEstadoPago(resultado.estadoCliente);
      setHistorial((actual) => [resultado.pago, ...actual]);
      setFormulario((actual) => ({ ...actual, observaciones: "" }));
      setMensajeExito(
        `Pago registrado. El nuevo vencimiento es el ${formatearFecha(resultado.pago.fechaVencimiento)}.`,
      );
    } catch (errorDesconocido) {
      setErrorRegistro(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo registrar el pago."),
      );
    } finally {
      setRegistrando(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          Gestión de pagos
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Registrar pago</h1>
        <p className="mt-3 max-w-3xl text-gray-400">
          Buscá al cliente, revisá su vencimiento individual y registrá un nuevo mes sin perder los días que todavía tenga pagos.
        </p>
      </header>

      <section className="relative z-20 mb-6 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-7">
        <label className="block max-w-2xl">
          <span className="mb-2 block text-sm font-semibold text-gray-200">
            Buscar cliente por nombre, apellido o documento
          </span>
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500" />
            <input
              type="search"
              value={consulta}
              onChange={(event) => cambiarConsulta(event.target.value)}
              className={`${inputClassName} pl-12 pr-12`}
              placeholder="Ej.: Gian Caiazzo o 51234567"
              autoComplete="off"
            />
            {buscando && (
              <span className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin rounded-full border-2 border-lime-400/25 border-t-lime-400" />
            )}
          </div>
        </label>

        {errorBusqueda && <p className="mt-3 text-sm text-red-300">{errorBusqueda}</p>}

        {resultados.length > 0 && (
          <div className="absolute left-5 right-5 top-[calc(100%-1.25rem)] z-30 max-h-80 max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171b18] p-2 shadow-2xl sm:left-7 sm:right-auto sm:top-[calc(100%-1.75rem)] sm:w-[calc(100%-3.5rem)] sm:max-w-2xl">
            {resultados.map((resultado) => (
              <button
                key={resultado.idCliente}
                type="button"
                onClick={() => seleccionarCliente(resultado)}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition hover:bg-white/5"
              >
                <span>
                  <span className="block font-semibold text-white">
                    {resultado.nombre} {resultado.apellido}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    CI {resultado.documento} · {formatearTelefono(resultado.telefono)}
                  </span>
                </span>
                <span className={resultado.estado ? "text-xs font-bold text-lime-400" : "text-xs font-bold text-gray-500"}>
                  {resultado.estado ? "Activo" : "Inactivo"}
                </span>
              </button>
            ))}
          </div>
        )}

        {!buscando && consulta.trim().length >= 2 && resultados.length === 0 && !cliente && !errorBusqueda && (
          <p className="mt-3 text-sm text-gray-500">No se encontraron clientes con esos datos.</p>
        )}
      </section>

      {errorCatalogos && (
        <Alerta tipo="error">{errorCatalogos}</Alerta>
      )}
      {mensajeExito && <Alerta tipo="exito">{mensajeExito}</Alerta>}
      {errorRegistro && <Alerta tipo="error">{errorRegistro}</Alerta>}

      {!cliente ? (
        <section className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <div>
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-400/10 text-3xl text-lime-400">
              <i className="ri-user-search-line" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Seleccioná un cliente</h2>
            <p className="mt-2 text-sm text-gray-500">Su vencimiento y su historial aparecerán acá.</p>
          </div>
        </section>
      ) : cargandoCliente ? (
        <section className="flex min-h-72 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.035]">
          <span className="size-8 animate-spin rounded-full border-3 border-lime-400/25 border-t-lime-400" />
        </section>
      ) : (
        <div className="space-y-6">
          <ResumenCliente cliente={cliente} estado={estadoPago} />

          <form onSubmit={registrarPago} className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/[0.08] px-5 py-4 sm:px-7">
              <h2 className="text-xl font-bold text-white">Datos del nuevo pago</h2>
              <p className="mt-1 text-sm text-gray-500">La fecha de pago se asigna automáticamente.</p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <Campo etiqueta="Servicio o plan" requerido>
                <select
                  className={inputClassName}
                  value={formulario.idServicio}
                  onChange={(event) => seleccionarServicio(event.target.value)}
                  disabled={registrando || servicios.length === 0}
                  required
                >
                  <option value="">Seleccioná un servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.idServicio} value={servicio.idServicio}>
                      {servicio.nombre}{servicio.duracion ? ` · ${servicio.duracion}` : ""}
                    </option>
                  ))}
                </select>
                {servicios.length === 0 && (
                  <span className="mt-2 block text-xs text-amber-300">No hay servicios cargados en la base de datos.</span>
                )}
              </Campo>

              <Campo etiqueta="Monto (UYU)" requerido>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={inputClassName}
                  value={formulario.monto}
                  onChange={(event) => setFormulario({ ...formulario, monto: event.target.value })}
                  placeholder="Ej.: 1500"
                  disabled={registrando}
                  required
                />
              </Campo>

              <Campo etiqueta="Método de pago" requerido>
                <select
                  className={inputClassName}
                  value={formulario.metodoPago}
                  onChange={(event) => setFormulario({ ...formulario, metodoPago: event.target.value })}
                  disabled={registrando}
                >
                  {[
                    "Efectivo",
                    "Transferencia",
                    "Tarjeta de débito",
                    "Tarjeta de crédito",
                    "Otro",
                  ].map((metodo) => <option key={metodo}>{metodo}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Registrado por" ayuda="Entrenador opcional">
                <select
                  className={inputClassName}
                  value={formulario.idEntrenador}
                  onChange={(event) => setFormulario({ ...formulario, idEntrenador: event.target.value })}
                  disabled={registrando}
                >
                  <option value="">Sin asignar</option>
                  {entrenadores.map((entrenador) => (
                    <option key={entrenador.idEntrenador} value={entrenador.idEntrenador}>
                      {entrenador.nombre} {entrenador.apellido}
                    </option>
                  ))}
                </select>
              </Campo>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-200">Observaciones</span>
                <textarea
                  className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
                  value={formulario.observaciones}
                  onChange={(event) => setFormulario({ ...formulario, observaciones: event.target.value.slice(0, 300) })}
                  placeholder="Información adicional del pago..."
                  disabled={registrando}
                />
              </label>
            </div>

            <footer className="flex justify-end border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={registrando || !estadoPago?.clienteActivo || servicios.length === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-lime-400 px-7 text-sm font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {registrando ? (
                  <><span className="size-4 animate-spin rounded-full border-2 border-black/25 border-t-black" /> Registrando...</>
                ) : (
                  <><i className="ri-hand-coin-line text-xl" /> Registrar pago</>
                )}
              </button>
            </footer>
          </form>

          <HistorialPagos pagos={historial} />
        </div>
      )}
    </div>
  );
}

function ResumenCliente({ cliente, estado }: { cliente: Cliente; estado: EstadoPagoCliente | null }) {
  const estiloEstado = estado?.estadoCuota === "Vigente"
    ? "border-lime-400/25 bg-lime-400/10 text-lime-300"
    : estado?.estadoCuota === "Por vencer" || estado?.estadoCuota === "Vence hoy"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
      : estado?.estadoCuota === "Vencida"
        ? "border-red-400/25 bg-red-400/10 text-red-300"
        : "border-white/10 bg-white/5 text-gray-400";

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-13 items-center justify-center rounded-2xl bg-lime-400 text-xl font-black text-black">
            {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{cliente.nombre} {cliente.apellido}</h2>
            <p className="mt-1 text-sm text-gray-500">CI {cliente.documento} · ID #{cliente.idCliente}</p>
          </div>
        </div>
        <span className={`self-start rounded-full border px-3 py-1.5 text-xs font-bold ${estiloEstado}`}>
          {estado?.estadoCuota ?? "Consultando"}
        </span>
      </div>

      {!cliente.estado && (
        <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Este cliente está inactivo. Reactivalo desde el listado antes de registrar un pago.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DatoResumen etiqueta="Último pago" valor={formatearFechaHora(estado?.ultimaFechaPago ?? null)} icono="ri-calendar-check-line" />
        <DatoResumen etiqueta="Vencimiento actual" valor={formatearFecha(estado?.fechaVencimiento ?? null)} icono="ri-calendar-event-line" />
        <DatoResumen
          etiqueta={estado?.diasVencido ? "Días vencido" : "Días restantes"}
          valor={estado?.diasVencido ? estado.diasVencido.toString() : estado?.diasRestantes?.toString() ?? "—"}
          icono="ri-time-line"
        />
        <DatoResumen etiqueta="Último servicio" valor={estado?.servicio ?? "Sin registrar"} icono="ri-service-line" />
      </div>
    </section>
  );
}

function DatoResumen({ etiqueta, valor, icono }: { etiqueta: string; valor: string; icono: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
      <i className={`${icono} text-lg text-lime-400`} />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{etiqueta}</p>
      <p className="mt-1 font-bold text-white">{valor}</p>
    </div>
  );
}

function HistorialPagos({ pagos }: { pagos: Pago[] }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035]">
      <header className="border-b border-white/[0.08] px-5 py-4 sm:px-7">
        <h2 className="text-xl font-bold text-white">Historial de pagos</h2>
        <p className="mt-1 text-sm text-gray-500">Cada cuota permanece vinculada únicamente a este cliente.</p>
      </header>
      {pagos.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">Todavía no tiene pagos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                {['Pago', 'Servicio', 'Período', 'Monto', 'Método', 'Estado'].map((titulo) => (
                  <th key={titulo} className="px-5 py-4 font-bold">{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {pagos.map((pago) => (
                <tr key={pago.idCuota}>
                  <td className="px-5 py-4 text-sm text-gray-300">{formatearFechaHora(pago.fechaPago)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-white">{pago.servicio}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{formatearFecha(pago.fechaInicio)} → {formatearFecha(pago.fechaVencimiento)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-lime-400">{formatearMonto(pago.monto)}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{pago.metodoPago}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-lime-400/10 px-2.5 py-1 text-xs font-bold text-lime-300">{pago.estadoPago}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Campo({ etiqueta, ayuda, requerido = false, children }: { etiqueta: string; ayuda?: string; requerido?: boolean; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-200">
        {etiqueta} {requerido && <span className="text-lime-400">*</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1.5 block text-xs text-gray-500">{ayuda}</span>}
    </label>
  );
}

function Alerta({ tipo, children }: { tipo: "error" | "exito"; children: ReactNode }) {
  return (
    <div className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${tipo === "exito" ? "border-lime-400/25 bg-lime-400/10 text-lime-200" : "border-red-400/25 bg-red-400/10 text-red-200"}`}>
      <i className={`${tipo === "exito" ? "ri-checkbox-circle-line text-lime-400" : "ri-error-warning-line text-red-400"} text-xl`} />
      {children}
    </div>
  );
}
