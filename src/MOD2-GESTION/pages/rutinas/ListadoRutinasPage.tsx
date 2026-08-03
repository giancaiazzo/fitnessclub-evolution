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
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";

type Rutina = {
  idRutina: number;
  nombre: string;
  descripcion: string | null;
  nombreArchivoPdf: string;
  cantidadPaginas: number | null;
  tamanoBytes: number | null;
  fechaCarga: string;
  tienePdf: boolean;
  pdfUrl: string | null;
};

type FormularioEdicion = {
  nombre: string;
  descripcion: string;
};

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-60";

function formatearFecha(valor: string) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Montevideo",
      }).format(fecha);
}

function formatearTamano(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function validarPdf(archivo: File) {
  const esPdf =
    archivo.type === "application/pdf" ||
    archivo.name.toLocaleLowerCase().endsWith(".pdf");
  if (!esPdf) return "Seleccioná un archivo en formato PDF.";
  if (archivo.size > MAX_PDF_BYTES) return "El PDF no puede superar los 10 MB.";
  return "";
}

export default function ListadoRutinasPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [rutinaEditar, setRutinaEditar] = useState<Rutina | null>(null);
  const [edicion, setEdicion] = useState<FormularioEdicion | null>(null);
  const [pdfNuevo, setPdfNuevo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [rutinaEliminar, setRutinaEliminar] = useState<Rutina | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [abriendoPdf, setAbriendoPdf] = useState<number | null>(null);
  const cargaInicial = useRef(false);
  const inputPdf = useRef<HTMLInputElement>(null);

  const cargarRutinas = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      const respuesta = await apiFetch("rutinas");
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo cargar el listado de rutinas."),
        );
      }
      setRutinas((await respuesta.json()) as Rutina[]);
    } catch (errorDesconocido) {
      setErrorCarga(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo cargar el listado de rutinas.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (cargaInicial.current) return;
    cargaInicial.current = true;
    void cargarRutinas();
  }, [cargarRutinas]);

  useEffect(() => {
    if (!rutinaEditar && !rutinaEliminar) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [rutinaEditar, rutinaEliminar]);

  const rutinasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-UY");
    if (!termino) return rutinas;
    return rutinas.filter((rutina) =>
      rutina.nombre.toLocaleLowerCase("es-UY").includes(termino),
    );
  }, [busqueda, rutinas]);

  function abrirEdicion(rutina: Rutina) {
    setMensaje("");
    setErrorModal("");
    setRutinaEditar(rutina);
    setEdicion({
      nombre: rutina.nombre,
      descripcion: rutina.descripcion ?? "",
    });
    setPdfNuevo(null);
    if (inputPdf.current) inputPdf.current.value = "";
  }

  function seleccionarPdf(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0] ?? null;
    setErrorModal("");
    if (!archivo) {
      setPdfNuevo(null);
      return;
    }

    const validacion = validarPdf(archivo);
    if (validacion) {
      event.target.value = "";
      setPdfNuevo(null);
      setErrorModal(validacion);
      return;
    }

    setPdfNuevo(archivo);
  }

  async function verPdf(rutina: Rutina) {
    const ventana = window.open("", "_blank");
    if (!ventana) {
      setMensaje("El navegador bloqueó la nueva pestaña. Permití ventanas emergentes e intentá nuevamente.");
      return;
    }

    try {
      setAbriendoPdf(rutina.idRutina);
      setMensaje("");
      ventana.document.title = `Abriendo ${rutina.nombre}...`;
      const respuesta = await apiFetch(`rutinas/${rutina.idRutina}/pdf`);
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo abrir el PDF."),
        );
      }

      const url = URL.createObjectURL(await respuesta.blob());
      ventana.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (errorDesconocido) {
      ventana.close();
      setMensaje(
        mensajeErrorDesconocido(errorDesconocido, "No se pudo abrir el PDF."),
      );
    } finally {
      setAbriendoPdf(null);
    }
  }

  async function guardarEdicion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rutinaEditar || !edicion) return;
    setErrorModal("");

    if (!rutinaEditar.tienePdf && !pdfNuevo) {
      setErrorModal(
        "Esta rutina todavía no tiene un PDF almacenado. Seleccioná uno para actualizarla.",
      );
      return;
    }

    const datos = new FormData();
    datos.append("nombre", edicion.nombre.trim());
    datos.append("descripcion", edicion.descripcion.trim());
    if (pdfNuevo) datos.append("pdf", pdfNuevo);

    try {
      setGuardando(true);
      const respuesta = await apiFetch(`rutinas/${rutinaEditar.idRutina}`, {
        method: "PUT",
        body: datos,
      });
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudieron guardar los cambios."),
        );
      }

      const actualizada = (await respuesta.json()) as Rutina;
      setRutinas((actuales) =>
        actuales.map((rutina) =>
          rutina.idRutina === actualizada.idRutina ? actualizada : rutina,
        ),
      );
      setRutinaEditar(null);
      setEdicion(null);
      setPdfNuevo(null);
      setMensaje(`${actualizada.nombre} fue actualizada correctamente.`);
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

  async function eliminarRutina() {
    if (!rutinaEliminar) return;
    try {
      setEliminando(true);
      setErrorModal("");
      const respuesta = await apiFetch(`rutinas/${rutinaEliminar.idRutina}`, {
        method: "DELETE",
      });
      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo eliminar la rutina."),
        );
      }

      setRutinas((actuales) =>
        actuales.filter((rutina) => rutina.idRutina !== rutinaEliminar.idRutina),
      );
      setMensaje(`${rutinaEliminar.nombre} fue eliminada.`);
      setRutinaEliminar(null);
    } catch (errorDesconocido) {
      setErrorModal(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo eliminar la rutina.",
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
            Gestión de rutinas
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Listado de rutinas
          </h1>
          <p className="mt-3 text-gray-400">
            Visualizá los PDF y administrá las rutinas registradas.
          </p>
        </div>
        <div className="flex gap-3">
          <Contador valor={rutinas.length} etiqueta="Total" />
          <Contador
            valor={rutinas.filter((rutina) => rutina.tienePdf).length}
            etiqueta="Con PDF"
            destacado
          />
        </div>
      </header>

      {mensaje && (
        <div className="mb-5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-200">
          <i className="ri-information-line mr-2 text-lg text-lime-400" />
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
              placeholder="Buscar rutina por nombre..."
            />
          </label>
          <button
            type="button"
            onClick={() => void cargarRutinas()}
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
            titulo="Cargando rutinas..."
          />
        ) : rutinasFiltradas.length === 0 ? (
          <EstadoVacio
            icono="ri-file-search-line"
            titulo={
              rutinas.length
                ? "No se encontraron coincidencias"
                : "No hay rutinas registradas"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {["ID", "Rutina", "Archivo", "Páginas", "Tamaño", "Carga", "Acciones"].map(
                    (encabezado) => (
                      <th key={encabezado} className="px-5 py-4 font-bold">
                        {encabezado}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {rutinasFiltradas.map((rutina) => (
                  <tr
                    key={rutina.idRutina}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 text-sm font-black text-lime-400">
                      #{rutina.idRutina}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{rutina.nombre}</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                        {rutina.descripcion || "Sin descripción"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-56 items-center gap-2">
                        <i className="ri-file-pdf-2-line text-xl text-red-400" />
                        <span className="truncate text-sm text-gray-300">
                          {rutina.nombreArchivoPdf || "Sin archivo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {rutina.cantidadPaginas ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {formatearTamano(rutina.tamanoBytes)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {formatearFecha(rutina.fechaCarga)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void verPdf(rutina)}
                          disabled={!rutina.tienePdf || abriendoPdf === rutina.idRutina}
                          className="rounded-lg border border-blue-400/25 bg-blue-400/10 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <i className="ri-eye-line mr-1" />
                          {abriendoPdf === rutina.idRutina ? "Abriendo..." : "Ver PDF"}
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEdicion(rutina)}
                          className="rounded-lg border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs font-bold text-lime-300 transition hover:bg-lime-400 hover:text-black"
                        >
                          <i className="ri-pencil-line mr-1" /> Modificar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMensaje("");
                            setErrorModal("");
                            setRutinaEliminar(rutina);
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

      {rutinaEditar && edicion && (
        <Modal
          titulo={`Modificar rutina #${rutinaEditar.idRutina}`}
          onCerrar={() => !guardando && setRutinaEditar(null)}
        >
          <form onSubmit={guardarEdicion}>
            <div className="grid gap-4 p-5 sm:p-6">
              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  Nombre
                </span>
                <input
                  className={inputClassName}
                  value={edicion.nombre}
                  onChange={(event) =>
                    setEdicion({ ...edicion, nombre: event.target.value })
                  }
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
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

              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  PDF actual
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <i className="ri-file-pdf-2-line text-3xl text-red-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {rutinaEditar.nombreArchivoPdf || "Sin PDF almacenado"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {rutinaEditar.cantidadPaginas ?? "—"} páginas ·{" "}
                      {formatearTamano(rutinaEditar.tamanoBytes)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-semibold text-gray-300">
                  {rutinaEditar.tienePdf ? "Reemplazar PDF" : "Cargar PDF"}
                </span>
                <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-lime-400/30 px-4 transition hover:bg-lime-400/[0.05]">
                  <i className="ri-upload-cloud-2-line text-2xl text-lime-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-200">
                      {pdfNuevo?.name ?? "Seleccionar un PDF nuevo"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Máximo 10 páginas y 10 MB
                    </p>
                  </div>
                  <input
                    ref={inputPdf}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={seleccionarPdf}
                    className="sr-only"
                  />
                </label>
              </div>

              {errorModal && (
                <p className="rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">
                  {errorModal}
                </p>
              )}
            </div>
            <PieModal
              onCancelar={() => setRutinaEditar(null)}
              procesando={guardando}
              textoAccion="Guardar cambios"
            />
          </form>
        </Modal>
      )}

      {rutinaEliminar && (
        <Modal
          titulo="Confirmar eliminación"
          onCerrar={() => !eliminando && setRutinaEliminar(null)}
        >
          <div className="p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-2xl text-red-400">
              <i className="ri-delete-bin-line" />
            </div>
            <p className="leading-7 text-gray-300">
              ¿Seguro que querés eliminar la rutina{" "}
              <strong className="text-white">{rutinaEliminar.nombre}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              También se eliminará de la base de datos el PDF almacenado.
            </p>
            {errorModal && (
              <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">
                {errorModal}
              </p>
            )}
          </div>
          <PieModal
            onCancelar={() => setRutinaEliminar(null)}
            onConfirmar={() => void eliminarRutina()}
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
