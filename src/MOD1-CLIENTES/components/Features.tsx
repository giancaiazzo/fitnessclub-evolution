import { features } from "../data/siteData";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 drop-shadow-[0_0_10px_rgba(159,220,26,0.35)]">
            ¿Por qué nosotros?
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitás para alcanzar tus objetivos de fitness en un
            solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-8 rounded-xl border border-primary/20 hover:border-primary transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
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