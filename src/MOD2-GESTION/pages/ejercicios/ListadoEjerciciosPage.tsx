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
  GRUPOS_MUSCULARES,
  formatearDuracion,
  type Ejercicio,
} from "../../../types/ejercicio";
import {
  apiFetch,
  apiUrl,
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";
import { validarImagen, validarVideo } from "./ejercicioArchivos";

type FormularioEdicion = {
  nombre: string;
  grupoMuscular: string;
  descripcion: string;
  estado: boolean;
};

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-60";

export default function ListadoEjerciciosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ejercicioEditar, setEjercicioEditar] = useState<Ejercicio | null>(null);
  const [edicion, setEdicion] = useState<FormularioEdicion | null>(null);
  const [imagenNueva, setImagenNueva] = useState<File | null>(null);
  const [videoNuevo, setVideoNuevo] = useState<File | null>(null);
  const [duracionVideoNueva, setDuracionVideoNueva] = useState(0);
  const [previewImagen, setPreviewImagen] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [analizandoVideo, setAnalizandoVideo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [ejercicioEliminar, setEjercicioEliminar] = useState<Ejercicio | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [ejercicioVideo, setEjercicioVideo] = useState<Ejercicio | null>(null);
  const cargaInicial = useRef(false);
  const inputImagen = useRef<HTMLInputElement>(null);
  const inputVideo = useRef<HTMLInputElement>(null);

  const cargarEjercicios = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      const respuesta = await apiFetch("ejercicios?incluirInactivos=true");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(
            respuesta,
            "No se pudo cargar el listado de ejercicios.",
          ),
        );
      }
      setEjercicios((await respuesta.json()) as Ejercicio[]);
    } catch (errorDesconocido) {
      setErrorCarga(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo cargar el listado de ejercicios.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (cargaInicial.current) return;
    cargaInicial.current = true;
    void cargarEjercicios();
  }, [cargarEjercicios]);

  useEffect(() => {
    const hayModal = ejercicioEditar || ejercicioEliminar || ejercicioVideo;
    if (!hayModal) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [ejercicioEditar, ejercicioEliminar, ejercicioVideo]);

  useEffect(() => {
    return () => {
      if (previewImagen) URL.revokeObjectURL(previewImagen);
    };
  }, [previewImagen]);

  useEffect(() => {
    return () => {
      if (previewVideo) URL.revokeObjectURL(previewVideo);
    };
  }, [previewVideo]);

  const ejerciciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-UY");
    if (!termino) return ejercicios;
    return ejercicios.filter((ejercicio) =>
      [ejercicio.nombre, ejercicio.grupoMuscular, ejercicio.descripcion ?? ""]
        .join(" ")
        .toLocaleLowerCase("es-UY")
        .includes(termino),
    );
  }, [busqueda, ejercicios]);

  function abrirEdicion(ejercicio: Ejercicio) {
    setMensaje("");
    setErrorModal("");
    setEjercicioEditar(ejercicio);
    setEdicion({
      nombre: ejercicio.nombre,
      grupoMuscular: ejercicio.grupoMuscular,
      descripcion: ejercicio.descripcion ?? "",
      estado: ejercicio.estado,
    });
    setImagenNueva(null);
    setVideoNuevo(null);
    setDuracionVideoNueva(0);
    setPreviewImagen("");
    setPreviewVideo("");
    if (inputImagen.current) inputImagen.current.value = "";
    if (inputVideo.current) inputVideo.current.value = "";
  }

  function seleccionarImagen(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0] ?? null;
    setErrorModal("");
    if (!archivo) {
      setImagenNueva(null);
      setPreviewImagen("");
      return;
    }

    const validacion = validarImagen(archivo);
    if (validacion) {
      event.target.value = "";
      setImagenNueva(null);
      setPreviewImagen("");
      setErrorModal(validacion);
      return;
    }

    setImagenNueva(archivo);
    setPreviewImagen(URL.createObjectURL(archivo));
  }

  async function seleccionarVideo(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const archivo = input.files?.[0] ?? null;
    setErrorModal("");
    if (!archivo) {
      setVideoNuevo(null);
      setDuracionVideoNueva(0);
      setPreviewVideo("");
      return;
    }

    try {
      setAnalizandoVideo(true);
      const validacion = await validarVideo(archivo);
      if (validacion.error) {
        input.value = "";
        setVideoNuevo(null);
        setDuracionVideoNueva(0);
        setPreviewVideo("");
        setErrorModal(validacion.error);
        return;
      }

      setVideoNuevo(archivo);
      setDuracionVideoNueva(validacion.duracion);
      setPreviewVideo(URL.createObjectURL(archivo));
    } finally {
      setAnalizandoVideo(false);
    }
  }

  async function guardarEdicion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ejercicioEditar || !edicion) return;
    setErrorModal("");

    const datos = new FormData();
    datos.append("nombre", edicion.nombre.trim());
    datos.append("grupoMuscular", edicion.grupoMuscular);
    datos.append("descripcion", edicion.descripcion.trim());
    datos.append("estado", edicion.estado.toString());
    if (imagenNueva) datos.append("imagenPreview", imagenNueva);
    if (videoNuevo) {
      datos.append("videoTutorial", videoNuevo);
      datos.append("duracionVideoSegundos", duracionVideoNueva.toString());
    }

    try {
      setGuardando(true);
      const respuesta = await apiFetch(
        `ejercicios/${ejercicioEditar.idEjercicio}`,
        { method: "PUT", body: datos },
      );

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudieron guardar los cambios."),
        );
      }

      const actualizado = (await respuesta.json()) as Ejercicio;
      setEjercicios((actuales) =>
        actuales.map((ejercicio) =>
          ejercicio.idEjercicio === actualizado.idEjercicio
            ? actualizado
            : ejercicio,
        ),
      );
      setEjercicioEditar(null);
      setEdicion(null);
      setImagenNueva(null);
      setVideoNuevo(null);
      setPreviewImagen("");
      setPreviewVideo("");
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

  async function eliminarEjercicio() {
    if (!ejercicioEliminar) return;
    try {
      setEliminando(true);
      setErrorModal("");
      const respuesta = await apiFetch(
        `ejercicios/${ejercicioEliminar.idEjercicio}`,
        { method: "DELETE" },
      );
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo eliminar el ejercicio."),
        );
      }

      setEjercicios((actuales) =>
        actuales.filter(
          (ejercicio) => ejercicio.idEjercicio !== ejercicioEliminar.idEjercicio,
        ),
      );
      setMensaje(`${ejercicioEliminar.nombre} fue eliminado.`);
      setEjercicioEliminar(null);
    } catch (errorDesconocido) {
      setErrorModal(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo eliminar el ejercicio.",
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
            Biblioteca de ejercicios
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Listado de ejercicios
          </h1>
          <p className="mt-3 text-gray-400">
            Consultá, modificá o eliminá los ejercicios y sus tutoriales.
          </p>
        </div>
        <div className="flex gap-3">
          <Contador valor={ejercicios.length} etiqueta="Total" />
          <Contador
            valor={ejercicios.filter((ejercicio) => ejercicio.estado).length}
            etiqueta="Visibles"
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
              placeholder="Buscar por nombre o grupo muscular..."
            />
          </label>
          <button
            type="button"
            onClick={() => void cargarEjercicios()}
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
            titulo="Cargando ejercicios..."
          />
        ) : ejerciciosFiltrados.length === 0 ? (
          <EstadoVacio
            icono="ri-boxing-line"
            titulo={
              ejercicios.length
                ? "No se encontraron coincidencias"
                : "No hay ejercicios registrados"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {[
                    "ID",
                    "Preview",
                    "Ejercicio",
                    "Grupo muscular",
                    "Tutorial",
                    "Estado",
                    "Acciones",
                  ].map((encabezado) => (
                    <th key={encabezado} className="px-5 py-4 font-bold">
                      {encabezado}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {ejerciciosFiltrados.map((ejercicio) => (
                  <tr
                    key={ejercicio.idEjercicio}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 text-sm font-black text-lime-400">
                      #{ejercicio.idEjercicio}
                    </td>
                    <td className="px-5 py-4">
                      {ejercicio.tieneImagenPreview ? (
                        <img
                          src={apiUrl(
                            `ejercicios/${ejercicio.idEjercicio}/imagen`,
                          )}
                          crossOrigin="use-credentials"
                          alt={ejercicio.nombre}
                          className="h-16 w-24 rounded-xl border border-white/10 object-cover"
                        />
                      ) : (
                        <SinMultimedia icono="ri-image-line" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{ejercicio.nombre}</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                        {ejercicio.descripcion || "Sin descripción"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-300">
                        {ejercicio.grupoMuscular}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {ejercicio.tieneVideoTutorial ? (
                        <button
                          type="button"
                          onClick={() => setEjercicioVideo(ejercicio)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 transition hover:border-lime-400/30 hover:text-lime-300"
                        >
                          <i className="ri-play-circle-line text-lg text-lime-400" />
                          {formatearDuracion(ejercicio.duracionVideoSegundos)}
                        </button>
                      ) : (
                        <span className="text-xs text-amber-300">Sin tutorial</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                          ejercicio.estado
                            ? "bg-lime-400/10 text-lime-300"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            ejercicio.estado ? "bg-lime-400" : "bg-gray-500"
                          }`}
                        />
                        {ejercicio.estado ? "Visible" : "Oculto"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(ejercicio)}
                          className="rounded-lg border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs font-bold text-lime-300 transition hover:bg-lime-400 hover:text-black"
                        >
                          <i className="ri-pencil-line mr-1" /> Modificar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMensaje("");
                            setErrorModal("");
                            setEjercicioEliminar(ejercicio);
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

      {ejercicioEditar && edicion && (
        <Modal
          titulo={`Modificar ejercicio #${ejercicioEditar.idEjercicio}`}
          onCerrar={() => !guardando && setEjercicioEditar(null)}
          ancho="max-w-3xl"
        >
          <form onSubmit={guardarEdicion}>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <InputEdicion
                etiqueta="Nombre"
                value={edicion.nombre}
                onChange={(valor) => setEdicion({ ...edicion, nombre: valor })}
                maxLength={100}
                requerido
              />

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  Grupo muscular
                </span>
                <select
                  className={inputClassName}
                  value={edicion.grupoMuscular}
                  onChange={(event) =>
                    setEdicion({
                      ...edicion,
                      grupoMuscular: event.target.value,
                    })
                  }
                  required
                >
                  {!GRUPOS_MUSCULARES.includes(
                    edicion.grupoMuscular as (typeof GRUPOS_MUSCULARES)[number],
                  ) && (
                    <option value={edicion.grupoMuscular}>
                      {edicion.grupoMuscular}
                    </option>
                  )}
                  {GRUPOS_MUSCULARES.map((grupo) => (
                    <option key={grupo} value={grupo}>
                      {grupo}
                    </option>
                  ))}
                </select>
              </label>

              <SelectorEdicion
                etiqueta="Reemplazar imagen"
                icono="ri-image-add-line"
                nombre={imagenNueva?.name ?? "Conservar imagen actual"}
              >
                <input
                  ref={inputImagen}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={seleccionarImagen}
                  className="sr-only"
                />
              </SelectorEdicion>

              <SelectorEdicion
                etiqueta="Reemplazar tutorial"
                icono={
                  analizandoVideo
                    ? "ri-loader-4-line animate-spin"
                    : "ri-video-add-line"
                }
                nombre={
                  analizandoVideo
                    ? "Analizando video..."
                    : videoNuevo
                      ? `${videoNuevo.name} · ${duracionVideoNueva} s`
                      : "Conservar video actual"
                }
              >
                <input
                  ref={inputVideo}
                  type="file"
                  accept=".mp4,.webm,video/mp4,video/webm"
                  onChange={(event) => void seleccionarVideo(event)}
                  disabled={analizandoVideo}
                  className="sr-only"
                />
              </SelectorEdicion>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  Descripción e indicaciones
                </span>
                <textarea
                  value={edicion.descripcion}
                  onChange={(event) =>
                    setEdicion({
                      ...edicion,
                      descripcion: event.target.value.slice(0, 600),
                    })
                  }
                  className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-lime-400/70"
                />
              </label>

              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                {(previewImagen || ejercicioEditar.tieneImagenPreview) && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                    <p className="border-b border-white/10 px-3 py-2 text-xs font-bold text-gray-400">
                      Imagen de vista previa
                    </p>
                    <img
                      src={
                        previewImagen ||
                        apiUrl(
                          `ejercicios/${ejercicioEditar.idEjercicio}/imagen`,
                        )
                      }
                      crossOrigin={previewImagen ? undefined : "use-credentials"}
                      alt={ejercicioEditar.nombre}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                )}

                {(previewVideo || ejercicioEditar.tieneVideoTutorial) && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                    <p className="border-b border-white/10 px-3 py-2 text-xs font-bold text-gray-400">
                      Video tutorial
                    </p>
                    <video
                      key={previewVideo || ejercicioEditar.idEjercicio}
                      src={
                        previewVideo ||
                        apiUrl(`ejercicios/${ejercicioEditar.idEjercicio}/video`)
                      }
                      crossOrigin={previewVideo ? undefined : "use-credentials"}
                      controls
                      preload="metadata"
                      className="aspect-video w-full bg-black object-contain"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={edicion.estado}
                  onChange={(event) =>
                    setEdicion({ ...edicion, estado: event.target.checked })
                  }
                  className="size-5 accent-lime-400"
                />
                <span className="text-sm font-semibold text-gray-300">
                  Visible en el módulo de clientes
                </span>
              </label>

              {errorModal && (
                <p className="sm:col-span-2 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">
                  {errorModal}
                </p>
              )}
            </div>
            <PieModal
              onCancelar={() => setEjercicioEditar(null)}
              procesando={guardando || analizandoVideo}
              textoAccion="Guardar cambios"
            />
          </form>
        </Modal>
      )}

      {ejercicioEliminar && (
        <Modal
          titulo="Confirmar eliminación"
          onCerrar={() => !eliminando && setEjercicioEliminar(null)}
        >
          <div className="p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-2xl text-red-400">
              <i className="ri-delete-bin-line" />
            </div>
            <p className="leading-7 text-gray-300">
              ¿Seguro que querés eliminar el ejercicio{" "}
              <strong className="text-white">{ejercicioEliminar.nombre}</strong>?
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              También se eliminarán de la base de datos su imagen y su video tutorial.
            </p>
            {errorModal && (
              <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">
                {errorModal}
              </p>
            )}
          </div>
          <PieModal
            onCancelar={() => setEjercicioEliminar(null)}
            onConfirmar={() => void eliminarEjercicio()}
            procesando={eliminando}
            textoAccion="Sí, eliminar"
            peligro
          />
        </Modal>
      )}

      {ejercicioVideo && (
        <Modal
          titulo={ejercicioVideo.nombre}
          onCerrar={() => setEjercicioVideo(null)}
          ancho="max-w-3xl"
        >
          <div className="p-4 sm:p-6">
            <video
              src={apiUrl(`ejercicios/${ejercicioVideo.idEjercicio}/video`)}
              crossOrigin="use-credentials"
              controls
              autoPlay
              preload="metadata"
              poster={
                ejercicioVideo.tieneImagenPreview
                  ? apiUrl(`ejercicios/${ejercicioVideo.idEjercicio}/imagen`)
                  : undefined
              }
              className="aspect-video w-full rounded-2xl bg-black object-contain"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-300">
                {ejercicioVideo.grupoMuscular}
              </span>
              <span className="text-sm text-gray-500">
                {formatearDuracion(ejercicioVideo.duracionVideoSegundos)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SinMultimedia({ icono }: { icono: string }) {
  return (
    <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-2xl text-gray-600">
      <i className={icono} />
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
  ancho = "max-w-2xl",
}: {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onCerrar()}
    >
      <section
        role="dialog"
        aria-modal="true"
        className={`max-h-[92vh] w-full ${ancho} overflow-y-auto rounded-3xl border border-white/10 bg-[#151915] shadow-2xl`}
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
  maxLength,
  requerido = false,
}: {
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  maxLength?: number;
  requerido?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-300">{etiqueta}</span>
      <input
        required={requerido}
        maxLength={maxLength}
        className={inputClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectorEdicion({
  etiqueta,
  icono,
  nombre,
  children,
}: {
  etiqueta: string;
  icono: string;
  nombre: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-gray-300">
        {etiqueta}
      </span>
      <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-lime-400/30 px-3 text-sm text-gray-300">
        <i className={`${icono} text-lime-400`} />
        <span className="min-w-0 flex-1 truncate">{nombre}</span>
        {children}
      </label>
    </div>
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
