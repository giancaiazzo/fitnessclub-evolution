import { features } from "../data/siteData";

export default function Features() {
  return (
    <section id="features" className="bg-background py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="mb-4 text-3xl font-black text-foreground drop-shadow-[0_0_10px_rgba(159,220,26,0.35)] sm:text-4xl md:text-5xl">
            ¿Por qué nosotros?
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Todo lo que necesitás para alcanzar tus objetivos de fitness en un
            solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="min-w-0 rounded-2xl border border-primary/20 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/20 sm:p-8"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20 shadow-md shadow-primary/10">
                <i className={`${feature.icon} text-4xl text-primary drop-shadow-[0_0_8px_rgba(159,220,26,0.55)]`}></i>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
