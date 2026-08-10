import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  apiFetch,
  apiUrl,
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";
import {
  formatearPrecioServicio,
  type Servicio,
} from "../../../types/servicio";

type FormularioEdicion = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: string;
  eliminarImagen: boolean;
};

const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
const TIPOS_IMAGEN = new Set(["image/jpeg", "image/png", "image/webp"]);
const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-60";

function errorImagen(archivo: File) {
  if (!TIPOS_IMAGEN.has(archivo.type)) {
    return "La imagen debe estar en formato JPG, PNG o WEBP.";
  }
  if (archivo.size > MAX_IMAGEN_BYTES) {
    return "La imagen no puede superar los 5 MB.";
  }
  return "";
}

export default function ListadoServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [servicioEditar, setServicioEditar] = useState<Servicio | null>(null);
  const [edicion, setEdicion] = useState<FormularioEdicion | null>(null);
  const [imagenNueva, setImagenNueva] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [servicioEliminar, setServicioEliminar] = useState<Servicio | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const cargaInicial = useRef(false);
  const inputImagen = useRef<HTMLInputElement>(null);

  const cargarServicios = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      const respuesta = await apiFetch("servicios");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(
            respuesta,
            "No se pudo cargar el listado de servicios.",
          ),
        );
      }
      setServicios((await respuesta.json()) as Servicio[]);
    } catch (errorDesconocido) {
      setErrorCarga(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo cargar el listado de servicios.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (cargaInicial.current) return;
    cargaInicial.current = true;
    void cargarServicios();
  }, [cargarServicios]);

  useEffect(() => {
    if (!servicioEditar && !servicioEliminar) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [servicioEditar, servicioEliminar]);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  const serviciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-UY");
    if (!termino) return servicios;
    return servicios.filter((servicio) =>
      servicio.nombre.toLocaleLowerCase("es-UY").includes(termino),
    );
  }, [busqueda, servicios]);

  function abrirEdicion(servicio: Servicio) {
    setMensaje("");
    setErrorModal("");
    setServicioEditar(servicio);
    setEdicion({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? "",
      precio: servicio.precio.toString(),
      duracion: servicio.duracion ?? "",
      eliminarImagen: false,
    });
    setImagenNueva(null);
    setVistaPrevia("");
    if (inputImagen.current) inputImagen.current.value = "";
  }

  function seleccionarImagen(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0] ?? null;
    setErrorModal("");
    if (!archivo) {
      setImagenNueva(null);
      setVistaPrevia("");
      return;
    }

    const validacion = errorImagen(archivo);
    if (validacion) {
      event.target.value = "";
      setImagenNueva(null);
      setVistaPrevia("");
      setErrorModal(validacion);
      return;
    }

    setImagenNueva(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
    if (edicion) setEdicion({ ...edicion, eliminarImagen: false });
  }

  async function guardarEdicion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!servicioEditar || !edicion) return;
    setErrorModal("");

    const precio = Number(edicion.precio.replace(",", "."));
    if (!Number.isFinite(precio) || precio <= 0) {
      setErrorModal("Ingresá un precio mayor a cero.");
      return;
    }

    const datos = new FormData();
    datos.append("nombre", edicion.nombre.trim());
    datos.append("descripcion", edicion.descripcion.trim());
    datos.append("precio", precio.toString());
    datos.append("duracion", edicion.duracion.trim());
    datos.append("eliminarImagen", edicion.eliminarImagen.toString());
    if (imagenNueva) datos.append("imagen", imagenNueva);

    try {
      setGuardando(true);
      const respuesta = await apiFetch(`servicios/${servicioEditar.idServicio}`, {
        method: "PUT",
        body: datos,
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudieron guardar los cambios."),
        );
      }

      const actualizado = (await respuesta.json()) as Servicio;
      setServicios((actuales) =>
        actuales.map((servicio) =>
          servicio.idServicio === actualizado.idServicio ? actualizado : servicio,
        ),
      );
      setServicioEditar(null);
      setEdicion(null);
      setImagenNueva(null);
      setVistaPrevia("");
      setMensaje(`${actualizado.nombre} fue actualizado correctamente.`);
    } catch (errorDesconocido) {
      setErrorModal(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudieron guardar los cambios.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarServicio() {
    if (!servicioEliminar) return;
    try {
      setEliminando(true);
      setErrorModal("");
      const respuesta = await apiFetch(`servicios/${servicioEliminar.idServicio}`, {
        method: "DELETE",
      });
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo eliminar el servicio."),
        );
      }

      setServicios((actuales) =>
        actuales.filter(
          (servicio) => servicio.idServicio !== servicioEliminar.idServicio,
        ),
      );
      setMensaje(`${servicioEliminar.nombre} fue eliminado.`);
      setServicioEliminar(null);
    } catch (errorDesconocido) {
      setErrorModal(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo eliminar el servicio.",
        ),
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
            Gestión de servicios
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Listado de servicios
          </h1>
          <p className="mt-3 text-gray-400">
            Consultá, modificá o eliminá los servicios registrados.
          </p>
        </div>
        <div className="flex gap-3">
          <Contador valor={servicios.length} etiqueta="Total" />
          <Contador
            valor={servicios.filter((servicio) => servicio.tieneImagen).length}
            etiqueta="Con imagen"
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
              placeholder="Buscar servicio por nombre..."
            />
          </label>
          <button
            type="button"
            onClick={() => void cargarServicios()}
            disabled={cargando}
            className="h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <i className="ri-refresh-line mr-2" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {errorCarga ? (
          <EstadoVacio
            icono="ri-error-warning-line"
            titulo="No se pudo cargar"
            detalle={errorCarga}
          />
        ) : cargando ? (
          <EstadoVacio
            icono="ri-loader-4-line animate-spin"
            titulo="Cargando servicios..."
          />
        ) : serviciosFiltrados.length === 0 ? (
          <EstadoVacio
            icono="ri-service-line"
            titulo={
              servicios.length
                ? "No se encontraron coincidencias"
                : "No hay servicios registrados"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {["ID", "Imagen", "Servicio", "Precio", "Duración", "Acciones"].map(
                    (encabezado) => (
                      <th key={encabezado} className="px-5 py-4 font-bold">
                        {encabezado}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {serviciosFiltrados.map((servicio) => (
                  <tr
                    key={servicio.idServicio}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 text-sm font-black text-lime-400">
                      #{servicio.idServicio}
                    </td>
                    <td className="px-5 py-4">
                      {servicio.tieneImagen ? (
                        <img
                          src={apiUrl(`servicios/${servicio.idServicio}/imagen`)}
                          crossOrigin="use-credentials"
                          alt={servicio.nombre}
                          className="size-16 rounded-xl border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex size-16 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-2xl text-gray-600">
                          <i className="ri-image-line" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{servicio.nombre}</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                        {servicio.descripcion || "Sin descripción"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-200">
                      {formatearPrecioServicio(servicio.precio)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {servicio.duracion || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(servicio)}
                          className="rounded-lg border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs font-bold text-lime-300 transition hover:bg-lime-400 hover:text-black"
                        >
                          <i className="ri-pencil-line mr-1" /> Modificar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMensaje("");
                            setErrorModal("");
                            setServicioEliminar(servicio);
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

      {servicioEditar && edicion && (
        <Modal
          titulo={`Modificar servicio #${servicioEditar.idServicio}`}
          onCerrar={() => !guardando && setServicioEditar(null)}
        >
          <form onSubmit={guardarEdicion}>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <InputEdicion
                etiqueta="Nombre"
                value={edicion.nombre}
                onChange={(valor) => setEdicion({ ...edicion, nombre: valor })}
                maxLength={80}
                requerido
              />
              <InputEdicion
                etiqueta="Precio (UYU)"
                value={edicion.precio}
                onChange={(valor) => setEdicion({ ...edicion, precio: valor })}
                type="number"
                requerido
              />
              <InputEdicion
                etiqueta="Duración"
                value={edicion.duracion}
                onChange={(valor) => setEdicion({ ...edicion, duracion: valor })}
                maxLength={50}
              />
              <div>
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  Reemplazar imagen
                </span>
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-lime-400/30 px-3 text-sm text-gray-300">
                  <i className="ri-image-add-line text-lime-400" />
                  <span className="min-w-0 flex-1 truncate">
                    {imagenNueva?.name ?? "Seleccionar archivo"}
                  </span>
                  <input
                    ref={inputImagen}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={seleccionarImagen}
                    className="sr-only"
                  />
                </label>
              </div>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  Descripción
                </span>
                <textarea
                  value={edicion.descripcion}
                  onChange={(event) =>
                    setEdicion({
                      ...edicion,
                      descripcion: event.target.value.slice(0, 500),
                    })
                  }
                  className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-lime-400/70"
                />
              </label>

              {(vistaPrevia || servicioEditar.tieneImagen) && (
                <div className="sm:col-span-2">
                  <img
                    src={
                      vistaPrevia ||
                      apiUrl(`servicios/${servicioEditar.idServicio}/imagen`)
                    }
                    crossOrigin={vistaPrevia ? undefined : "use-credentials"}
                    alt="Imagen del servicio"
                    className={`h-44 w-full rounded-2xl border border-white/10 object-cover ${
                      edicion.eliminarImagen ? "opacity-30 grayscale" : ""
                    }`}
                  />
                  {servicioEditar.tieneImagen && !imagenNueva && (
                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-red-300">
                      <input
                        type="checkbox"
                        checked={edicion.eliminarImagen}
                        onChange={(event) =>
                          setEdicion({
                            ...edicion,
                            eliminarImagen: event.target.checked,
                          })
                        }
                        className="size-4 accent-red-500"
                      />
                      Quitar la imagen actual
                    </label>
                  )}
                </div>
              )}

              {errorModal && (
                <p className="sm:col-span-2 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">
                  {errorModal}
                </p>
              )}
            </div>
            <PieModal
              onCancelar={() => setServicioEditar(null)}
              procesando={guardando}
              textoAccion="Guardar cambios"
            />
          </form>
        </Modal>
      )}

      {servicioEliminar && (
        <Modal
          titulo="Confirmar eliminación"
          onCerrar={() => !eliminando && setServicioEliminar(null)}
        >
          <div className="p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-2xl text-red-400">
              <i className="ri-delete-bin-line" />
            </div>
            <p className="leading-7 text-gray-300">
              ¿Seguro que querés eliminar el servicio{" "}
              <strong className="text-white">{servicioEliminar.nombre}</strong>?
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Si ya fue utilizado en un pago, el backend conservará el historial y
              no permitirá eliminarlo.
            </p>
            {errorModal && (
              <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">
                {errorModal}
              </p>
            )}
          </div>
          <PieModal
            onCancelar={() => setServicioEliminar(null)}
            onConfirmar={() => void eliminarServicio()}
            procesando={eliminando}
            textoAccion="Sí, eliminar"
            peligro
          />
        </Modal>
      )}
    </div>
  );
}

function Contador({
  valor,
  etiqueta,
  destacado = false,
}: {
  valor: number;
  etiqueta: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`min-w-20 rounded-2xl border px-4 py-2 text-center ${
        destacado
          ? "border-lime-400/25 bg-lime-400/10"
          : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <span
        className={`block text-xl font-black ${
          destacado ? "text-lime-400" : "text-white"
        }`}
      >
        {valor}
      </span>
      <span className="text-xs text-gray-500">{etiqueta}</span>
    </div>
  );
}

function EstadoVacio({
  icono,
  titulo,
  detalle,
}: {
  icono: string;
  titulo: string;
  detalle?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <i className={`${icono} text-4xl text-lime-400`} />
      <p className="mt-3 font-semibold text-white">{titulo}</p>
      {detalle && <p className="mt-2 max-w-lg text-sm text-red-300">{detalle}</p>}
    </div>
  );
}

function Modal({
  titulo,
  onCerrar,
  children,
}: {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onCerrar()}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#151915] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
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

function InputEdicion({
  etiqueta,
  value,
  onChange,
  type = "text",
  maxLength,
  requerido = false,
}: {
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
  maxLength?: number;
  requerido?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-300">{etiqueta}</span>
      <input
        type={type}
        required={requerido}
        min={type === "number" ? "0.01" : undefined}
        step={type === "number" ? "0.01" : undefined}
        maxLength={maxLength}
        className={inputClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PieModal({
  onCancelar,
  onConfirmar,
  procesando,
  textoAccion,
  peligro = false,
}: {
  onCancelar: () => void;
  onConfirmar?: () => void;
  procesando: boolean;
  textoAccion: string;
  peligro?: boolean;
}) {
  return (
    <footer className="flex justify-end gap-3 border-t border-white/[0.08] bg-black/15 px-5 py-4">
      <button
        type="button"
        onClick={onCancelar}
        disabled={procesando}
        className="h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold text-gray-300 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type={onConfirmar ? "button" : "submit"}
        onClick={onConfirmar}
        disabled={procesando}
        className={`h-10 rounded-xl px-5 text-sm font-black disabled:opacity-50 ${
          peligro ? "bg-red-500 text-white" : "bg-lime-400 text-black"
        }`}
      >
        {procesando ? "Procesando..." : textoAccion}
      </button>
    </footer>
  );
}
