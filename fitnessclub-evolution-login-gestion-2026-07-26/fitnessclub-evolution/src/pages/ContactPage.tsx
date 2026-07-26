import ContactForm from "../MOD1-CLIENTES/components/ContactForm";
import Layout from "../layouts/Layout";
import { contactInfo, siteData, socialLinks } from "../MOD1-CLIENTES/data/siteData";



export default function ContactPage() {
  return (
    <Layout
  title={`Contact Us - ${siteData.name}`}
  description="Get in touch with us to start your fitness journey"
>
  <section className="pt-32 pb-20 bg-gradient-to-br from-background via-card to-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Contactanos
        </h1>

        <p className="text-xl text-muted-foreground">
          Estamos aqui para ayudarte en tu viaje fitness. ¡Contáctanos hoy mismo!
        </p>
      </div>
    </div>
  </section>

  <section className="py-20 bg-card">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Ponerme en contacto
          </h2>

          <div className="space-y-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="flex items-start gap-4">
                <div className="bg-primary p-4 rounded-lg shrink-0">
                  <i className={`${info.icon} text-2xl text-primary-foreground`}></i>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {info.title}
                  </h3>

                  {Array.isArray(info.content) ? (
                    info.content.map((line) => (
                      <p
                        key={`${info.title}-${line}`}
                        className="text-muted-foreground leading-relaxed"
                      >
                        {line}
                      </p>
                    ))
                  ) : info.link ? (
                    <a
                      href={info.link}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {info.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Siguenos en las redes sociales
            </h3>

            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const socialUrl =
                  siteData.social[
                    social.name as keyof typeof siteData.social
                  ];

                return (
                  <a
                    key={social.name}
                    href={socialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-secondary hover:bg-primary rounded-lg flex items-center justify-center transition-all"
                    aria-label={social.label}
                  >
                    <i className={`${social.icon} text-xl text-foreground hover:text-primary-foreground`}></i>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  </section>

  <section className="py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-foreground mb-4 text-center">
        Que esperar cuando nos visitas?
      </h2>

      <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
        Tu primera visita es importante para nosotros. Aquí está lo que puedes esperar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
        <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-search-line text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            Tour y consultas
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Te daremos un recorrido completo por nuestras instalaciones y
            discutiremos tus objetivos de fitness
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-group-line text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            Conoce a nuestro equipo
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Te presentaremos a nuestros entrenadores y staff que te apoyarán
            en tu viaje
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-3-line text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            Opciones de membresía
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Explora nuestros planes de membresía flexibles diseñados para adaptarse a tu
            estilo de vida y presupuesto
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="py-20 bg-card">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-background p-8 rounded-xl border border-border">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="bg-primary/10 p-4 rounded-lg shrink-0">
              <i className="ri-time-line text-4xl text-primary"></i>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Tiempo de respuesta esperado
              </h3>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                Estamos comprometidos a responder a todas las consultas de manera oportuna. Aquí hay una guía general de nuestros tiempos de respuesta:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Preguntas por email:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Respondemos dentro de las 24 horas durante los días hábiles
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Llamadas telefonicas:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Disponibles durante las horas de atención (8 AM - 10 PM)
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Envío de formularios:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Confirmación dentro de 2 horas, respuesta completa dentro de 24
                      horas
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Asuntos urgentes:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Llámanos directamente para asistencia inmediata
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="py-20 bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
      Encontranos
    </h2>

    <div className="max-w-5xl mx-auto bg-card p-8 rounded-xl border border-border">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          FitnessClubEvolution
        </h3>

        <p className="text-muted-foreground">
          Dr. Luis Alberto de Herrera 231, 50000 Salto, Departamento de Salto
        </p>
      </div>

      <div className="aspect-video rounded-lg overflow-hidden border border-border">
        <iframe
          title="Ubicación de FitnessClubEvolution"
          src="https://www.google.com/maps?q=Fit%20Evolution%2C%20Dr.%20Luis%20Alberto%20de%20Herrera%20231%2C%2050000%20Salto%2C%20Departamento%20de%20Salto&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        ></iframe>
      </div>

      <div className="mt-6 flex justify-center">
        <a
          href="https://www.google.com/maps/search/?api=1&query=Fit%20Evolution%2C%20Dr.%20Luis%20Alberto%20de%20Herrera%20231%2C%2050000%20Salto%2C%20Departamento%20de%20Salto"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
        >
          Abrir en Google Maps
          <i className="ri-map-pin-line text-lg"></i>
        </a>
      </div>
    </div>
  </div>
</section>
</Layout>
  );
}
