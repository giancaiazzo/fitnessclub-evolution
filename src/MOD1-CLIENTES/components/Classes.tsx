import { classes } from "../data/siteData";

export default function Classes() {
  return (
  <section id="classes" className="py-20 bg-background">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-16 text-center">
      <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
        Nuestras clases
      </h2>

      <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
        Encontrá el entrenamiento ideal para tu nivel, objetivos y estilo de vida.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((classItem) => (
        <div
          key={classItem.name}
          className="rounded-xl border border-border bg-card p-8 transition-all hover:scale-105 hover:border-primary"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <h3 className="text-2xl font-bold text-foreground">
              {classItem.name}
            </h3>

            <span className="whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {classItem.difficulty}
            </span>
          </div>

          <p className="mb-6 leading-relaxed text-muted-foreground">
            {classItem.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <i className="ri-time-line text-primary" />
              <span>{classItem.duration}</span>
            </div>

            <a
              href="/contact"
              className="flex items-center gap-2 font-semibold text-primary hover:text-[#b8ef45] transition-colors"
            >
              Reservar ahora
              <i className="ri-arrow-right-line" />
            </a>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-16 text-center">
      <a
        href="/classes"
        className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
      >
        Ver todas las clases
        <i className="ri-arrow-right-line" />
      </a>
    </div>
  </div>
</section>
  );
}
