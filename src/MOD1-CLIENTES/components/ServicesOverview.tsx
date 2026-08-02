import { Link } from "react-router-dom";
import gymEquipmentImage from "../assets/gym-equipment.webp";
import mobilityTrainingImage from "../assets/mobility-training.webp";
import strengthTrainingImage from "../assets/strength-training.webp";

const categories = [
  {
    title: "Servicios",
    description:
      "Sala de musculación, entrenamiento guiado, seguimiento y propuestas de bienestar.",
    image: gymEquipmentImage,
    icon: "ri-service-line",
  },
  {
    title: "Entrenamientos",
    description:
      "Musculación, funcional, crossfit, taekwondo y actividades adaptadas a distintos niveles.",
    image: strengthTrainingImage,
    icon: "ri-run-line",
  },
  {
    title: "Rutinas",
    description:
      "Planificaciones organizadas según experiencia, disponibilidad y objetivos personales.",
    image: mobilityTrainingImage,
    icon: "ri-file-list-3-line",
  },
];

export default function ServicesOverview() {
  return (
    <section className="bg-card py-16 sm:py-20" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <span className="font-bold uppercase tracking-[0.2em] text-primary">
            Nuestra propuesta
          </span>
          <h2
            id="services-heading"
            className="mt-3 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl"
          >
            Todo lo que necesitás para avanzar
          </h2>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Descubrí los servicios, entrenamientos y rutinas disponibles en el
            gimnasio antes de elegir cómo comenzar.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.title}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <img
                  src={category.image}
                  alt={`Imagen representativa de ${category.title.toLowerCase()}`}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                <span className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl text-primary-foreground shadow-lg">
                  <i className={category.icon} aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-2xl font-bold text-foreground">
                  {category.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <Link
                  to="/services"
                  className="mt-5 inline-flex min-h-11 items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
                  aria-label={`Ver ${category.title.toLowerCase()}`}
                >
                  Ver opciones
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
