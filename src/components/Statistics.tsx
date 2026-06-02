
import { statistics } from "../data/siteData";

export default function Statistics() {
  return (
    <section
      id="statistics"
      className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            By The Numbers
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our commitment to excellence shows in every metric
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statistics.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all transform hover:scale-105"
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className={`${stat.icon} text-3xl text-orange-500`}></i>
              </div>

              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
                {stat.number}
              </div>

              <div className="text-gray-300 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}