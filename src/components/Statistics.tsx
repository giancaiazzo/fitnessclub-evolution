
import { statistics } from "../data/siteData";

export default function Statistics() {
  return (
   <section
  id="statistics"
  className="py-20 bg-gradient-to-br from-background via-card to-background"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        Nuestros números
      </h2>

      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Nuestro compromiso con la calidad se refleja en cada resultado.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {statistics.map((stat) => (
        <div
          key={stat.label}
          className="bg-card/70 backdrop-blur-sm p-6 rounded-xl border border-border text-center hover:border-primary transition-all transform hover:scale-105"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className={`${stat.icon} text-3xl text-primary`}></i>
          </div>

          <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {stat.number}
          </div>

          <div className="text-muted-foreground text-sm md:text-base">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}