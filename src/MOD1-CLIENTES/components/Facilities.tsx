import { facilities } from "../data/siteData";

export default function Facilities() {
  return (
    <section id="facilities" className="bg-background py-16 sm:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-10 text-center sm:mb-14">
      <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
        Nuestras instalaciones
      </h2>

      <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Espacios equipados y pensados para que entrenes cómodo, seguro y con todo lo necesario para progresar.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
      {facilities.map((facility) => (
        <div
          key={facility.title}
          className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
        >
          <div className="relative h-64 overflow-hidden">
            <img
              src={facility.image}
              alt={facility.title}
              width={800}
              height={600}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
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
