import { Link } from "react-router-dom";
import { classSchedule } from "../data/siteData";

export default function ClassSchedule() {
  return (
    <section id="schedule" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
            Horario de entrenamientos
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Una referencia rápida para organizar tu día. Confirmá la disponibilidad
            antes de asistir.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="space-y-3 sm:hidden">
            {classSchedule.map((schedule) => (
              <article
                key={`${schedule.time}-${schedule.class}-${schedule.trainer}`}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground">{schedule.class}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {schedule.trainer}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-sm font-bold text-primary">
                    <i className="ri-time-line" aria-hidden="true" />
                    {schedule.time}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead className="bg-background">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground lg:px-6">
                      Hora
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground lg:px-6">
                      Entrenamiento
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground lg:px-6">
                      Entrenador
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground lg:px-6">
                      Consulta
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {classSchedule.map((schedule) => (
                    <tr
                      key={`${schedule.time}-${schedule.class}-${schedule.trainer}`}
                      className="transition-colors hover:bg-secondary/60"
                    >
                      <td className="whitespace-nowrap px-5 py-4 lg:px-6">
                        <div className="flex items-center gap-2">
                          <i className="ri-time-line text-primary" aria-hidden="true" />
                          <span className="font-semibold text-foreground">
                            {schedule.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 lg:px-6">
                        <span className="font-medium text-foreground">
                          {schedule.class}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground lg:px-6">
                        {schedule.trainer}
                      </td>
                      <td className="px-5 py-4 lg:px-6">
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-[#b8ef45]"
                        >
                          Consultar
                          <i className="ri-arrow-right-line" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/classes"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground transition hover:bg-[#b8ef45] sm:text-lg"
            >
              Ver calendario completo
              <i className="ri-calendar-line" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
