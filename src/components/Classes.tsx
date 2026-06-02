import { classes } from "../data/siteData";

export default function Classes() {
  return (
    <section id="classes" className="py-20 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Our Classes
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Find the perfect workout for your fitness level and goals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <div
              key={classItem.name}
              className="rounded-xl border border-slate-700 bg-slate-800 p-8 transition-all hover:scale-105 hover:border-orange-500"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">
                  {classItem.name}
                </h3>

                <span className="whitespace-nowrap rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                  {classItem.difficulty}
                </span>
              </div>

              <p className="mb-6 leading-relaxed text-gray-400">
                {classItem.description}
              </p>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <i className="ri-time-line text-orange-500" />
                  <span>{classItem.duration}</span>
                </div>

                <a
                  href="/contact"
                  className="flex items-center gap-2 font-semibold text-orange-500 hover:text-orange-400"
                >
                  Book Now
                  <i className="ri-arrow-right-line" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/classes"
            className="inline-flex items-center gap-3 rounded-lg bg-orange-500 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-orange-600"
          >
            View All Classes
            <i className="ri-arrow-right-line" />
          </a>
        </div>
      </div>
    </section>
  );
}
