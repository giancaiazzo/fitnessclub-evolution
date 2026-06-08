import { features } from "../data/siteData";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-card">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
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
          className="bg-background p-8 rounded-xl border border-border hover:border-primary transition-all transform hover:scale-105"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
            <i className={`${feature.icon} text-4xl text-primary`}></i>
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