import { testimonials } from "../data/siteData";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        Lo que dicen nuestros miembros
      </h2>

      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Experiencias reales de personas que transformaron su vida junto a nosotros.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.name}
          className="bg-card p-8 rounded-xl border border-border hover:border-primary transition-all transform hover:scale-105"
        >
          <div className="flex items-center gap-1 mb-6">
            {Array.from({ length: testimonial.rating }).map((_, index) => (
              <i
                key={index}
                className="ri-star-fill text-primary text-xl"
              ></i>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6 italic">
            “{testimonial.content}”
          </p>

          <div>
            <h3 className="text-xl font-bold text-foreground">
              {testimonial.name}
            </h3>

            <p className="text-muted-foreground text-sm">
              {testimonial.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}