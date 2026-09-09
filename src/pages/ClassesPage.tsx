import Layout from "../layouts/Layout";
import { Link } from "react-router-dom";
import { classes, fullSchedule, siteData } from "../MOD1-CLIENTES/data/siteData";

type DayKey = keyof typeof fullSchedule;
type ScheduleSlot = (typeof fullSchedule)[DayKey][number];

const days: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
];

function convertirHoraAMinutos(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

function obtenerHorariosOrdenados() {
  const todosLosHorarios = new Set<string>();

  Object.values(fullSchedule).forEach((horarioDelDia) => {
    horarioDelDia.forEach((bloque) => {
      todosLosHorarios.add(bloque.time);
    });
  });

  return Array.from(todosLosHorarios).sort(
    (a, b) => convertirHoraAMinutos(a) - convertirHoraAMinutos(b)
  );
}

function encontrarClaseEnHorario(horarioDelDia: ScheduleSlot[], time: string) {
  return horarioDelDia.find((bloque) => bloque.time === time);
}

export default function ClassesPage() {
  const horariosOrdenados = obtenerHorariosOrdenados();

  return (
    <Layout
      title={`Clases - ${siteData.name}`}
      description="Explorá nuestra variedad de clases y entrenamientos"
    >
      <section className="bg-gradient-to-br from-background via-card to-background pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-black text-foreground sm:text-5xl md:text-6xl">
              Nuestros entrenamientos
            </h1>

            <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
              Encontrá el entrenamiento ideal según tu nivel, objetivos y estilo de vida.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-12">
            {classes.map((classItem) => (
              <div
                key={classItem.name}
                className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative aspect-[16/10] min-h-64 overflow-hidden bg-secondary lg:aspect-auto lg:min-h-full">
                    <img
                      src={classItem.image}
                      alt={classItem.name}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-semibold">
                        {classItem.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {classItem.name}
                      </h2>

                      <div className="flex items-center text-muted-foreground gap-2">
                        <i className="ri-time-line text-primary"></i>
                        <span>{classItem.duration}</span>
                      </div>
                    </div>

                    <p className="mb-4 leading-relaxed text-muted-foreground sm:text-lg">
                      {classItem.detailedDescription}
                    </p>

                    <div className="mb-6">
                      <p className="text-foreground font-semibold mb-2">
                        Entrenador:{" "}
                        <span className="text-primary">
                          {classItem.trainer}
                        </span>
                      </p>

                      <p className="text-muted-foreground text-sm">
                        Qué esperar: {classItem.whatToExpect}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-foreground font-semibold mb-3">
                        Beneficios principales:
                      </h4>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {classItem.benefits.map((benefit) => (
                          <li
                            key={`${classItem.name}-${benefit}`}
                            className="flex items-center gap-2 text-muted-foreground text-sm"
                          >
                            <i className="ri-checkbox-circle-fill text-primary"></i>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to="/contact"
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-[#b8ef45] sm:w-auto"
                    >
                      Consultar disponibilidad
                      <i className="ri-arrow-right-line"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-black text-foreground sm:text-4xl">
            Horario semanal completo
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-muted-foreground sm:mb-12 sm:text-xl">
            Organizá tu semana con nuestro calendario completo de clases.
          </p>

          <div className="space-y-3 md:hidden">
            {days.map((day) => (
              <details
                key={day.key}
                className="group rounded-xl border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 font-bold text-foreground">
                  {day.label}
                  <i
                    className="ri-arrow-down-s-line text-xl text-primary transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="space-y-2 border-t border-border p-3">
                  {fullSchedule[day.key].map((slot) => (
                    <div
                      key={`${day.key}-${slot.time}-${slot.class}`}
                      className="flex items-start justify-between gap-3 rounded-lg bg-background p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{slot.class}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {slot.trainer}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-sm font-bold text-primary">
                        {slot.time}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card p-6 md:block lg:p-8">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 pr-4 text-foreground font-semibold">
                    Hora
                  </th>

                  {days.map((day) => (
                    <th
                      key={day.key}
                      className="pb-4 px-4 text-foreground font-semibold"
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-muted-foreground">
                {horariosOrdenados.map((time) => (
                  <tr
                    key={time}
                    className="border-b border-border/50 hover:bg-secondary/60 transition-colors"
                  >
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      {time}
                    </td>

                    {days.map((day) => {
                      const claseDelHorario = encontrarClaseEnHorario(
                        fullSchedule[day.key],
                        time
                      );

                      return (
                        <td key={`${day.key}-${time}`} className="py-3 px-4">
                          {claseDelHorario ? (
                            <div>
                              <div className="font-medium text-foreground">
                                {claseDelHorario.class}
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {claseDelHorario.trainer}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              * CrossFit se dicta lunes, miércoles y viernes. La sala de musculación cuenta con acompañamiento de lunes a viernes.
            </p>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground md:hidden">
            CrossFit se dicta lunes, miércoles y viernes. Confirmá disponibilidad antes de asistir.
          </p>
        </div>
      </section>
    </Layout>
  );
}
