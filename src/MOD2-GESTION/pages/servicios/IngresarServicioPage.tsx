import {
  useEffect,
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

const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
const TIPOS_IMAGEN = new Set(["image/jpeg", "image/png", "image/webp"]);

const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-50";

const INICIAL = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion: "1 mes",
};

export default function IngresarServicioPage() {
  const [formulario, setFormulario] = useState(INICIAL);
  const [imagen, setImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const inputImagen = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  function seleccionarImagen(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setExito("");
    const archivo = event.target.files?.[0] ?? null;

    if (!archivo) {
      setImagen(null);
      setVistaPrevia("");
      return;
    }

    if (!TIPOS_IMAGEN.has(archivo.type)) {
      event.target.value = "";
      setImagen(null);
      setVistaPrevia("");
      setError("La imagen debe estar en formato JPG, PNG o WEBP.");
      return;
    }

    if (archivo.size > MAX_IMAGEN_BYTES) {
      event.target.value = "";
      setImagen(null);
      setVistaPrevia("");
      setError("La imagen no puede superar los 5 MB.");
      return;
    }

    setImagen(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setExito("");

    const precio = Number(formulario.precio.replace(",", "."));
    if (!Number.isFinite(precio) || precio <= 0) {
      setError("Ingresá un precio mayor a cero.");
      return;
    }

    const datos = new FormData();
    datos.append("nombre", formulario.nombre.trim());
    datos.append("descripcion", formulario.descripcion.trim());
    datos.append("precio", precio.toString());
    datos.append("duracion", formulario.duracion.trim());
    if (imagen) datos.append("imagen", imagen);

    try {
      setGuardando(true);
      const respuesta = await apiFetch("servicios", {
        method: "POST",
        body: datos,
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo registrar el servicio."),
        );
      }

      const servicio = (await respuesta.json()) as { nombre: string };
      setFormulario(INICIAL);
      setImagen(null);
      setVistaPrevia("");
      if (inputImagen.current) inputImagen.current.value = "";
      setExito(`${servicio.nombre} quedó registrado correctamente.`);
    } catch (errorDesconocido) {
      setError(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo registrar el servicio.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          Gestión de servicios
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ingresar servicio
        </h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Cargá la información comercial y una imagen para promocionar el servicio.
        </p>
      </header>

      {exito && <Alerta tipo="exito">{exito}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}

      <form
        onSubmit={guardar}
        className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20"
      >
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
          <Campo etiqueta="Nombre" requerido>
            <input
              className={inputClassName}
              value={formulario.nombre}
              onChange={(event) =>
                setFormulario({ ...formulario, nombre: event.target.value })
              }
              minLength={2}
              maxLength={80}
              placeholder="Ej.: Cuota mensual musculación"
              disabled={guardando}
              required
            />
          </Campo>

          <Campo etiqueta="Precio (UYU)" requerido>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={inputClassName}
              value={formulario.precio}
              onChange={(event) =>
                setFormulario({ ...formulario, precio: event.target.value })
              }
              placeholder="Ej.: 1500"
              disabled={guardando}
              required
            />
          </Campo>

          <Campo etiqueta="Duración" ayuda="Ej.: 1 mes">
            <input
              className={inputClassName}
              value={formulario.duracion}
              onChange={(event) =>
                setFormulario({ ...formulario, duracion: event.target.value })
              }
              maxLength={50}
              disabled={guardando}
            />
          </Campo>

          <Campo
            etiqueta="Imagen promocional"
            ayuda="JPG, PNG o WEBP. Máximo 5 MB."
          >
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lime-400/30 bg-lime-400/[0.04] px-4 text-sm text-gray-300 transition hover:border-lime-400/60 hover:bg-lime-400/[0.07]">
              <i className="ri-image-add-line text-xl text-lime-400" />
              <span className="min-w-0 flex-1 truncate">
                {imagen?.name ?? "Seleccionar imagen"}
              </span>
              <input
                ref={inputImagen}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={seleccionarImagen}
                disabled={guardando}
                className="sr-only"
              />
            </label>
          </Campo>

          {vistaPrevia && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 sm:col-span-2">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                <span className="text-sm font-semibold text-gray-300">Vista previa</span>
                <button
                  type="button"
                  onClick={() => {
                    setImagen(null);
                    setVistaPrevia("");
                    if (inputImagen.current) inputImagen.current.value = "";
                  }}
                  disabled={guardando}
                  className="text-xs font-bold text-red-300 transition hover:text-red-200"
                >
                  Quitar imagen
                </button>
              </div>
              <img
                src={vistaPrevia}
                alt="Vista previa del servicio"
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-gray-200">
              Descripción
            </span>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
              value={formulario.descripcion}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  descripcion: event.target.value.slice(0, 500),
                })
              }
              placeholder="Detalle opcional del servicio..."
              disabled={guardando}
            />
            <span className="mt-1.5 block text-right text-xs text-gray-600">
              {formulario.descripcion.length}/500
            </span>
          </label>
        </div>

        <footer className="flex justify-end border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:px-8">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-black text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            <i className="ri-add-circle-line text-lg" />
            {guardando ? "Guardando..." : "Registrar servicio"}
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
