import { classSchedule } from "../data/siteData";

export default function ClassSchedule() {
  return (
    <section id="schedule" className="py-20 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Horario de Clases   
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Planifica tu semana con nuestras clases dirigidas por expertos diseñadas para todos los niveles de fitness
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">
                      Tiempo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">
                      Clase
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">
                      Entrenador
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">
                      Accion
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700">
                  {classSchedule.map((schedule) => (
                    <tr
                      key={`${schedule.time}-${schedule.class}-${schedule.trainer}`}
                      className="transition-colors hover:bg-slate-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <i className="ri-time-line text-orange-500" />
                          <span className="font-semibold text-white">
                            {schedule.time}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-white">
                          {schedule.class}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-gray-400">
                          {schedule.trainer}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href="/contact"
                          className="flex items-center gap-2 font-semibold text-orange-500 hover:text-orange-400"
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
            <p className="mb-4 text-gray-400">Ver el horario completo</p>

            <a
              href="/classes"
              className="inline-flex items-center gap-3 rounded-lg bg-orange-500 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-orange-600"
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
