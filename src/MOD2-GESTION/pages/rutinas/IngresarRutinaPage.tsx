import {
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

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15 disabled:opacity-50";

type RutinaCreada = {
  nombre: string;
  cantidadPaginas: number | null;
};

export default function IngresarRutinaPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const inputPdf = useRef<HTMLInputElement>(null);

  function seleccionarPdf(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setExito("");
    const archivo = event.target.files?.[0] ?? null;

    if (!archivo) {
      setPdf(null);
      return;
    }

    const esPdf =
      archivo.type === "application/pdf" ||
      archivo.name.toLocaleLowerCase().endsWith(".pdf");

    if (!esPdf) {
      event.target.value = "";
      setPdf(null);
      setError("Seleccioná un archivo en formato PDF.");
      return;
    }

    if (archivo.size > MAX_PDF_BYTES) {
      event.target.value = "";
      setPdf(null);
      setError("El PDF no puede superar los 10 MB.");
      return;
    }

    setPdf(archivo);
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setExito("");

    if (!pdf) {
      setError("Seleccioná el PDF de la rutina.");
      return;
    }

    const datos = new FormData();
    datos.append("nombre", nombre.trim());
    datos.append("descripcion", descripcion.trim());
    datos.append("pdf", pdf);

    try {
      setGuardando(true);
      const respuesta = await apiFetch("rutinas", {
        method: "POST",
        body: datos,
      });

      if (!respuesta.ok) {
        throw new Error(
          await mensajeErrorHttp(respuesta, "No se pudo registrar la rutina."),
        );
      }

      const rutina = (await respuesta.json()) as RutinaCreada;
      setNombre("");
      setDescripcion("");
      setPdf(null);
      if (inputPdf.current) inputPdf.current.value = "";
      setExito(
        `${rutina.nombre} quedó registrada con ${rutina.cantidadPaginas ?? "sus"} página${
          rutina.cantidadPaginas === 1 ? "" : "s"
        }.`,
      );
    } catch (errorDesconocido) {
      setError(
        mensajeErrorDesconocido(
          errorDesconocido,
          "No se pudo registrar la rutina.",
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
          Gestión de rutinas
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ingresar rutina
        </h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Guardá la rutina completa en PDF. El sistema comprobará el archivo antes de
          almacenarlo.
        </p>
      </header>

      {exito && <Alerta tipo="exito">{exito}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}

      <form
        onSubmit={guardar}
        className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20"
      >
        <div className="grid gap-5 p-5 sm:p-8">
          <Campo etiqueta="Nombre de la rutina" requerido>
            <input
              className={inputClassName}
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              minLength={2}
              maxLength={100}
              placeholder="Ej.: Adaptación inicial - hombres"
              disabled={guardando}
              required
            />
          </Campo>

          <Campo etiqueta="Descripción">
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value.slice(0, 500))}
              placeholder="Objetivo, nivel o indicaciones generales de la rutina..."
              disabled={guardando}
            />
            <span className="mt-1.5 block text-right text-xs text-gray-600">
              {descripcion.length}/500
            </span>
          </Campo>

          <Campo
            etiqueta="Archivo de la rutina"
            ayuda="Solo PDF, máximo 10 páginas y 10 MB."
            requerido
          >
            <label className="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-lime-400/30 bg-lime-400/[0.04] p-6 text-center transition hover:border-lime-400/60 hover:bg-lime-400/[0.07]">
              <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl text-lime-400 transition group-hover:bg-lime-400 group-hover:text-black">
                <i className={pdf ? "ri-file-pdf-2-line" : "ri-upload-cloud-2-line"} />
              </span>
              <span className="font-semibold text-white">
                {pdf ? pdf.name : "Seleccionar PDF"}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                {pdf
                  ? `${(pdf.size / 1024 / 1024).toFixed(2)} MB`
                  : "Hacé clic para buscar el archivo"}
              </span>
              <input
                ref={inputPdf}
                type="file"
                accept=".pdf,application/pdf"
                onChange={seleccionarPdf}
                disabled={guardando}
                className="sr-only"
                required={!pdf}
              />
            </label>
            {pdf && (
              <button
                type="button"
                onClick={() => {
                  setPdf(null);
                  if (inputPdf.current) inputPdf.current.value = "";
                }}
                disabled={guardando}
                className="mt-2 text-xs font-bold text-red-300 transition hover:text-red-200"
              >
                Quitar archivo
              </button>
            )}
          </Campo>
        </div>

        <footer className="flex justify-end border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:px-8">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-black text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            <i className="ri-file-add-line text-lg" />
            {guardando ? "Validando y guardando..." : "Registrar rutina"}
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
