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

type EstadoCuota = "Vencida" | "Vence hoy" | "Por vencer" | "Vigente";
type FiltroClientes = "todos" | "activos" | "semana";

type ClientePago = {
  idCliente: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  fechaRegistro: string;
  clienteActivo: boolean;
  ultimaFechaPago: string | null;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  diasRestantes: number | null;
  diasVencido: number;
  estadoCuota: EstadoCuota;
  esCuotaInicial: boolean;
  pagaEstaSemana: boolean;
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
  estadoCuota: EstadoCuota;
  esCuotaInicial: boolean;
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
  advertenciaHikvision: string | null;
};

type FormularioPago = {
  idEntrenador: string;
  monto: string;
  metodoPago: string;
  observaciones: string;
};

const FORMULARIO_INICIAL: FormularioPago = {
  idEntrenador: "",
  monto: "",
  metodoPago: "Efectivo",
  observaciones: "",
};

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:cursor-not-allowed disabled:opacity-50";

function formatearFecha(fecha: string | null) {
  if (!fecha) return "—";
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  if (partes && fecha.length <= 10) {
    return `${partes[3]}/${partes[2]}/${partes[1]}`;
  }

  const valor = new Date(fecha);
  if (!Number.isNaN(valor.getTime())) {
    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Montevideo",
    }).format(valor);
  }

  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha;
}

function formatearFechaHora(fecha: string | null) {
  if (!fecha) return "—";
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

function estadoDesdeCliente(cliente: ClientePago): EstadoPagoCliente {
  return {
    idCliente: cliente.idCliente,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    documento: cliente.documento,
    clienteActivo: cliente.clienteActivo,
    ultimaFechaPago: cliente.ultimaFechaPago,
    fechaInicio: cliente.fechaInicio,
    fechaVencimiento: cliente.fechaVencimiento,
    diasRestantes: cliente.diasRestantes,
    diasVencido: cliente.diasVencido,
    estadoCuota: cliente.estadoCuota,
    esCuotaInicial: cliente.esCuotaInicial,
  };
}

function actualizarClienteConPago(
  cliente: ClientePago,
  estado: EstadoPagoCliente,
): ClientePago {
  return {
    ...cliente,
    clienteActivo: estado.clienteActivo,
    ultimaFechaPago: estado.ultimaFechaPago,
    fechaInicio: estado.fechaInicio,
    fechaVencimiento: estado.fechaVencimiento,
    diasRestantes: estado.diasRestantes,
    diasVencido: estado.diasVencido,
    estadoCuota: estado.estadoCuota,
    esCuotaInicial: estado.esCuotaInicial,
    pagaEstaSemana:
      estado.clienteActivo &&
      estado.estadoCuota !== "Vencida" &&
      estado.diasRestantes !== null &&
      estado.diasRestantes <= 7,
  };
}

function textoDias(cliente: ClientePago) {
  if (!cliente.fechaVencimiento || cliente.diasRestantes === null) return "Sin vencimiento disponible";
  if (cliente.diasVencido > 0) {
    return `Vencida hace ${cliente.diasVencido} ${cliente.diasVencido === 1 ? "día" : "días"}`;
  }
  if (cliente.diasRestantes === 0) return "Vence hoy";
  return `${cliente.diasRestantes} ${cliente.diasRestantes === 1 ? "día restante" : "días restantes"}`;
}

function estiloFechaVencimiento(cliente: ClientePago) {
  if (!cliente.clienteActivo) return "text-gray-500";
  if (cliente.estadoCuota === "Vencida" || cliente.pagaEstaSemana) return "text-red-300";
  return "text-lime-400";
}

export default function RegistrarPagoPage() {
  const [clientes, setClientes] = useState<ClientePago[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroClientes>("todos");
  const [cliente, setCliente] = useState<ClientePago | null>(null);
  const [estadoPago, setEstadoPago] = useState<EstadoPagoCliente | null>(null);
  const [historial, setHistorial] = useState<Pago[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [errorCatalogos, setErrorCatalogos] = useState("");
  const [formulario, setFormulario] = useState<FormularioPago>(FORMULARIO_INICIAL);
  const [registrando, setRegistrando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [advertenciaHikvision, setAdvertenciaHikvision] = useState("");
  const cargaInicial = useRef(false);

  const cargarClientes = useCallback(async () => {
    try {
      setCargandoClientes(true);
      setErrorCarga("");
      const respuesta = await apiFetch("clientes/estado-pagos");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo cargar el control de cuotas."),
        );
      }
      setClientes((await respuesta.json()) as ClientePago[]);
    } catch (errorDesconocido) {
      setErrorCarga(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo cargar el control de cuotas."),
      );
    } finally {
      setCargandoClientes(false);
    }
  }, []);

  useEffect(() => {
    if (cargaInicial.current) return;
    cargaInicial.current = true;
    void cargarClientes();

    async function cargarCatalogos() {
      try {
        const respuestaEntrenadores = await apiFetch("entrenadores");
        if (!respuestaEntrenadores.ok) {
          throw new Error(
            await mensajeErrorHttp(
              respuestaEntrenadores,
              "No se pudieron cargar los entrenadores.",
            ),
          );
        }

        setEntrenadores((await respuestaEntrenadores.json()) as Entrenador[]);
      } catch (errorDesconocido) {
        setErrorCatalogos(
          mensajeErrorDesconocido(errorDesconocido, "No se cargó la lista de entrenadores."),
        );
      }
    }

    void cargarCatalogos();
  }, [cargarClientes]);

  useEffect(() => {
    if (!cliente) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function cerrarConEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !registrando) cerrarModal();
    }

    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [cliente, registrando]);

  const contadores = useMemo(
    () => ({
      total: clientes.length,
      activos: clientes.filter((item) => item.clienteActivo).length,
      semana: clientes.filter((item) => item.pagaEstaSemana).length,
    }),
    [clientes],
  );

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-UY");

    return clientes.filter((item) => {
      const coincideFiltro =
        filtro === "todos" ||
        (filtro === "activos" && item.clienteActivo) ||
        (filtro === "semana" && item.pagaEstaSemana);

      if (!coincideFiltro) return false;
      if (!termino) return true;

      return [
        item.nombre,
        item.apellido,
        `${item.nombre} ${item.apellido}`,
        item.documento,
        item.telefono,
      ].some((dato) => dato.toLocaleLowerCase("es-UY").includes(termino));
    });
  }, [busqueda, clientes, filtro]);

  async function abrirRegistroPago(seleccionado: ClientePago) {
    setCliente(seleccionado);
    setEstadoPago(estadoDesdeCliente(seleccionado));
    setHistorial([]);
    setErrorRegistro("");
    setMensajeExito("");
    setAdvertenciaHikvision("");

    setFormulario(FORMULARIO_INICIAL);

    try {
      setCargandoHistorial(true);
      const respuesta = await apiFetch(`pagos/cliente/${seleccionado.idCliente}`);
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo consultar el historial."),
        );
      }
      setHistorial((await respuesta.json()) as Pago[]);
    } catch (errorDesconocido) {
      setErrorRegistro(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo consultar el historial."),
      );
    } finally {
      setCargandoHistorial(false);
    }
  }

  function cerrarModal() {
    setCliente(null);
    setEstadoPago(null);
    setHistorial([]);
    setErrorRegistro("");
    setMensajeExito("");
    setAdvertenciaHikvision("");
  }

  async function registrarPago(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cliente) return;
    setErrorRegistro("");
    setMensajeExito("");
    setAdvertenciaHikvision("");

    const monto = Number(formulario.monto.replace(",", "."));
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
      const clienteActualizado = actualizarClienteConPago(cliente, resultado.estadoCliente);
      setEstadoPago(resultado.estadoCliente);
      setCliente(clienteActualizado);
      setClientes((actuales) =>
        actuales.map((item) =>
          item.idCliente === clienteActualizado.idCliente ? clienteActualizado : item,
        ),
      );
      setHistorial((actual) => [resultado.pago, ...actual]);
      setFormulario((actual) => ({ ...actual, observaciones: "" }));
      setMensajeExito(
        `Pago registrado. El nuevo vencimiento es el ${formatearFecha(resultado.pago.fechaVencimiento)}.`,
      );
      setAdvertenciaHikvision(resultado.advertenciaHikvision ?? "");
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
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
            Gestión de pagos
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Registrar pagos</h1>
          <p className="mt-3 max-w-3xl text-gray-400">
            Consultá el estado de cada cuota y registrá el pago desde la fila del cliente.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Filtros de clientes">
          <TarjetaFiltro
            valor={contadores.total}
            etiqueta="Total"
            tono="neutral"
            seleccionada={filtro === "todos"}
            onClick={() => setFiltro("todos")}
          />
          <TarjetaFiltro
            valor={contadores.activos}
            etiqueta="Activos"
            tono="verde"
            seleccionada={filtro === "activos"}
            onClick={() => setFiltro("activos")}
          />
          <TarjetaFiltro
            valor={contadores.semana}
            etiqueta="Pagan esta semana"
            tono="rojo"
            seleccionada={filtro === "semana"}
            onClick={() => setFiltro("semana")}
          />
        </div>
      </header>

      {errorCatalogos && <Alerta tipo="error">{errorCatalogos}</Alerta>}

      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative w-full sm:max-w-md">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              className={`${inputClassName} pl-11`}
              placeholder="Nombre, apellido o documento..."
            />
          </label>
          <button
            type="button"
            onClick={() => void cargarClientes()}
            disabled={cargandoClientes}
            className="h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <i className="ri-refresh-line mr-2" />
            {cargandoClientes ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {errorCarga ? (
          <EstadoVacio icono="ri-error-warning-line" titulo="No se pudo cargar" detalle={errorCarga} />
        ) : cargandoClientes ? (
          <EstadoVacio icono="ri-loader-4-line animate-spin" titulo="Cargando cuotas..." />
        ) : clientesFiltrados.length === 0 ? (
          <EstadoVacio
            icono="ri-user-search-line"
            titulo={clientes.length ? "No hay clientes para este filtro" : "No hay clientes registrados"}
            detalle={busqueda ? "Probá con otro nombre, apellido o documento." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {[
                    "Cliente",
                    "Fecha de registro",
                    "Inicio / último pago",
                    "Vencimiento",
                    "Estado de cuota",
                    "Acción",
                  ].map((encabezado) => (
                    <th key={encabezado} className="px-5 py-4 font-bold">{encabezado}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {clientesFiltrados.map((item) => (
                  <tr key={item.idCliente} className="transition hover:bg-white/[0.025]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                          item.clienteActivo
                            ? "bg-lime-400 text-black"
                            : "bg-white/5 text-gray-500"
                        }`}>
                          {item.nombre.charAt(0)}{item.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.nombre} {item.apellido}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            CI {item.documento}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {formatearFecha(item.fechaRegistro)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-300">
                        {item.esCuotaInicial
                          ? formatearFecha(item.ultimaFechaPago)
                          : formatearFechaHora(item.ultimaFechaPago)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        {item.esCuotaInicial ? "Inicio por fecha de registro" : "Último pago registrado"}
                      </p>
                    </td>
                    <td className={`px-5 py-4 text-sm font-bold ${estiloFechaVencimiento(item)}`}>
                      {formatearFecha(item.fechaVencimiento)}
                    </td>
                    <td className="px-5 py-4">
                      <EstadoCuotaBadge cliente={item} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => void abrirRegistroPago(item)}
                        disabled={!item.clienteActivo}
                        title={!item.clienteActivo
                          ? "Reactivalo desde el listado de clientes para registrar un pago."
                          : "Registrar un nuevo pago"}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 text-xs font-black text-lime-300 transition hover:bg-lime-400 hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-600"
                      >
                        <i className="ri-hand-coin-line text-base" />
                        {item.clienteActivo ? "Registrar pago" : "Cliente inactivo"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {cliente && estadoPago && (
        <Modal
          titulo={`Registrar pago · ${cliente.nombre} ${cliente.apellido}`}
          onCerrar={() => !registrando && cerrarModal()}
        >
          <div className="space-y-5 p-4 sm:p-6">
            <ResumenCliente cliente={cliente} estado={estadoPago} />

            {mensajeExito && <Alerta tipo="exito" dentroModal>{mensajeExito}</Alerta>}
            {advertenciaHikvision && (
              <Alerta tipo="advertencia" dentroModal>{advertenciaHikvision}</Alerta>
            )}
            {errorRegistro && <Alerta tipo="error" dentroModal>{errorRegistro}</Alerta>}

            <form
              onSubmit={registrarPago}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
            >
              <div className="border-b border-white/[0.08] px-5 py-4">
                <h3 className="font-bold text-white">Datos del nuevo pago</h3>
                <p className="mt-1 text-xs text-gray-500">
                  La fecha se asigna automáticamente y el mes se suma sin perder días abonados.
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
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
                    className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
                    value={formulario.observaciones}
                    onChange={(event) => setFormulario({
                      ...formulario,
                      observaciones: event.target.value.slice(0, 300),
                    })}
                    placeholder="Información adicional del pago..."
                    disabled={registrando}
                  />
                  <span className="mt-1 block text-right text-xs text-gray-600">
                    {formulario.observaciones.length}/300
                  </span>
                </label>
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={registrando}
                  className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registrando || !estadoPago.clienteActivo}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {registrando ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                      Registrando...
                    </>
                  ) : (
                    <><i className="ri-hand-coin-line text-lg" /> Confirmar pago</>
                  )}
                </button>
              </footer>
            </form>

            <HistorialPagos
              pagos={historial}
              cargando={cargandoHistorial}
              fechaRegistro={cliente.fechaRegistro}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function TarjetaFiltro({
  valor,
  etiqueta,
  tono,
  seleccionada,
  onClick,
}: {
  valor: number;
  etiqueta: string;
  tono: "neutral" | "verde" | "rojo";
  seleccionada: boolean;
  onClick: () => void;
}) {
  const estilos = {
    neutral: seleccionada
      ? "border-white/20 bg-white/[0.075] text-white ring-white/15"
      : "border-white/10 bg-white/[0.025] text-gray-400 ring-transparent hover:bg-white/[0.05]",
    verde: seleccionada
      ? "border-lime-400/45 bg-lime-400/15 text-lime-400 ring-lime-400/20"
      : "border-lime-400/15 bg-lime-400/[0.045] text-lime-400/60 ring-transparent hover:bg-lime-400/[0.08]",
    rojo: seleccionada
      ? "border-red-400/50 bg-red-400/15 text-red-300 ring-red-400/20"
      : "border-red-400/15 bg-red-400/[0.045] text-red-300/60 ring-transparent hover:bg-red-400/[0.08]",
  }[tono];

  return (
    <button
      type="button"
      aria-pressed={seleccionada}
      onClick={onClick}
      className={`relative flex min-h-20 min-w-0 flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center ring-2 ring-inset transition sm:min-w-24 sm:px-4 ${estilos}`}
    >
      <span className="text-xl font-black leading-none sm:text-2xl">{valor}</span>
      <span className="mt-2 text-[10px] font-semibold leading-tight text-current opacity-70 sm:text-xs">
        {etiqueta}
      </span>
      {seleccionada && (
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
    </button>
  );
}

function EstadoCuotaBadge({ cliente }: { cliente: ClientePago }) {
  const estilo = !cliente.clienteActivo
    ? "border-white/10 bg-white/5 text-gray-500"
    : cliente.estadoCuota === "Vencida" || cliente.pagaEstaSemana
      ? "border-red-400/25 bg-red-400/10 text-red-300"
      : "border-lime-400/25 bg-lime-400/10 text-lime-300";

  return (
    <div>
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${estilo}`}>
        {!cliente.clienteActivo ? "Cliente inactivo" : cliente.estadoCuota}
      </span>
      <p className="mt-1.5 text-xs text-gray-500">{textoDias(cliente)}</p>
    </div>
  );
}

function ResumenCliente({ cliente, estado }: { cliente: ClientePago; estado: EstadoPagoCliente }) {
  const estiloEstado = estado.estadoCuota === "Vigente"
    ? "border-lime-400/25 bg-lime-400/10 text-lime-300"
    : estado.estadoCuota === "Por vencer" || estado.estadoCuota === "Vence hoy"
      ? "border-red-400/25 bg-red-400/10 text-red-300"
      : estado.estadoCuota === "Vencida"
        ? "border-red-400/25 bg-red-400/10 text-red-300"
        : "border-lime-400/25 bg-lime-400/10 text-lime-300";

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-lime-400 text-lg font-black text-black">
            {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{cliente.nombre} {cliente.apellido}</h3>
            <p className="mt-1 text-xs text-gray-500">
              CI {cliente.documento} · {formatearTelefono(cliente.telefono)}
            </p>
          </div>
        </div>
        <span className={`self-start rounded-full border px-3 py-1.5 text-xs font-bold ${estiloEstado}`}>
          {estado.estadoCuota}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DatoResumen
          etiqueta={estado.esCuotaInicial ? "Inicio de cuota" : "Último pago"}
          valor={estado.esCuotaInicial
            ? formatearFecha(estado.ultimaFechaPago)
            : formatearFechaHora(estado.ultimaFechaPago)}
        />
        <DatoResumen etiqueta="Vencimiento" valor={formatearFecha(estado.fechaVencimiento)} />
        <DatoResumen
          etiqueta={estado.diasVencido ? "Días vencido" : "Días restantes"}
          valor={estado.diasVencido
            ? estado.diasVencido.toString()
            : estado.diasRestantes?.toString() ?? "—"}
        />
        <DatoResumen
          etiqueta="Período vigente"
          valor={`${formatearFecha(estado.fechaInicio)} → ${formatearFecha(estado.fechaVencimiento)}`}
        />
      </div>
    </section>
  );
}

function DatoResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{etiqueta}</p>
      <p className="mt-1.5 text-sm font-bold text-white">{valor}</p>
    </div>
  );
}

function HistorialPagos({
  pagos,
  cargando,
  fechaRegistro,
}: {
  pagos: Pago[];
  cargando: boolean;
  fechaRegistro: string;
}) {
  return (
    <details className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-white">
        <span><i className="ri-history-line mr-2 text-lime-400" />Historial de pagos</span>
        <span className="text-xs font-semibold text-gray-500">{pagos.length} registros</span>
      </summary>
      {cargando ? (
        <div className="border-t border-white/[0.08] p-6 text-center text-sm text-gray-500">
          Cargando historial...
        </div>
      ) : pagos.length === 0 ? (
        <div className="border-t border-white/[0.08] p-6 text-center text-sm text-gray-500">
          La cuota inicial comenzó el {formatearFecha(fechaRegistro)} con el alta del cliente.
          Todavía no hay renovaciones registradas.
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-white/[0.08]">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-black/20 text-[10px] uppercase tracking-wider text-gray-500">
              <tr>
                {['Pago', 'Período', 'Monto', 'Método', 'Observaciones'].map((titulo) => (
                  <th key={titulo} className="px-4 py-3 font-bold">{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {pagos.map((pago) => (
                <tr key={pago.idCuota}>
                  <td className="px-4 py-3 text-xs text-gray-300">{formatearFechaHora(pago.fechaPago)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatearFecha(pago.fechaInicio)} → {formatearFecha(pago.fechaVencimiento)}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-lime-400">{formatearMonto(pago.monto)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{pago.metodoPago}</td>
                  <td className="max-w-64 px-4 py-3 text-xs text-gray-400">
                    {pago.observaciones ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
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
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-200">
        {etiqueta} {requerido && <span className="text-lime-400">*</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1.5 block text-xs text-gray-500">{ayuda}</span>}
    </label>
  );
}

function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onCerrar()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#151915] shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#151915]/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-bold text-white">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="flex size-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Cerrar"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function EstadoVacio({ icono, titulo, detalle }: { icono: string; titulo: string; detalle?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <i className={`${icono} text-4xl text-lime-400`} />
      <p className="mt-3 font-semibold text-white">{titulo}</p>
      {detalle && <p className="mt-2 max-w-lg text-sm text-gray-500">{detalle}</p>}
    </div>
  );
}

function Alerta({
  tipo,
  dentroModal = false,
  children,
}: {
  tipo: "error" | "exito" | "advertencia";
  dentroModal?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${dentroModal ? "" : "mb-5"} flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
      tipo === "exito"
        ? "border-lime-400/25 bg-lime-400/10 text-lime-200"
        : tipo === "advertencia"
          ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
          : "border-red-400/25 bg-red-400/10 text-red-200"
    }`}>
      <i className={`${
        tipo === "exito"
          ? "ri-checkbox-circle-line text-lime-400"
          : tipo === "advertencia"
            ? "ri-alert-line text-amber-400"
            : "ri-error-warning-line text-red-400"
      } text-xl`} />
      {children}
    </div>
  );
}
