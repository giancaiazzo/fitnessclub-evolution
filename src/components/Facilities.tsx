import { facilities } from "../data/siteData";

export default function Facilities() {
  return (
    <section id="facilities" className="py-20 bg-background">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-16 text-center">
      <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
        Nuestras instalaciones
      </h2>

      <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
        Espacios equipados y pensados para que entrenes cómodo, seguro y con todo lo necesario para progresar.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility) => (
        <div
          key={facility.title}
          className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:scale-105 hover:border-primary"
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

            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                {facility.title}
              </h3>
            </div>
          </div>

          <div className="p-6">
            <p className="leading-relaxed text-muted-foreground">
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
