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

type Cliente = {
  idCliente: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  fechaNacimiento: string | null;
  direccion: string | null;
  fechaRegistro: string;
  estado: boolean;
  idRutina: number;
  rutinaNombre: string;
  aceptaWhatsApp: boolean;
};

type RutinaOpcion = {
  idRutina: number;
  nombre: string;
  tienePdf: boolean;
};

type FormularioEdicion = {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  estado: boolean;
  idRutina: string;
  aceptaWhatsApp: boolean;
};

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-60";

function soloDigitos(valor: string, maximo: number) {
  return valor.replace(/\D/g, "").slice(0, maximo);
}

function telefonoLocal(telefono: string) {
  const digitos = telefono.replace(/\D/g, "");
  return (digitos.startsWith("598") ? digitos.slice(3) : digitos).slice(0, 8);
}

function formatearTelefono(telefono: string) {
  const local = telefonoLocal(telefono);
  return local.length === 8
    ? `+598 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
    : telefono;
}

function formatearFecha(valor: string | null) {
  if (!valor) return "—";
  const fechaSimple = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (fechaSimple && valor.length <= 10) {
    return `${fechaSimple[3]}/${fechaSimple[2]}/${fechaSimple[1]}`;
  }

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Montevideo",
      }).format(fecha);
}

export default function ListadoClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [rutinas, setRutinas] = useState<RutinaOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoRutinas, setCargandoRutinas] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorRutinas, setErrorRutinas] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [edicion, setEdicion] = useState<FormularioEdicion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [clienteEliminar, setClienteEliminar] = useState<Cliente | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const cargaInicial = useRef(false);

  const cargarClientes = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      const respuesta = await apiFetch("clientes");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo cargar el listado de clientes."),
        );
      }
      setClientes((await respuesta.json()) as Cliente[]);
    } catch (errorDesconocido) {
      setErrorCarga(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo cargar el listado de clientes.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }, []);

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
    void cargarClientes();
    void cargarRutinas();
  }, [cargarClientes, cargarRutinas]);

  useEffect(() => {
    if (!clienteEditar && !clienteEliminar) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [clienteEditar, clienteEliminar]);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-UY");
    if (!termino) return clientes;
    return clientes.filter((cliente) =>
      [
        cliente.idCliente.toString(),
        cliente.nombre,
        cliente.apellido,
        `${cliente.nombre} ${cliente.apellido}`,
        cliente.documento,
        cliente.telefono,
        cliente.rutinaNombre,
      ].some((dato) => dato.toLocaleLowerCase("es-UY").includes(termino)),
    );
  }, [busqueda, clientes]);

  function abrirEdicion(cliente: Cliente) {
    setMensaje("");
    setErrorModal("");
    setClienteEditar(cliente);
    setEdicion({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      documento: cliente.documento,
      telefono: telefonoLocal(cliente.telefono),
      fechaNacimiento: cliente.fechaNacimiento ?? "",
      direccion: cliente.direccion ?? "",
      estado: cliente.estado,
      idRutina: cliente.idRutina.toString(),
      aceptaWhatsApp: cliente.aceptaWhatsApp,
    });
  }

  async function guardarEdicion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clienteEditar || !edicion) return;
    setErrorModal("");

    if (!/^\d{6,12}$/.test(edicion.documento)) {
      setErrorModal("El documento debe tener entre 6 y 12 números.");
      return;
    }
    if (!/^\d{8}$/.test(edicion.telefono)) {
      setErrorModal("El teléfono debe tener 8 números después de +598.");
      return;
    }

    const idRutina = Number(edicion.idRutina);
    if (!Number.isInteger(idRutina) || idRutina <= 0) {
      setErrorModal("Seleccioná una rutina registrada en el sistema.");
      return;
    }

    try {
      setGuardando(true);
      const respuesta = await apiFetch(`clientes/${clienteEditar.idCliente}`, {
        method: "PUT",
        body: JSON.stringify({
          ...edicion,
          nombre: edicion.nombre.trim(),
          apellido: edicion.apellido.trim(),
          telefono: `598${edicion.telefono}`,
          fechaNacimiento: edicion.fechaNacimiento || null,
          direccion: edicion.direccion.trim() || null,
          idRutina,
        }),
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudieron guardar los cambios."),
        );
      }

      const actualizado = (await respuesta.json()) as Cliente;
      setClientes((actuales) =>
        actuales.map((cliente) =>
          cliente.idCliente === actualizado.idCliente ? actualizado : cliente,
        ),
      );
      setClienteEditar(null);
      setEdicion(null);
      const cambioRutina = clienteEditar.idRutina !== actualizado.idRutina;
      setMensaje(
        cambioRutina
          ? `Los datos y la rutina de ${actualizado.nombre} ${actualizado.apellido} fueron actualizados.`
          : `Los datos de ${actualizado.nombre} ${actualizado.apellido} fueron actualizados.`,
      );
    } catch (errorDesconocido) {
      setErrorModal(
        mensajeErrorDesconocido(errorDesconocido, "No se pudieron guardar los cambios."),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCliente() {
    if (!clienteEliminar) return;
    try {
      setEliminando(true);
      setErrorModal("");
      const respuesta = await apiFetch(`clientes/${clienteEliminar.idCliente}`, {
        method: "DELETE",
      });
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo eliminar el cliente."),
        );
      }
      setClientes((actuales) =>
        actuales.filter((cliente) => cliente.idCliente !== clienteEliminar.idCliente),
      );
      setMensaje(`${clienteEliminar.nombre} ${clienteEliminar.apellido} fue eliminado.`);
      setClienteEliminar(null);
    } catch (errorDesconocido) {
      setErrorModal(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo eliminar el cliente."),
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
            Gestión de clientes
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Listado de clientes</h1>
          <p className="mt-3 text-gray-400">Consultá, modificá o eliminá los registros.</p>
        </div>
        <div className="flex gap-3">
          <Contador valor={clientes.length} etiqueta="Total" />
          <Contador
            valor={clientes.filter((cliente) => cliente.estado).length}
            etiqueta="Activos"
            destacado
          />
        </div>
      </header>

      {mensaje && (
        <div className="mb-5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-200">
          <i className="ri-checkbox-circle-line mr-2 text-lg text-lime-400" />
          {mensaje}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative w-full sm:max-w-md">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              className={`${inputClassName} pl-11`}
              placeholder="Nombre, rutina, documento, teléfono o ID..."
            />
          </label>
          <button
            type="button"
            onClick={() => {
              void cargarClientes();
              void cargarRutinas();
            }}
            disabled={cargando}
            className="h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <i className="ri-refresh-line mr-2" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {errorCarga ? (
          <EstadoVacio icono="ri-error-warning-line" titulo="No se pudo cargar" detalle={errorCarga} />
        ) : cargando ? (
          <EstadoVacio icono="ri-loader-4-line animate-spin" titulo="Cargando clientes..." />
        ) : clientesFiltrados.length === 0 ? (
          <EstadoVacio
            icono="ri-user-search-line"
            titulo={clientes.length ? "No se encontraron coincidencias" : "No hay clientes registrados"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {[
                    "ID",
                    "Cliente",
                    "Documento",
                    "Teléfono",
                    "Rutina asignada",
                    "Registro",
                    "Estado",
                    "Acciones",
                  ].map((encabezado) => (
                    <th key={encabezado} className="px-5 py-4 font-bold">{encabezado}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.idCliente} className="transition hover:bg-white/[0.025]">
                    <td className="px-5 py-4 text-sm font-black text-lime-400">#{cliente.idCliente}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{cliente.nombre} {cliente.apellido}</p>
                      <p className="mt-0.5 max-w-52 truncate text-xs text-gray-500">
                        {cliente.direccion || "Sin dirección"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">{cliente.documento}</td>
                    <td className="px-5 py-4 text-sm text-gray-300">{formatearTelefono(cliente.telefono)}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex max-w-56 items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">
                        <i className="ri-file-list-3-line shrink-0" />
                        <span className="truncate">{cliente.rutinaNombre}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{formatearFecha(cliente.fechaRegistro)}</td>
                    <td className="px-5 py-4">
                      <span className={cliente.estado
                        ? "rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-xs font-bold text-lime-300"
                        : "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-gray-400"}
                      >
                        {cliente.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(cliente)}
                          className="rounded-lg border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs font-bold text-lime-300 transition hover:bg-lime-400 hover:text-black"
                        >
                          <i className="ri-pencil-line mr-1" /> Modificar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMensaje("");
                            setErrorModal("");
                            setClienteEliminar(cliente);
                          }}
                          className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400 hover:text-white"
                        >
                          <i className="ri-delete-bin-line mr-1" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {clienteEditar && edicion && (
        <Modal titulo={`Modificar cliente #${clienteEditar.idCliente}`} onCerrar={() => !guardando && setClienteEditar(null)}>
          <form onSubmit={guardarEdicion}>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <InputEdicion etiqueta="Nombre" value={edicion.nombre} onChange={(valor) => setEdicion({ ...edicion, nombre: valor })} />
              <InputEdicion etiqueta="Apellido" value={edicion.apellido} onChange={(valor) => setEdicion({ ...edicion, apellido: valor })} />
              <InputEdicion etiqueta="Documento" value={edicion.documento} onChange={(valor) => setEdicion({ ...edicion, documento: soloDigitos(valor, 12) })} />
              <InputEdicion etiqueta="Teléfono (+598)" value={edicion.telefono} onChange={(valor) => setEdicion({ ...edicion, telefono: soloDigitos(valor, 8) })} />
              <InputEdicion etiqueta="Fecha de nacimiento" type="date" value={edicion.fechaNacimiento} onChange={(valor) => setEdicion({ ...edicion, fechaNacimiento: valor })} />
              <InputEdicion etiqueta="Dirección" value={edicion.direccion} onChange={(valor) => setEdicion({ ...edicion, direccion: valor })} />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  Rutina asignada
                </span>
                <select
                  className={inputClassName}
                  value={edicion.idRutina}
                  onChange={(event) =>
                    setEdicion({ ...edicion, idRutina: event.target.value })
                  }
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
                <span className="mt-1.5 block text-xs text-gray-500">
                  Al guardar una rutina diferente, se enviará automáticamente si el consentimiento está activo.
                </span>
                {errorRutinas && (
                  <span className="mt-2 block text-xs text-red-300">{errorRutinas}</span>
                )}
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] p-4 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={edicion.aceptaWhatsApp}
                  onChange={(event) =>
                    setEdicion({ ...edicion, aceptaWhatsApp: event.target.checked })
                  }
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
                    Al desmarcarla, se detienen los futuros envíos automáticos.
                  </span>
                </span>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">Estado</span>
                <select
                  className={inputClassName}
                  value={edicion.estado ? "activo" : "inactivo"}
                  onChange={(event) => setEdicion({ ...edicion, estado: event.target.value === "activo" })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
              {errorModal && <p className="sm:col-span-2 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">{errorModal}</p>}
            </div>
            <PieModal
              onCancelar={() => setClienteEditar(null)}
              procesando={guardando}
              textoAccion="Guardar cambios"
            />
          </form>
        </Modal>
      )}

      {clienteEliminar && (
        <Modal titulo="Confirmar eliminación" onCerrar={() => !eliminando && setClienteEliminar(null)}>
          <div className="p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-2xl text-red-400">
              <i className="ri-delete-bin-line" />
            </div>
            <p className="leading-7 text-gray-300">
              ¿Seguro que querés eliminar a <strong className="text-white">{clienteEliminar.nombre} {clienteEliminar.apellido}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Si tiene pagos registrados, el sistema protegerá el historial y te pedirá marcarlo como inactivo.
            </p>
            {errorModal && <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">{errorModal}</p>}
          </div>
          <PieModal
            onCancelar={() => setClienteEliminar(null)}
            onConfirmar={() => void eliminarCliente()}
            procesando={eliminando}
            textoAccion="Sí, eliminar"
            peligro
          />
        </Modal>
      )}
    </div>
  );
}

function Contador({ valor, etiqueta, destacado = false }: { valor: number; etiqueta: string; destacado?: boolean }) {
  return (
    <div className={`min-w-20 rounded-2xl border px-4 py-2 text-center ${destacado ? "border-lime-400/25 bg-lime-400/10" : "border-white/10 bg-white/[0.035]"}`}>
      <span className={`block text-xl font-black ${destacado ? "text-lime-400" : "text-white"}`}>{valor}</span>
      <span className="text-xs text-gray-500">{etiqueta}</span>
    </div>
  );
}

function EstadoVacio({ icono, titulo, detalle }: { icono: string; titulo: string; detalle?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <i className={`${icono} text-4xl text-lime-400`} />
      <p className="mt-3 font-semibold text-white">{titulo}</p>
      {detalle && <p className="mt-2 max-w-lg text-sm text-red-300">{detalle}</p>}
    </div>
  );
}

function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onCerrar()}>
      <section role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#151915] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-lg font-bold text-white">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="flex size-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/5 hover:text-white" aria-label="Cerrar">
            <i className="ri-close-line text-xl" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function InputEdicion({ etiqueta, value, onChange, type = "text" }: { etiqueta: string; value: string; onChange: (valor: string) => void; type?: string }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-300">{etiqueta}</span>
      <input type={type} required={etiqueta === "Nombre" || etiqueta === "Apellido" || etiqueta.startsWith("Documento") || etiqueta.startsWith("Teléfono")} className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function PieModal({ onCancelar, onConfirmar, procesando, textoAccion, peligro = false }: { onCancelar: () => void; onConfirmar?: () => void; procesando: boolean; textoAccion: string; peligro?: boolean }) {
  return (
    <footer className="flex justify-end gap-3 border-t border-white/[0.08] bg-black/15 px-5 py-4">
      <button type="button" onClick={onCancelar} disabled={procesando} className="h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 disabled:opacity-50">Cancelar</button>
      <button type={onConfirmar ? "button" : "submit"} onClick={onConfirmar} disabled={procesando} className={`h-10 rounded-xl px-5 text-sm font-black disabled:opacity-50 ${peligro ? "bg-red-500 text-white" : "bg-lime-400 text-black"}`}>
        {procesando ? "Procesando..." : textoAccion}
      </button>
    </footer>
  );
}
