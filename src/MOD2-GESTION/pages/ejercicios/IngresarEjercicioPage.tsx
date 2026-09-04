import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { GRUPOS_MUSCULARES, type Ejercicio } from "../../../types/ejercicio";
import {
  apiFetch,
  mensajeErrorDesconocido,
  mensajeErrorHttp,
} from "../../services/api";
import { validarImagen, validarVideo } from "./ejercicioArchivos";

const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-50";

const INICIAL = {
  nombre: "",
  grupoMuscular: "",
  descripcion: "",
};

export default function IngresarEjercicioPage() {
  const [formulario, setFormulario] = useState(INICIAL);
  const [imagen, setImagen] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [duracionVideo, setDuracionVideo] = useState(0);
  const [previewImagen, setPreviewImagen] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [analizandoVideo, setAnalizandoVideo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const inputImagen = useRef<HTMLInputElement>(null);
  const inputVideo = useRef<HTMLInputElement>(null);

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

  function seleccionarImagen(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setExito("");
    const archivo = event.target.files?.[0] ?? null;

    if (!archivo) {
      setImagen(null);
      setPreviewImagen("");
      return;
    }

    const validacion = validarImagen(archivo);
    if (validacion) {
      event.target.value = "";
      setImagen(null);
      setPreviewImagen("");
      setError(validacion);
      return;
    }

    setImagen(archivo);
    setPreviewImagen(URL.createObjectURL(archivo));
  }

  async function seleccionarVideo(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setExito("");
    const input = event.target;
    const archivo = input.files?.[0] ?? null;

    if (!archivo) {
      setVideo(null);
      setDuracionVideo(0);
      setPreviewVideo("");
      return;
    }

    try {
      setAnalizandoVideo(true);
      const validacion = await validarVideo(archivo);
      if (validacion.error) {
        input.value = "";
        setVideo(null);
        setDuracionVideo(0);
        setPreviewVideo("");
        setError(validacion.error);
        return;
      }

      setVideo(archivo);
      setDuracionVideo(validacion.duracion);
      setPreviewVideo(URL.createObjectURL(archivo));
    } finally {
      setAnalizandoVideo(false);
    }
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setExito("");

    if (!imagen) {
      setError("Seleccioná una imagen de vista previa para el ejercicio.");
      return;
    }
    if (!video || !duracionVideo) {
      setError("Seleccioná un video tutorial válido.");
      return;
    }

    const datos = new FormData();
    datos.append("nombre", formulario.nombre.trim());
    datos.append("grupoMuscular", formulario.grupoMuscular);
    datos.append("descripcion", formulario.descripcion.trim());
    datos.append("estado", "true");
    datos.append("imagenPreview", imagen);
    datos.append("videoTutorial", video);
    datos.append("duracionVideoSegundos", duracionVideo.toString());

    try {
      setGuardando(true);
      const respuesta = await apiFetch("ejercicios", {
        method: "POST",
        body: datos,
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo registrar el ejercicio."),
        );
      }

      const ejercicio = (await respuesta.json()) as Ejercicio;
      setFormulario(INICIAL);
      setImagen(null);
      setVideo(null);
      setDuracionVideo(0);
      setPreviewImagen("");
      setPreviewVideo("");
      if (inputImagen.current) inputImagen.current.value = "";
      if (inputVideo.current) inputVideo.current.value = "";
      setExito(`${ejercicio.nombre} quedó registrado correctamente.`);
    } catch (errorDesconocido) {
      setError(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo registrar el ejercicio.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  const bloqueado = guardando || analizandoVideo;

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          Biblioteca de ejercicios
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ingresar ejercicio
        </h1>
        <p className="mt-3 max-w-3xl text-gray-400">
          Cargá cada ejercicio de forma individual, indicá la zona muscular y
          agregá una imagen junto con un tutorial breve para el módulo de clientes.
        </p>
      </header>

      {exito && <Alerta tipo="exito">{exito}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}

      <form
        onSubmit={guardar}
        className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20"
      >
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
          <Campo etiqueta="Nombre del ejercicio" requerido>
            <input
              className={inputClassName}
              value={formulario.nombre}
              onChange={(event) =>
                setFormulario({ ...formulario, nombre: event.target.value })
              }
              minLength={2}
              maxLength={100}
              placeholder="Ej.: Press de banca con barra"
              disabled={bloqueado}
              required
            />
          </Campo>

          <Campo etiqueta="Grupo o zona muscular" requerido>
            <select
              className={inputClassName}
              value={formulario.grupoMuscular}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  grupoMuscular: event.target.value,
                })
              }
              disabled={bloqueado}
              required
            >
              <option value="" disabled>
                Seleccionar grupo muscular
              </option>
              {GRUPOS_MUSCULARES.map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            etiqueta="Imagen de vista previa"
            ayuda="JPG, PNG o WEBP. Máximo 5 MB."
            requerido
          >
            <SelectorArchivo
              icono="ri-image-add-line"
              nombre={imagen?.name ?? "Seleccionar imagen"}
              input={
                <input
                  ref={inputImagen}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={seleccionarImagen}
                  disabled={bloqueado}
                  className="sr-only"
                />
              }
            />
          </Campo>

          <Campo
            etiqueta="Video tutorial"
            ayuda="MP4 o WEBM. Máximo 60 segundos y 30 MB."
            requerido
          >
            <SelectorArchivo
              icono={analizandoVideo ? "ri-loader-4-line animate-spin" : "ri-video-add-line"}
              nombre={
                analizandoVideo
                  ? "Analizando video..."
                  : video
                    ? `${video.name} · ${duracionVideo} s`
                    : "Seleccionar video"
              }
              input={
                <input
                  ref={inputVideo}
                  type="file"
                  accept=".mp4,.webm,video/mp4,video/webm"
                  onChange={(event) => void seleccionarVideo(event)}
                  disabled={bloqueado}
                  className="sr-only"
                />
              }
            />
          </Campo>

          {(previewImagen || previewVideo) && (
            <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
              {previewImagen && (
                <Preview titulo="Vista previa del ejercicio">
                  <img
                    src={previewImagen}
                    alt="Vista previa del ejercicio"
                    className="aspect-video w-full object-cover"
                  />
                  <BotonQuitar
                    texto="Quitar imagen"
                    onClick={() => {
                      setImagen(null);
                      setPreviewImagen("");
                      if (inputImagen.current) inputImagen.current.value = "";
                    }}
                  />
                </Preview>
              )}

              {previewVideo && (
                <Preview titulo={`Tutorial · ${duracionVideo} s`}>
                  <video
                    src={previewVideo}
                    controls
                    muted
                    preload="metadata"
                    className="aspect-video w-full bg-black object-contain"
                  />
                  <BotonQuitar
                    texto="Quitar video"
                    onClick={() => {
                      setVideo(null);
                      setDuracionVideo(0);
                      setPreviewVideo("");
                      if (inputVideo.current) inputVideo.current.value = "";
                    }}
                  />
                </Preview>
              )}
            </div>
          )}

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-gray-200">
              Descripción e indicaciones
            </span>
            <textarea
              className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
              value={formulario.descripcion}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  descripcion: event.target.value.slice(0, 600),
                })
              }
              placeholder="Explicá brevemente la posición inicial, ejecución o cuidados principales..."
              disabled={bloqueado}
            />
            <span className="mt-1.5 block text-right text-xs text-gray-600">
              {formulario.descripcion.length}/600
            </span>
          </label>

        </div>

        <footer className="flex justify-end border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:px-8">
          <button
            type="submit"
            disabled={bloqueado}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-black text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            <i className="ri-add-circle-line text-lg" />
            {guardando ? "Guardando..." : "Registrar ejercicio"}
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
    <div>
      <span className="mb-2 block text-sm font-semibold text-gray-200">
        {etiqueta} {requerido && <span className="text-lime-400">*</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1.5 block text-xs text-gray-500">{ayuda}</span>}
    </div>
  );
}

function SelectorArchivo({
  icono,
  nombre,
  input,
}: {
  icono: string;
  nombre: string;
  input: ReactNode;
}) {
  return (
    <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lime-400/30 bg-lime-400/[0.04] px-4 text-sm text-gray-300 transition hover:border-lime-400/60 hover:bg-lime-400/[0.07]">
      <i className={`${icono} text-xl text-lime-400`} />
      <span className="min-w-0 flex-1 truncate">{nombre}</span>
      {input}
    </label>
  );
}

function Preview({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="border-b border-white/[0.08] px-4 py-3 text-sm font-semibold text-gray-300">
        {titulo}
      </div>
      {children}
    </div>
  );
}

function BotonQuitar({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-2.5 rounded-lg bg-black/75 px-2.5 py-1.5 text-xs font-bold text-red-200 backdrop-blur transition hover:bg-red-500 hover:text-white"
    >
      {texto}
    </button>
  );
}

function Alerta({
  tipo,
  children,
}: {
  tipo: "error" | "exito";
  children: ReactNode;
}) {
  return (
    <div
      className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        tipo === "exito"
          ? "border-lime-400/25 bg-lime-400/10 text-lime-200"
          : "border-red-400/25 bg-red-400/10 text-red-200"
      }`}
    >
      {children}
    </div>
  );
}
