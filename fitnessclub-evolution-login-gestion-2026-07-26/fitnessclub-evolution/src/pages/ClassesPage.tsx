import Layout from "../layouts/Layout";
import { classes, fullSchedule, siteData } from "../MOD1-CLIENTES/data/siteData";

type DayKey = keyof typeof fullSchedule;
type ScheduleSlot = (typeof fullSchedule)[DayKey][number];

const days: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

function convertirHoraAMinutos(time: string) {
  const [rawTime, period] = time.split(" ");
  const [rawHour, rawMinute] = rawTime.split(":");

  let hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
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
      <section className="pt-32 pb-20 bg-gradient-to-br from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Nuestras clases
            </h1>

            <p className="text-xl text-muted-foreground">
              Encontrá el entrenamiento ideal según tu nivel, objetivos y estilo de vida.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {classes.map((classItem) => (
              <div
                key={classItem.name}
                className="bg-background rounded-xl border border-border overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <img
                      src={classItem.image}
                      alt={classItem.name}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-semibold">
                        {classItem.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h2 className="text-3xl font-bold text-foreground">
                        {classItem.name}
                      </h2>

                      <div className="flex items-center text-muted-foreground gap-2">
                        <i className="ri-time-line text-primary"></i>
                        <span>{classItem.duration}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
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

                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-[#86c312] text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Reservar esta clase
                      <i className="ri-arrow-right-line"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-center">
            Horario semanal completo
          </h2>

          <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Organizá tu semana con nuestro calendario completo de clases.
          </p>

          <div className="bg-card p-8 rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
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

            <p className="text-muted-foreground text-center mt-6 text-sm">
              * Los horarios pueden variar. Contactanos para confirmar los horarios actualizados o reservar tu lugar.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
