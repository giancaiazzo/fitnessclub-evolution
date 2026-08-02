import { classes } from "../data/siteData";
import { Link } from "react-router-dom";

export default function Classes() {
  return (
  <section id="classes" className="bg-background py-16 sm:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-10 text-center sm:mb-14">
      <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
        Entrenamientos disponibles
      </h2>

      <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Encontrá el entrenamiento ideal para tu nivel, objetivos y estilo de vida.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((classItem, index) => (
        <div
          key={classItem.name}
          className={`flex min-w-0 flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 sm:p-7 ${
            index === classes.length - 1 ? "md:col-span-2 lg:col-span-1" : ""
          }`}
        >
          <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
            <h3 className="min-w-0 text-2xl font-bold text-foreground">
              {classItem.name}
            </h3>

            <span className="whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {classItem.difficulty}
            </span>
          </div>

          <p className="mb-6 flex-1 leading-relaxed text-muted-foreground">
            {classItem.description}
          </p>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <i className="ri-time-line text-primary" />
              <span>{classItem.duration}</span>
            </div>

            <Link
              to="/contact"
              className="flex items-center gap-2 font-semibold text-primary hover:text-[#b8ef45] transition-colors"
            >
              Consultar
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 text-center sm:mt-14">
      <Link
        to="/classes"
        className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
      >
        Ver todos los entrenamientos
        <i className="ri-arrow-right-line" />
      </Link>
    </div>
  </div>
</section>
  );
}
