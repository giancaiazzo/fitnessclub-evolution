import { useEffect, useMemo, useState } from "react";
import Layout from "../layouts/Layout";
import { apiFetch, apiUrl, mensajeErrorHttp } from "../MOD2-GESTION/services/api";
import {
  ORDEN_GRUPOS_MUSCULARES,
  formatearDuracion,
  type Ejercicio,
} from "../types/ejercicio";
import { siteData } from "../MOD1-CLIENTES/data/siteData";

const TODOS = "Todos";

export default function ExercisesPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [grupoActivo, setGrupoActivo] = useState(TODOS);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] =
    useState<Ejercicio | null>(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const respuesta = await apiFetch("ejercicios", {
          signal: controlador.signal,
        });
        if (!respuesta.ok) {
          throw new Error(
            await mensajeErrorHttp(
              respuesta,
              "No se pudo cargar la biblioteca de ejercicios.",
            ),
          );
        }
        setEjercicios((await respuesta.json()) as Ejercicio[]);
      } catch (errorDesconocido) {
        if (controlador.signal.aborted) return;
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar la biblioteca de ejercicios.",
        );
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    void cargar();
    return () => controlador.abort();
  }, []);

  useEffect(() => {
    if (!ejercicioSeleccionado) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEjercicioSeleccionado(null);
    };
    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [ejercicioSeleccionado]);

  const grupos = useMemo(() => {
    const agrupados = new Map<string, Ejercicio[]>();
    for (const ejercicio of ejercicios) {
      const grupo = ejercicio.grupoMuscular.trim() || "Sin clasificar";
      agrupados.set(grupo, [...(agrupados.get(grupo) ?? []), ejercicio]);
    }

    return [...agrupados.entries()]
      .map(([nombre, items]) => ({
        nombre,
        ejercicios: items.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es-UY"),
        ),
      }))
      .sort((a, b) => {
        const indiceA = ORDEN_GRUPOS_MUSCULARES.indexOf(a.nombre);
        const indiceB = ORDEN_GRUPOS_MUSCULARES.indexOf(b.nombre);
        if (indiceA === -1 && indiceB === -1) {
          return a.nombre.localeCompare(b.nombre, "es-UY");
        }
        if (indiceA === -1) return 1;
        if (indiceB === -1) return -1;
        return indiceA - indiceB;
      });
  }, [ejercicios]);

  const gruposVisibles =
    grupoActivo === TODOS
      ? grupos
      : grupos.filter((grupo) => grupo.nombre === grupoActivo);

  return (
    <Layout
      title={`Ejercicios - ${siteData.name}`}
      description="Biblioteca de ejercicios de FitnessClubEvolution organizada por grupo muscular, con imágenes y videos tutoriales"
    >
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-card to-background pb-14 pt-28 sm:pb-20 sm:pt-32">
        <div className="background-dot-grid background-dot-grid--exercises pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <i className="ri-play-circle-line text-lg" aria-hidden="true" />
              Biblioteca visual de entrenamiento
            </span>
            <h1 className="mt-6 text-balance text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Ejercicios explicados de forma clara y visual
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Explorá los ejercicios por zona muscular. Tocá una imagen para abrir
              el tutorial y repasar la ejecución antes de entrenar.
            </p>

            {!cargando && !error && ejercicios.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                <DatoHero
                  icono="ri-boxing-line"
                  valor={ejercicios.length}
                  etiqueta={ejercicios.length === 1 ? "ejercicio" : "ejercicios"}
                />
                <DatoHero
                  icono="ri-layout-grid-line"
                  valor={grupos.length}
                  etiqueta={grupos.length === 1 ? "grupo muscular" : "grupos musculares"}
                />
                <DatoHero
                  icono="ri-video-line"
                  valor={ejercicios.filter((item) => item.tieneVideoTutorial).length}
                  etiqueta="tutoriales"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <Estado
              icono="ri-loader-4-line animate-spin"
              titulo="Cargando ejercicios..."
              detalle="Estamos preparando la biblioteca visual."
            />
          ) : error ? (
            <Estado
              icono="ri-error-warning-line"
              titulo="No pudimos cargar los ejercicios"
              detalle={error}
              error
            />
          ) : ejercicios.length === 0 ? (
            <Estado
              icono="ri-boxing-line"
              titulo="Todavía no hay ejercicios publicados"
              detalle="Los ejercicios activos que cargue el equipo aparecerán aquí automáticamente."
            />
          ) : (
            <>
              <section aria-label="Filtrar por grupo muscular">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                      Zonas musculares
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
                      Elegí qué querés entrenar
                    </h2>
                  </div>
                  {grupoActivo !== TODOS && (
                    <button
                      type="button"
                      onClick={() => setGrupoActivo(TODOS)}
                      className="hidden text-sm font-bold text-primary transition hover:text-[#b8ef45] sm:inline-flex"
                    >
                      Ver todos
                    </button>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:thin]">
                  <FiltroGrupo
                    nombre={TODOS}
                    cantidad={ejercicios.length}
                    activo={grupoActivo === TODOS}
                    onClick={() => setGrupoActivo(TODOS)}
                  />
                  {grupos.map((grupo) => (
                    <FiltroGrupo
                      key={grupo.nombre}
                      nombre={grupo.nombre}
                      cantidad={grupo.ejercicios.length}
                      activo={grupoActivo === grupo.nombre}
                      onClick={() => setGrupoActivo(grupo.nombre)}
                    />
                  ))}
                </div>
              </section>

              <div className="mt-10 space-y-14 sm:mt-14 sm:space-y-20">
                {gruposVisibles.map((grupo) => (
                  <section key={grupo.nombre} aria-labelledby={`grupo-${grupo.nombre}`}>
                    <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4 sm:mb-8">
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
                          <i className="ri-focus-3-line" aria-hidden="true" />
                        </span>
                        <div>
                          <h2
                            id={`grupo-${grupo.nombre}`}
                            className="text-2xl font-black text-foreground sm:text-3xl"
                          >
                            {grupo.nombre}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {grupo.ejercicios.length}{" "}
                            {grupo.ejercicios.length === 1
                              ? "ejercicio disponible"
                              : "ejercicios disponibles"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {grupo.ejercicios.map((ejercicio) => (
                        <TarjetaEjercicio
                          key={ejercicio.idEjercicio}
                          ejercicio={ejercicio}
                          onAbrir={() => setEjercicioSeleccionado(ejercicio)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {ejercicioSeleccionado && (
        <TutorialModal
          ejercicio={ejercicioSeleccionado}
          onCerrar={() => setEjercicioSeleccionado(null)}
        />
      )}
    </Layout>
  );
}

function DatoHero({
  icono,
  valor,
  etiqueta,
}: {
  icono: string;
  valor: number;
  etiqueta: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 backdrop-blur">
      <i className={`${icono} text-xl text-primary`} aria-hidden="true" />
      <span>
        <strong className="mr-1.5 text-lg font-black text-foreground">{valor}</strong>
        <span className="text-sm text-muted-foreground">{etiqueta}</span>
      </span>
    </div>
  );
}

function FiltroGrupo({
  nombre,
  cantidad,
  activo,
  onClick,
}: {
  nombre: string;
  cantidad: number;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
        activo
          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
      }`}
      aria-pressed={activo}
    >
      {nombre}
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          activo ? "bg-black/15" : "bg-secondary"
        }`}
      >
        {cantidad}
      </span>
    </button>
  );
}

function TarjetaEjercicio({
  ejercicio,
  onAbrir,
}: {
  ejercicio: Ejercicio;
  onAbrir: () => void;
}) {
  const puedeAbrir = ejercicio.tieneVideoTutorial;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
      <button
        type="button"
        onClick={onAbrir}
        disabled={!puedeAbrir}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary text-left disabled:cursor-default"
        aria-label={
          puedeAbrir
            ? `Ver video tutorial de ${ejercicio.nombre}`
            : `${ejercicio.nombre} no tiene video tutorial`
        }
      >
        {ejercicio.tieneImagenPreview ? (
          <img
            src={apiUrl(`ejercicios/${ejercicio.idEjercicio}/imagen`)}
            alt={`Vista previa de ${ejercicio.nombre}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/40">
            <i className="ri-image-line" aria-hidden="true" />
          </span>
        )}

        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

        {puedeAbrir ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-black/55 text-3xl text-primary shadow-2xl backdrop-blur transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <i className="ri-play-fill ml-1" aria-hidden="true" />
            </span>
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white/70 backdrop-blur">
            Sin video
          </span>
        )}

        <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {ejercicio.grupoMuscular}
        </span>
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight text-foreground">
            {ejercicio.nombre}
          </h3>
          {puedeAbrir && (
            <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {ejercicio.duracionVideoSegundos
                ? `${ejercicio.duracionVideoSegundos} s`
                : "Video"}
            </span>
          )}
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {ejercicio.descripcion ||
            "Mirá el tutorial para conocer la ejecución de este ejercicio."}
        </p>
      </div>
    </article>
  );
}

function TutorialModal({
  ejercicio,
  onCerrar,
}: {
  ejercicio: Ejercicio;
  onCerrar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onCerrar()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-tutorial"
        className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-card shadow-2xl shadow-black/50"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Tutorial · {ejercicio.grupoMuscular}
            </span>
            <h2
              id="titulo-tutorial"
              className="mt-1 text-xl font-black text-foreground sm:text-2xl"
            >
              {ejercicio.nombre}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border text-xl text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            aria-label="Cerrar tutorial"
          >
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </header>

        <div className="bg-black p-2 sm:p-4">
          <video
            key={ejercicio.idEjercicio}
            src={apiUrl(`ejercicios/${ejercicio.idEjercicio}/video`)}
            poster={
              ejercicio.tieneImagenPreview
                ? apiUrl(`ejercicios/${ejercicio.idEjercicio}/imagen`)
                : undefined
            }
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="mx-auto aspect-video max-h-[65vh] w-full rounded-xl bg-black object-contain"
          >
            Tu navegador no puede reproducir este video.
          </video>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              {ejercicio.grupoMuscular}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground">
              {formatearDuracion(ejercicio.duracionVideoSegundos)}
            </span>
          </div>
          {ejercicio.descripcion && (
            <p className="mt-4 leading-7 text-muted-foreground">
              {ejercicio.descripcion}
            </p>
          )}
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-3 text-sm leading-6 text-muted-foreground">
            <i className="ri-information-line mt-0.5 shrink-0 text-lg text-primary" />
            Si tenés dudas sobre la técnica o sentís molestias, consultá a un
            entrenador antes de continuar.
          </p>
        </div>
      </section>
    </div>
  );
}

function Estado({
  icono,
  titulo,
  detalle,
  error = false,
}: {
  icono: string;
  titulo: string;
  detalle: string;
  error?: boolean;
}) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center">
      <span
        className={`flex size-16 items-center justify-center rounded-2xl text-3xl ${
          error ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
        }`}
      >
        <i className={icono} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl font-black text-foreground">{titulo}</h2>
      <p className="mt-2 max-w-xl text-muted-foreground">{detalle}</p>
    </div>
  );
}
