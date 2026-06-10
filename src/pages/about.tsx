
import Layout from "../layouts/Layout.tsx";
import { siteData, trainers, history } from "../MOD1-CLIENTES/data/siteData.ts";


<Layout
  title={`Sobre nosotros - ${siteData.name}`}
  description="Conocé nuestra misión, valores y equipo de entrenadores"
>
  <section className="pt-32 pb-20 bg-linear-to-br from-background via-card to-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Sobre {siteData.name}
        </h1>

        <p className="text-xl text-muted-foreground">
          Estamos dedicados a ayudarte a alcanzar tus objetivos fitness y mejorar tu calidad de vida.
        </p>
      </div>
    </div>
  </section>

  <section className="py-20 bg-card">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground mb-8 text-center">
          Nuestra misión
        </h2>

        <div className="max-w-none">
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            En {siteData.name}, creemos que el entrenamiento no se trata solo de
            fuerza física, sino también de construir confianza, disciplina y una
            mentalidad positiva. Nuestra misión es crear una comunidad inclusiva,
            donde cada persona se sienta bienvenida, acompañada y motivada en su
            proceso de cambio.
          </p>

          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Brindamos instalaciones adecuadas, orientación profesional y un ambiente
            de apoyo que permite a nuestros miembros superar sus límites, mejorar su
            bienestar y alcanzar resultados reales.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
        Nuestros valores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-card p-8 rounded-xl border border-border text-center hover:border-primary transition-all">
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

        <div className="bg-card p-8 rounded-xl border border-border text-center hover:border-primary transition-all">
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

        <div className="bg-card p-8 rounded-xl border border-border text-center hover:border-primary transition-all">
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

  <section className="py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
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

                  <h3 className="text-2xl font-bold text-foreground mb-2">
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

  <section className="py-20 bg-card">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-foreground mb-4 text-center">
        Entrenadores profesionales
      </h2>

      <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
        Conocé a nuestro equipo de profesionales, comprometidos con tu progreso.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {trainers.map((trainer, index) => {
          let extraClassName = "";

          if (index + 1 === 4) {
            extraClassName = "lg:col-start-2";
          } else if (index + 1 === 5) {
            extraClassName = "md:col-start-2 lg:col-start-4";
          }

          return (
            <div
              key={trainer.name}
              className={`bg-background p-8 rounded-xl border border-border hover:border-primary transition-all transform hover:scale-105 md:col-span-2 ${extraClassName}`}
            >
              <div className="text-center mb-6">
                <div className="w-40 h-40 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary/20">
                  <img
                    src={trainer.image}
                    alt={`${trainer.name} - ${trainer.role}`}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
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
                {trainer.certifications.map((cert) => (
                  <span
                    key={`${trainer.name}-${cert}`}
                    className="bg-card text-muted-foreground text-xs px-3 py-1 rounded-full border border-border"
                  >
                    {cert}
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
