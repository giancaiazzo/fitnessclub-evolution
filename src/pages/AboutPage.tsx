import Layout from "../layouts/Layout";
import { history, siteData, trainers } from "../MOD1-CLIENTES/data/siteData";

export default function AboutPage() {
  return (
   <Layout
  title={`Sobre nosotros - ${siteData.name}`}
  description="Conocé nuestra misión, valores y equipo de entrenadores"
>
  <section className="bg-gradient-to-br from-background via-card to-background pb-16 pt-28 sm:pb-20 sm:pt-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="break-words text-4xl font-black leading-tight text-foreground sm:text-5xl md:text-6xl">
          Sobre {siteData.name}
        </h1>

        <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
          Nos dedicamos a mejorar tu vida de manera integral.
        </p>
      </div>
    </div>
  </section>

  <section className="bg-card py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-8 text-center text-3xl font-black text-foreground sm:text-4xl">
          Nuestra misión
        </h2>

        <div className="max-w-none">
          <p className="mb-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            En {siteData.name}, creemos que el entrenamiento no se trata solo de
            fuerza física, sino también de construir confianza, disciplina y una
            mentalidad positiva. Nuestra misión es crear una comunidad inclusiva,
            donde cada persona se sienta bienvenida, acompañada y motivada en su
            proceso de cambio.
          </p>

          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Brindamos instalaciones adecuadas, orientación profesional y un ambiente
            de apoyo que permite a nuestros miembros superar sus límites, mejorar
            su bienestar y alcanzar resultados reales.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="bg-background py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="mb-10 text-center text-3xl font-black text-foreground sm:mb-12 sm:text-4xl">
        Nuestros valores
      </h2>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        <div className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary sm:p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
            <i className="ri-trophy-line text-4xl text-primary"></i>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">
            Excelencia
          </h3>

          <p className="text-muted-foreground leading-relaxed">
            Buscamos la excelencia en cada detalle, desde nuestras instalaciones
            hasta la atención y el acompañamiento que brindamos.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary sm:p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
            <i className="ri-hand-heart-line text-4xl text-primary"></i>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">
            Comunidad
          </h3>

          <p className="text-muted-foreground leading-relaxed">
            Construimos un espacio de apoyo, respeto y motivación, donde cada
            persona pueda crecer y avanzar a su ritmo.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary sm:p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
            <i className="ri-focus-3-line text-4xl text-primary"></i>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">
            Resultados
          </h3>

          <p className="text-muted-foreground leading-relaxed">
            Trabajamos con objetivos claros, buscando resultados reales, medibles
            y sostenibles para cada miembro.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="bg-background py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="mb-10 text-center text-3xl font-black text-foreground sm:mb-12 sm:text-4xl">
        Nuestro camino
      </h2>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30 hidden md:block"></div>

          <div className="space-y-12">
            {history.map((milestone) => (
              <div
                key={`${milestone.year}-${milestone.title}`}
                className="relative flex items-start gap-6"
              >
                <div className="hidden md:block shrink-0">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center border-4 border-background">
                    <span className="text-primary-foreground font-bold text-sm">
                      {milestone.year}
                    </span>
                  </div>
                </div>

                <div className="flex-1 bg-card p-6 rounded-xl border border-border hover:border-primary transition-all">
                  <div className="md:hidden mb-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                      {milestone.year}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
                    {milestone.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="bg-card py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-center text-3xl font-black text-foreground sm:text-4xl">
        Entrenadores profesionales
      </h2>

      <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-muted-foreground sm:mb-12 sm:text-xl">
        Conocé a nuestro equipo de profesionales, comprometidos con tu progreso.
      </p>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {trainers.map((trainer) => {
          const initials = trainer.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("");

          return (
      <div
        key={trainer.name}
        className="min-w-0 rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
      >
              <div className="text-center mb-6">
                <div
                  className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/25 to-primary/5 text-3xl font-black text-primary"
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {trainer.name}
                </h3>

                <p className="text-primary mb-1 font-semibold">
                  {trainer.role}
                </p>

                <p className="text-muted-foreground text-sm mb-3">
                  {trainer.specialization}
                </p>

                <p className="text-muted-foreground/70 text-xs">
                  {trainer.experience} de experiencia
                </p>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center">
                {trainer.bio}
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {trainer.certifications.map((certification) => (
                  <span
                    key={`${trainer.name}-${certification}`}
                    className="bg-card text-muted-foreground text-xs px-3 py-1 rounded-full border border-border"
                  >
                    {certification}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
</Layout>
  );
}
