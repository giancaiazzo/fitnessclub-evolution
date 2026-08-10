import { Link } from "react-router-dom";
import { siteData } from "../data/siteData";
import heroGymImage from "../assets/hero-gym.webp";

const heroStats = [
  { value: "200+", label: "clientes activos" },
  { value: "4", label: "entrenadores" },
  { value: "2012", label: "año de fundación" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-background via-card to-background pb-16 pt-28 sm:pt-32 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="background-dot-grid background-dot-grid--home absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0 text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <i className="ri-map-pin-line" aria-hidden="true" />
              Salto, Uruguay
            </span>

            <h1 className="text-balance text-4xl font-black leading-[1.08] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              {siteData.tagline}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl lg:mx-0">
              {siteData.description}. Entrená con acompañamiento, variedad de
              actividades y una comunidad que te impulsa a progresar.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                to="/services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-[#b8ef45] sm:text-lg"
              >
                Ver servicios
                <i className="ri-arrow-right-line" aria-hidden="true" />
              </Link>

              <Link
                to="/about"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary/70 bg-background/50 px-7 py-3.5 text-base font-bold text-primary transition hover:bg-primary hover:text-primary-foreground sm:text-lg"
              >
                Conocé el gimnasio
                <i className="ri-information-line" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/75 px-2 py-4 backdrop-blur lg:mx-0">
              {heroStats.map((stat) => (
                <div key={stat.label} className="min-w-0 px-2 text-center sm:px-4">
                  <dt className="mt-1 text-[0.68rem] leading-tight text-muted-foreground sm:text-sm">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-black text-primary sm:text-3xl md:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl shadow-black/30 lg:aspect-square">
              <img
                src={heroGymImage}
                alt="Sector de musculación de un gimnasio equipado"
                width={1400}
                height={1000}
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>

            <div className="absolute -bottom-4 left-3 right-3 rounded-2xl border border-primary/30 bg-background/90 p-4 shadow-xl backdrop-blur sm:-bottom-5 sm:left-5 sm:right-auto sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-xl text-primary-foreground sm:h-12 sm:w-12">
                  <i className="ri-award-line" aria-hidden="true" />
                </span>
                <div>
                  <strong className="block text-lg text-foreground">
                    Desde 2012
                  </strong>
                  <span className="text-sm text-muted-foreground">
                    Entrenando junto a Salto
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
