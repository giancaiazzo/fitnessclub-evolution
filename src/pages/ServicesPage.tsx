import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../layouts/Layout";
import heroGymImage from "../MOD1-CLIENTES/assets/hero-gym.webp";
import { classes, routines, siteData } from "../MOD1-CLIENTES/data/siteData";
import {
  apiFetch,
  apiUrl,
  mensajeErrorHttp,
} from "../MOD2-GESTION/services/api";
import {
  formatearPrecioServicio,
  type Servicio,
} from "../types/servicio";

const sectionShortcuts = [
  {
    id: "servicios",
    label: "Servicios",
    detail: "Todo lo disponible para acompañar tu proceso",
    icon: "ri-service-line",
  },
  {
    id: "entrenamientos",
    label: "Entrenamientos",
    detail: "Opciones para distintos objetivos y niveles",
    icon: "ri-run-line",
  },
  {
    id: "rutinas",
    label: "Rutinas",
    detail: "Planificaciones que se adaptan a cada persona",
    icon: "ri-file-list-3-line",
  },
];

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function ServicesPage() {
  // Este estado contiene exactamente lo que existe en la tabla Servicios.
  // No se usa un listado local como respaldo para evitar mostrar datos borrados.
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState("");
  const [intentoCarga, setIntentoCarga] = useState(0);

  // Cada ingreso a la página (o reintento manual) consulta nuevamente el CRUD.
  useEffect(() => {
    const controlador = new AbortController();

    async function cargarServicios() {
      try {
        setCargandoServicios(true);
        setErrorServicios("");

        const respuesta = await apiFetch("servicios", {
          signal: controlador.signal,
        });

        if (!respuesta.ok) {
          throw new Error(
            await mensajeErrorHttp(
              respuesta,
              "No se pudieron cargar los servicios disponibles.",
            ),
          );
        }

        setServicios((await respuesta.json()) as Servicio[]);
      } catch (errorDesconocido) {
        if (controlador.signal.aborted) return;
        setErrorServicios(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar los servicios disponibles.",
        );
      } finally {
        if (!controlador.signal.aborted) setCargandoServicios(false);
      }
    }

    void cargarServicios();
    return () => controlador.abort();
  }, [intentoCarga]);

  return (
    <Layout
      title={`Servicios y entrenamientos - ${siteData.name}`}
      description="Conocé los servicios, entrenamientos y rutinas disponibles en FitnessClubEvolution"
    >
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="background-dot-grid background-dot-grid--catalog pointer-events-none absolute inset-0 opacity-[0.08]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="min-w-0 text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <i className="ri-heart-pulse-line" aria-hidden="true" />
              Entrenamiento para cada etapa
            </span>

            <h1 className="text-balance text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Encontrá una propuesta que se adapte a vos
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
              Conocé los servicios del gimnasio, las modalidades de entrenamiento
              y ejemplos de rutinas que pueden ajustarse a tu nivel y tus objetivos.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={() => scrollToSection("servicios")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-[#b8ef45]"
              >
                Explorar propuestas
                <i className="ri-arrow-down-line" aria-hidden="true" />
              </button>

              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-background/70 px-6 py-3 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                Consultar disponibilidad
                <i className="ri-chat-1-line" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-black/30">
              <img
                src={heroGymImage}
                alt="Sala de entrenamiento equipada con pesas y máquinas"
                width={1400}
                height={1000}
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-background/85 p-3 backdrop-blur sm:inset-x-6 sm:bottom-6 sm:gap-4 sm:p-4">
              <div className="text-center">
                <strong className="block text-xl font-black text-primary sm:text-2xl">
                  {cargandoServicios ? "—" : servicios.length}
                </strong>
                <span className="text-[0.68rem] text-muted-foreground sm:text-sm">
                  servicios
                </span>
              </div>
              <div className="border-x border-border text-center">
                <strong className="block text-xl font-black text-primary sm:text-2xl">
                  {classes.length}
                </strong>
                <span className="text-[0.68rem] text-muted-foreground sm:text-sm">
                  entrenamientos
                </span>
              </div>
              <div className="text-center">
                <strong className="block text-xl font-black text-primary sm:text-2xl">
                  {routines.length}
                </strong>
                <span className="text-[0.68rem] text-muted-foreground sm:text-sm">
                  rutinas base
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card py-8 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:gap-5 lg:px-8">
          {sectionShortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              type="button"
              onClick={() => scrollToSection(shortcut.id)}
              className="group flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 sm:block sm:text-center lg:flex lg:text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl text-primary transition group-hover:bg-primary group-hover:text-primary-foreground sm:mx-auto sm:mb-3 lg:mx-0 lg:mb-0">
                <i className={shortcut.icon} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className="block text-lg text-foreground">
                  {shortcut.label}
                </strong>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                  {shortcut.detail}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section id="servicios" className="scroll-mt-24 bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="font-bold uppercase tracking-[0.2em] text-primary">
              Servicios
            </span>
            <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
              Acompañamiento dentro y fuera de cada sesión
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Distintas alternativas para entrenar con organización, orientación y
              un seguimiento acorde a cada proceso.
            </p>
          </div>

          {cargandoServicios ? (
            <EstadoServicios
              icono="ri-loader-4-line animate-spin"
              titulo="Cargando servicios..."
              detalle="Estamos consultando las opciones disponibles en el gimnasio."
            />
          ) : errorServicios ? (
            <EstadoServicios
              icono="ri-error-warning-line"
              titulo="No pudimos cargar los servicios"
              detalle={errorServicios}
              error
              onReintentar={() => setIntentoCarga((intento) => intento + 1)}
            />
          ) : servicios.length === 0 ? (
            <EstadoServicios
              icono="ri-service-line"
              titulo="Todavía no hay servicios publicados"
              detalle="Los servicios que cargue el equipo desde Gestión aparecerán aquí automáticamente."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicios.map((servicio) => (
                <TarjetaServicio key={servicio.idServicio} servicio={servicio} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="entrenamientos" className="scroll-mt-24 bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="font-bold uppercase tracking-[0.2em] text-primary">
              Entrenamientos
            </span>
            <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
              Opciones para moverte, progresar y disfrutar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Elegí la modalidad que más se acerque a tus objetivos. El equipo puede
              orientarte para comenzar por la alternativa adecuada.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((training, index) => (
              <article
                key={training.name}
                className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 ${
                  index === classes.length - 1
                    ? "sm:col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={training.image}
                    alt={`Entrenamiento de ${training.name}`}
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-primary backdrop-blur">
                    {training.difficulty}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      {training.name}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <i className="ri-time-line text-primary" aria-hidden="true" />
                      {training.duration}
                    </span>
                  </div>

                  <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
                    {training.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                    <i className="ri-user-star-line text-primary" aria-hidden="true" />
                    <span>{training.trainer}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/classes"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-[#b8ef45]"
            >
              Ver detalles y horarios
              <i className="ri-arrow-right-line" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="rutinas" className="scroll-mt-24 bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="font-bold uppercase tracking-[0.2em] text-primary">
              Rutinas
            </span>
            <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
              Una planificación clara para cada objetivo
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Estas propuestas muestran cómo puede organizarse el entrenamiento. La
              rutina final se adapta a la experiencia, disponibilidad y evolución de
              cada cliente.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {routines.map((routine) => (
              <article
                key={routine.name}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                  <img
                    src={routine.image}
                    alt={`Rutina de ${routine.name}`}
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground">
                    {routine.level}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">
                    {routine.objective}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-foreground">
                    {routine.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {routine.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-background p-4 text-sm">
                    <div>
                      <span className="block text-muted-foreground">Frecuencia</span>
                      <strong className="mt-1 block text-foreground">
                        {routine.frequency}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-muted-foreground">Duración</span>
                      <strong className="mt-1 block text-foreground">
                        {routine.duration}
                      </strong>
                    </div>
                  </div>

                  <ul className="mt-5 grid grid-cols-2 gap-2">
                    {routine.focus.map((focusItem) => (
                      <li
                        key={`${routine.name}-${focusItem}`}
                        className="flex min-w-0 items-start gap-2 text-sm text-muted-foreground"
                      >
                        <i
                          className="ri-check-line mt-0.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{focusItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-[#86c312] py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-black text-primary-foreground sm:text-4xl">
            ¿No sabés por dónde empezar?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Contanos qué querés lograr y el equipo te orientará sobre los servicios,
            entrenamientos y rutinas disponibles.
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-background px-7 py-3 font-bold text-primary shadow-lg transition hover:bg-card"
          >
            Hablar con el gimnasio
            <i className="ri-arrow-right-line" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}

/** Tarjeta pública construida únicamente con los datos guardados por el CRUD. */
function TarjetaServicio({ servicio }: { servicio: Servicio }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {servicio.tieneImagen ? (
          <img
            src={apiUrl(`servicios/${servicio.idServicio}/imagen`)}
            alt={`Imagen del servicio ${servicio.nombre}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-background text-6xl text-primary/40">
            <i className="ri-service-line" aria-hidden="true" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
        {servicio.duracion && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <i className="ri-time-line text-primary" aria-hidden="true" />
            {servicio.duracion}
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1.5 text-sm font-black text-primary-foreground shadow-lg">
          {formatearPrecioServicio(servicio.precio)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-2xl font-bold leading-tight text-foreground">
          {servicio.nombre}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
          {servicio.descripcion ||
            "Consultá al equipo para conocer todos los detalles de este servicio."}
        </p>
        <Link
          to="/contact"
          className="mt-5 inline-flex min-h-11 items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
          aria-label={`Consultar por ${servicio.nombre}`}
        >
          Consultar
          <i className="ri-arrow-right-line" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/** Estado común para carga, error y catálogo vacío. */
function EstadoServicios({
  icono,
  titulo,
  detalle,
  error = false,
  onReintentar,
}: {
  icono: string;
  titulo: string;
  detalle: string;
  error?: boolean;
  onReintentar?: () => void;
}) {
  return (
    <div
      className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center"
      role={error ? "alert" : "status"}
    >
      <span
        className={`flex size-16 items-center justify-center rounded-2xl text-3xl ${
          error ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
        }`}
      >
        <i className={icono} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-2xl font-black text-foreground">{titulo}</h3>
      <p className="mt-2 max-w-xl text-muted-foreground">{detalle}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground transition hover:bg-[#b8ef45]"
        >
          <i className="ri-refresh-line" aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}
