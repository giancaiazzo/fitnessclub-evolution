import { facilities } from "../data/siteData";

export default function Facilities() {
  return (
    <section id="facilities" className="py-20 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Our Facilities
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            World-class equipment and spaces designed for your success
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <div
              key={facility.title}
              className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-800 transition-all hover:scale-105 hover:border-orange-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={facility.image}
                  alt={facility.title}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    {facility.title}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="leading-relaxed text-gray-400">
                  {facility.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
