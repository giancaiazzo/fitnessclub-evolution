import ContactForm from "../MOD1-CLIENTES/components/ContactForm";
import Layout from "../layouts/Layout";
import { contactInfo, siteData, socialLinks } from "../MOD1-CLIENTES/data/siteData";



export default function ContactPage() {
  return (
    <Layout
  title={`Contacto - ${siteData.name}`}
  description="Contactate con FitnessClubEvolution para consultar por servicios, entrenamientos, rutinas y planes"
>
  <section className="bg-gradient-to-br from-background via-card to-background pb-16 pt-28 sm:pb-20 sm:pt-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-foreground sm:text-5xl md:text-6xl">
          Contactanos
        </h1>

        <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
          Estamos para orientarte sobre servicios, entrenamientos, rutinas y planes.
        </p>
      </div>
    </div>
  </section>

  <section className="bg-card py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div>
          <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
            Ponete en contacto
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
            <h3 className="mb-4 text-xl font-semibold text-foreground">
              Seguinos en las redes sociales
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

  <section className="bg-background py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-center text-3xl font-black text-foreground sm:text-4xl">
        ¿Qué podés esperar en tu primera visita?
      </h2>

      <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-muted-foreground sm:mb-12 sm:text-xl">
        Conocé el espacio, conversá con el equipo y encontrá una opción adecuada para comenzar.
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
            conversaremos sobre tus objetivos de entrenamiento.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-group-line text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            Conocé a nuestro equipo
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Te presentaremos a nuestros entrenadores y staff que te apoyarán
            durante tu proceso.
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
            Conocé las alternativas disponibles y consultá cuál se adapta mejor a tu
            disponibilidad y objetivos.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="bg-card py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-background p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="bg-primary/10 p-4 rounded-lg shrink-0">
              <i className="ri-time-line text-4xl text-primary"></i>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Cómo podemos ayudarte
              </h3>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                Podés comunicarte con el gimnasio para resolver dudas y recibir orientación antes de comenzar.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Información general:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Consultá por actividades, servicios, planes y horarios disponibles.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Orientación inicial:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Contanos tu experiencia y tus objetivos para saber por dónde empezar.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Entrenamientos y rutinas:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Preguntá por modalidades, niveles y posibilidades de adaptación.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                  <div>
                    <span className="text-foreground font-semibold">
                      Disponibilidad:
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      Confirmá directamente con el gimnasio antes de reservar o asistir.
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

  <section className="bg-background py-16 sm:py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
      Encontranos
    </h2>

    <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-4 sm:p-8">
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
          className="map-frame"
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
