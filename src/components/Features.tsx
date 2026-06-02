import { features } from "../data/siteData";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Why Choose Us
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Everything you need to achieve your fitness goals in one place
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-700 bg-slate-900 p-8 transition-all hover:scale-105 hover:border-orange-500"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-500/10">
                <i className={`${feature.icon} text-4xl text-orange-500`} />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
