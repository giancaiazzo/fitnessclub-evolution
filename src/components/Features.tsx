import { features } from "../data/siteData";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Por qué nosotros?
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Todo lo que necesitás para alcanzar tus objetivos de fitness en un
            solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-900 p-8 rounded-xl border border-slate-700 hover:border-orange-500 transition-all transform hover:scale-105"
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center mb-6">
                <i className={`${feature.icon} text-4xl text-orange-500`}></i>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}