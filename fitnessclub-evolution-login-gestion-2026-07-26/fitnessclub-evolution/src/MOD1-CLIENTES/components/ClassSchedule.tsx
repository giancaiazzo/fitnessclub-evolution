import { classSchedule } from "../data/siteData";

export default function ClassSchedule() {
  return (
    <section id="schedule" className="py-20 bg-background">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-16 text-center">
      <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
        Horario de clases
      </h2>

      <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
        Planificá tu semana con nuestras clases dirigidas por profesionales y pensadas para distintos niveles de entrenamiento.
      </p>
    </div>

    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground">
                  Hora
                </th>

                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground">
                  Clase
                </th>

                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground">
                  Entrenador
                </th>

                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-foreground">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {classSchedule.map((schedule) => (
                <tr
                  key={`${schedule.time}-${schedule.class}-${schedule.trainer}`}
                  className="transition-colors hover:bg-secondary/60"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <i className="ri-time-line text-primary" />
                      <span className="font-semibold text-foreground">
                        {schedule.time}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">
                      {schedule.class}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">
                      {schedule.trainer}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <a
                      href="/contact"
                      className="flex items-center gap-2 font-semibold text-primary hover:text-[#b8ef45] transition-colors"
                    >
                      Reservar
                      <i className="ri-arrow-right-line" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="mb-4 text-muted-foreground">
          Ver el horario completo
        </p>

        <a
          href="/classes"
          className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
        >
          Calendario completo
          <i className="ri-calendar-line" />
        </a>
      </div>
    </div>
  </div>
</section>
  );
}
